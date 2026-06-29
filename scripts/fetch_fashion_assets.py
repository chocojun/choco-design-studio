#!/usr/bin/env python3
"""Download fashion reference images into public/assets.

The script prefers the official Pexels API when PEXELS_API_KEY is set. If no
API key is available, it falls back to a lightweight BeautifulSoup parser for
Pexels search pages. The fallback is best-effort because public HTML can change.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import quote_plus, urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from PIL import Image, UnidentifiedImageError


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "public" / "assets"
DEFAULT_QUERIES = ("fashion portrait", "clothing template")
PEXELS_API_URL = "https://api.pexels.com/v1/search"
PEXELS_SEARCH_URL = "https://www.pexels.com/search/{query}/"
USER_AGENT = (
    "Mozilla/5.0 (compatible; FashionAssetFetcher/1.0; "
    "+https://www.pexels.com/api/)"
)
IMAGE_EXTENSIONS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
}


@dataclass(frozen=True)
class ImageCandidate:
    image_url: str
    source_url: str
    query: str
    provider: str
    source_id: str | None = None
    photographer: str | None = None


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return slug or "asset"


def parse_srcset(srcset: str) -> list[str]:
    urls_by_width: list[tuple[int, str]] = []
    for part in srcset.split(","):
        pieces = part.strip().split()
        if not pieces:
            continue
        url = pieces[0]
        width = 0
        if len(pieces) > 1 and pieces[1].endswith("w"):
            try:
                width = int(pieces[1][:-1])
            except ValueError:
                width = 0
        urls_by_width.append((width, url))
    return [url for _, url in sorted(urls_by_width, reverse=True)]


def iter_pexels_api_candidates(
    session: requests.Session,
    queries: Iterable[str],
    limit_per_query: int,
    min_width: int,
    min_height: int,
    api_key: str,
) -> Iterable[ImageCandidate]:
    headers = {"Authorization": api_key}
    per_page = min(max(limit_per_query * 2, 15), 80)

    for query in queries:
        collected = 0
        page = 1
        while collected < limit_per_query:
            response = session.get(
                PEXELS_API_URL,
                headers=headers,
                params={"query": query, "per_page": per_page, "page": page},
                timeout=20,
            )
            response.raise_for_status()
            payload = response.json()
            photos = payload.get("photos", [])
            if not photos:
                break

            for photo in photos:
                width = int(photo.get("width") or 0)
                height = int(photo.get("height") or 0)
                if width <= min_width or height <= min_height:
                    continue

                src = photo.get("src") or {}
                image_url = src.get("original") or src.get("large2x") or src.get("large")
                if not image_url:
                    continue

                collected += 1
                yield ImageCandidate(
                    image_url=image_url,
                    source_url=photo.get("url") or image_url,
                    query=query,
                    provider="pexels-api",
                    source_id=str(photo.get("id") or ""),
                    photographer=photo.get("photographer"),
                )
                if collected >= limit_per_query:
                    break

            page += 1
            if not payload.get("next_page"):
                break
            time.sleep(0.35)


def iter_pexels_html_candidates(
    session: requests.Session,
    queries: Iterable[str],
    limit_per_query: int,
) -> Iterable[ImageCandidate]:
    headers = {"User-Agent": USER_AGENT}

    for query in queries:
        search_url = PEXELS_SEARCH_URL.format(query=quote_plus(query))
        response = session.get(search_url, headers=headers, timeout=20)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        seen_urls: set[str] = set()
        collected = 0

        for img in soup.find_all("img"):
            urls: list[str] = []
            if img.get("srcset"):
                urls.extend(parse_srcset(str(img["srcset"])))
            if img.get("data-src"):
                urls.append(str(img["data-src"]))
            if img.get("src"):
                urls.append(str(img["src"]))

            for raw_url in urls:
                image_url = urljoin(search_url, raw_url)
                parsed = urlparse(image_url)
                if "images.pexels.com" not in parsed.netloc:
                    continue
                if image_url in seen_urls:
                    continue
                seen_urls.add(image_url)

                match = re.search(r"pexels-photo-(\d+)", image_url)
                source_id = match.group(1) if match else None
                collected += 1
                yield ImageCandidate(
                    image_url=image_url,
                    source_url=search_url,
                    query=query,
                    provider="pexels-html",
                    source_id=source_id,
                )
                if collected >= limit_per_query:
                    break

            if collected >= limit_per_query:
                break

        time.sleep(1.2)


def download_to_temp(
    session: requests.Session,
    candidate: ImageCandidate,
    tmp_dir: Path,
) -> Path | None:
    headers = {"User-Agent": USER_AGENT, "Referer": candidate.source_url}
    digest = hashlib.sha1(candidate.image_url.encode("utf-8")).hexdigest()[:12]
    tmp_path = tmp_dir / f"{digest}.download"

    try:
        with session.get(candidate.image_url, headers=headers, stream=True, timeout=30) as response:
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if content_type and not content_type.startswith("image/"):
                print(f"skip non-image response: {candidate.image_url}")
                return None

            with tmp_path.open("wb") as file:
                for chunk in response.iter_content(chunk_size=1024 * 128):
                    if chunk:
                        file.write(chunk)
    except requests.RequestException as exc:
        print(f"download failed: {candidate.image_url} ({exc})")
        return None

    return tmp_path


def inspect_image(path: Path) -> tuple[int, int, str] | None:
    try:
        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            return image.width, image.height, image.format or "JPEG"
    except (UnidentifiedImageError, OSError) as exc:
        print(f"invalid image skipped: {path.name} ({exc})")
        return None


def unique_destination(output_dir: Path, base_name: str, extension: str) -> Path:
    destination = output_dir / f"{base_name}{extension}"
    index = 2
    while destination.exists():
        destination = output_dir / f"{base_name}_{index}{extension}"
        index += 1
    return destination


def save_metadata(output_dir: Path, records: list[dict[str, object]]) -> None:
    metadata_path = output_dir / "asset_sources.json"
    existing: list[dict[str, object]] = []
    if metadata_path.exists():
        try:
            existing = json.loads(metadata_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []

    existing.extend(records)
    metadata_path.write_text(
        json.dumps(existing, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def fetch_assets(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    queries = tuple(args.query)
    api_key = args.api_key or os.getenv("PEXELS_API_KEY")
    mode = "api" if api_key and not args.html_only else "html"

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    if mode == "api":
        candidates = iter_pexels_api_candidates(
            session=session,
            queries=queries,
            limit_per_query=args.limit,
            min_width=args.min_width,
            min_height=args.min_height,
            api_key=api_key,
        )
    else:
        reason = "--html-only set" if args.html_only else "PEXELS_API_KEY not set"
        print(
            f"{reason}; using BeautifulSoup HTML fallback. "
            "This can break if Pexels changes its markup."
        )
        candidates = iter_pexels_html_candidates(
            session=session,
            queries=queries,
            limit_per_query=args.limit * 3,
        )

    saved = 0
    seen_source_ids: set[str] = set()
    metadata: list[dict[str, object]] = []

    with tempfile.TemporaryDirectory(prefix="fashion-assets-") as tmp:
        tmp_dir = Path(tmp)
        for candidate in candidates:
            if saved >= args.total_limit:
                break
            if candidate.source_id and candidate.source_id in seen_source_ids:
                continue

            tmp_path = download_to_temp(session, candidate, tmp_dir)
            if tmp_path is None:
                continue

            image_info = inspect_image(tmp_path)
            if image_info is None:
                continue

            width, height, image_format = image_info
            if width <= args.min_width or height <= args.min_height:
                print(f"skip low resolution {width}x{height}: {candidate.image_url}")
                continue

            extension = IMAGE_EXTENSIONS.get(image_format.upper(), ".jpg")
            saved += 1
            if candidate.source_id:
                seen_source_ids.add(candidate.source_id)
            source_key = candidate.source_id or hashlib.sha1(
                candidate.image_url.encode("utf-8")
            ).hexdigest()[:8]
            base_name = f"{slugify(candidate.query)}_{saved:03d}_{source_key}"
            destination = unique_destination(output_dir, base_name, extension)
            shutil.move(str(tmp_path), destination)

            metadata.append(
                {
                    "file": destination.name,
                    "query": candidate.query,
                    "provider": candidate.provider,
                    "source_url": candidate.source_url,
                    "image_url": candidate.image_url,
                    "source_id": candidate.source_id,
                    "photographer": candidate.photographer,
                    "width": width,
                    "height": height,
                }
            )
            print(f"saved {destination.name} ({width}x{height})")
            time.sleep(args.delay)

    if metadata:
        save_metadata(output_dir, metadata)

    print(f"done: saved {saved} image(s) to {output_dir}")
    return 0 if saved else 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch high-resolution fashion images into public/assets."
    )
    parser.add_argument(
        "--query",
        action="append",
        default=None,
        help="Search query. Can be passed multiple times.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=12,
        help="Target images per query before resolution filtering.",
    )
    parser.add_argument(
        "--total-limit",
        type=int,
        default=24,
        help="Maximum number of images to save across all queries.",
    )
    parser.add_argument("--min-width", type=int, default=800)
    parser.add_argument("--min-height", type=int, default=800)
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Directory where accepted images will be moved.",
    )
    parser.add_argument(
        "--api-key",
        default=None,
        help="Pexels API key. Defaults to the PEXELS_API_KEY environment variable.",
    )
    parser.add_argument(
        "--html-only",
        action="store_true",
        help="Force the BeautifulSoup HTML fallback instead of the Pexels API.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.4,
        help="Delay between accepted downloads, in seconds.",
    )

    args = parser.parse_args()
    if args.query is None:
        args.query = list(DEFAULT_QUERIES)
    if args.limit < 1 or args.total_limit < 1:
        parser.error("--limit and --total-limit must be positive integers")
    return args


if __name__ == "__main__":
    try:
        raise SystemExit(fetch_assets(parse_args()))
    except KeyboardInterrupt:
        print("interrupted", file=sys.stderr)
        raise SystemExit(130)
