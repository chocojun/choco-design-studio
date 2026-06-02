# Choco Design Studio

Minimal personal portfolio and static AI fashion demo built with Next.js, TypeScript, Tailwind CSS, and the App Router.

## Pages

- `/` - index page with fixed navigation, artist statement, and featured visual field
- `/work` - clipping archive with 20 self-made collage works and click-to-play GIF motion
- `/ai` - static AI fashion try-on demo interface
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

The site is fully static: no database, no real AI endpoint, and no server runtime is required.

## Languages and GIFs

The site includes Simplified Chinese, Traditional Chinese, and English copy. It auto-selects a language from the browser and also provides a manual switcher.

Regenerate the clipping GIF previews:

```bash
npm run generate:gifs
```

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
