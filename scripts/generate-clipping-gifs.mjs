import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { clippings } from "../lib/clippings-build-data.mjs";

const outputDir = "public/clipping-gifs";
const targetWidth = 360;
const frameCount = 12;

await mkdir(outputDir, { recursive: true });

for (const item of clippings) {
  const source = path.join("public", item.src);
  const output = path.join(outputDir, `${item.slug}.gif`);
  const metadata = await sharp(source).metadata();
  const targetHeight = Math.round((targetWidth * metadata.height) / metadata.width);
  const frames = [];

  for (let index = 0; index < frameCount; index += 1) {
    const progress = (index / frameCount) * Math.PI * 2;
    const scale = 1.1 + Math.sin(progress) * 0.025;
    const scaledWidth = Math.round(targetWidth * scale);
    const scaledHeight = Math.round(targetHeight * scale);
    const maxLeft = scaledWidth - targetWidth;
    const maxTop = scaledHeight - targetHeight;
    const left = Math.round(maxLeft / 2 + Math.sin(progress) * 26);
    const top = Math.round(maxTop / 2 + Math.cos(progress * 0.8) * 22);

    const frame = await sharp(source)
      .resize(scaledWidth, scaledHeight, { fit: "cover" })
      .extract({
        left: Math.max(0, Math.min(maxLeft, left)),
        top: Math.max(0, Math.min(maxTop, top)),
        width: targetWidth,
        height: targetHeight,
      })
      .modulate({
        brightness: 1 + Math.sin(progress) * 0.015,
        saturation: 1.04,
      })
      .png()
      .toBuffer();

    frames.push(frame);
  }

  await sharp(frames, { join: { animated: true } })
    .gif({
      delay: 85,
      dither: 0.7,
      interFrameMaxError: 10,
      interPaletteMaxError: 18,
      loop: 0,
    })
    .toFile(output);

  console.log(`generated ${output}`);
}
