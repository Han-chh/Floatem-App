# Floatem resource pipeline

This directory contains repeatable, non-destructive scripts for the website's
local media. Source media belongs in `resources/raw/`; generated files belong
in `resources/optimized/`. Do not edit generated files by hand.

## Prerequisites

- Node.js 20 or newer
- [ImageMagick](https://imagemagick.org/) (`brew install imagemagick` on macOS)
- [FFmpeg](https://ffmpeg.org/) for video derivatives (`brew install ffmpeg` on macOS)

## Commands

From the repository root:

```sh
npm run resources:images
npm run resources:thumbnails
npm run resources:videos
npm run resources:sync
```

The image command produces a 1200px WebP preview at quality 80 and a 320px
WebP thumbnail at quality 70, retaining directory names. Add
`-- --formats webp,avif` to generate AVIF in addition to WebP. The video
command produces capped-width VP9 WebM and H.264 MP4 delivery files plus a
WebP poster.

`image-manifest.json` and `video-manifest.json` are generated maps consumed by
the Phase 4 image and video components. Run `resources:sync` after regenerating
media: it writes static imports into `src/content/optimizedAssetManifest.ts`.
Vite then emits these files with content hashes in its normal `assets` folder.
The raw sources are never copied to `public`.
