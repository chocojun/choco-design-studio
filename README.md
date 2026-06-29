# Choco Design Studio

Minimal personal portfolio and interactive tea studio built with Next.js, TypeScript, Tailwind CSS, and the App Router.

## Pages

- `/` - index page with fixed navigation, artist statement, and featured visual field
- `/work` - clipping archive with 20 self-made collage works and click-to-enlarge image viewing
- `/ai` - interactive milk tea builder with cup preview, recipe controls, and receipt output
- `/about` - minimal artist/archive text
- `/contact` - email, Instagram, and link placeholders

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build

Create the static export:

```bash
npm run build
```

The generated static site is written to `out/`.

## Cloudflare Pages Deployment

Recommended Cloudflare Pages settings:

- Framework preset: `Next.js (Static HTML Export)` or `None`
- Build command: `npm run build`
- Build output directory: `out`
- Node.js version: `20` or newer

This project uses `output: "export"` in `next.config.ts`, so it does not require a Node server, database, image optimizer, or API runtime.

## Vercel Deployment

Recommended Vercel flow:

1. Push this project to GitHub.
2. Open Vercel and choose `Add New... > Project`.
3. Import the GitHub repository.
4. Keep the framework preset as `Next.js`.
5. Build command: `npm run build`.
6. Because this project uses `output: "export"`, the static export is generated in `out/`.

The site is fully static: no database, no AI endpoint, and no server runtime is required.

## Languages

The site includes Simplified Chinese, Traditional Chinese, and English copy. It auto-selects a language from the browser and also provides a manual switcher.

## Optional Asset Utility

The repository includes an optional image-fetching utility that can place high-resolution, license-friendly reference images into `public/assets`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements-image-scraper.txt
```

Pexels works best through its official API. Create a free API key from
`https://www.pexels.com/api/`, then run:

```bash
export PEXELS_API_KEY="YOUR_PEXELS_API_KEY"
python scripts/fetch_fashion_assets.py
```

Default queries are `fashion portrait` and `clothing template`. The script only
keeps images larger than `800x800` pixels and moves accepted files into
`public/assets`. Source metadata is appended to
`public/assets/asset_sources.json`.

Useful options:

```bash
python scripts/fetch_fashion_assets.py --limit 20 --total-limit 40
python scripts/fetch_fashion_assets.py --query "fashion portrait" --query "white t-shirt mockup"
python scripts/fetch_fashion_assets.py --min-width 1200 --min-height 1200
python scripts/fetch_fashion_assets.py --html-only
```

The `--html-only` mode uses `requests` and `BeautifulSoup` to parse public
Pexels search pages. It is a fallback because public site markup can change; the
official API mode is more reliable.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial Next.js portfolio demo"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then connect that repository in Cloudflare Pages and use the build settings above.
