# Floatem resource optimization guide

This guide explains how to add and publish website media without changing the
page design or bypassing the performance pipeline.

## Folder structure

```text
website/
├── public/                         # Legacy originals and browser fallbacks
├── resources/
│   ├── raw/                        # Canonical, untouched source media
│   │   ├── images/
│   │   └── videos/
│   ├── optimized/                  # Generated WebP/WebM files; do not edit
│   ├── image-manifest.json         # Generated image inventory
│   └── video-manifest.json         # Generated video inventory
└── src/
    ├── components/
    │   ├── OptimizedImage/         # Responsive image + placeholder component
    │   └── OptimizedVideo/         # Click-to-load video component
    ├── content/rootMedia.ts        # Small assets used by the application shell
    └── pages/
        ├── homeMedia.ts            # Home-only image imports
        └── featuresMedia.ts        # Features-only images and videos

scripts/resource/
├── optimize-images.js
├── generate-thumbnails.js
├── optimize-videos.js
└── sync-optimized-resources.js
```

The `raw` directory preserves originals. The `optimized` directory is generated
from it. Never edit or rename generated files directly: run the scripts again
instead.

## Add a new image

1. Put the original PNG or JPEG in `resources/raw/images/`. Keep its
   nested folder meaningful, for example:

   ```text
   resources/raw/images/features/floating-workspace.png
   ```

2. Run the image pipeline from the repository root:

   ```sh
   npm run resources:images
   npm run resources:sync
   ```

   This generates:

   ```text
   resources/optimized/images/features/
   ├── floating-workspace.webp        # 1200px preview, WebP quality 80
   └── floating-workspace-thumb.webp  # 320px thumbnail, WebP quality 70
   ```

3. Add static `new URL(..., import.meta.url).href` entries to the media module
   for the route that displays the image. For example, add a home-only image to
   `src/pages/homeMedia.ts`, rather than the app shell. This preserves
   route-level code splitting and gives Vite a content-hashed output filename.

4. Render it through `OptimizedImage`:

   ```tsx
   <OptimizedImage
     {...homeImages['/images/features/floating-workspace.png']}
     sizes="(max-width: 760px) 88vw, 50vw"
     alt="Floatem floating workspace"
   />
   ```

   Use `priority` only for an image visible in the first viewport, typically
   the LCP image. All other content should retain native lazy loading.

## Image naming rules

- Use lowercase English kebab-case for new filenames: `floating-workspace.png`.
- Use a descriptive prefix when files belong to a family:
  `feature-floating-workspace.png`, `feature-desktop-pin.png`.
- Keep the same relative path below `raw/images` and `optimized/images`.
- Do not encode viewport width or quality in the source name. The pipeline adds
  `-thumb` to thumbnails and produces the preview name automatically.
- Avoid spaces, version suffixes, and generic names such as `final.png` or
  `image-2.png`.
- Source PNG/JPEG files stay in `raw`; only generated WebP/AVIF files belong in
  `optimized`.

## Add and optimize a video

1. Put an MP4, MOV, or M4V source in `resources/raw/videos/`.

2. Generate delivery copies and a poster:

   ```sh
   npm run resources:videos
   npm run resources:sync
   ```

   The script retains the original and generates a width-capped VP9 WebM plus
   a WebP poster. It also updates `video-manifest.json`.

3. Add its static URLs to `src/pages/featuresMedia.ts` (or the media
   module belonging to the route that owns it). Use `new URL` for both the WebM
   and poster so Vite emits content-hashed assets.

4. Render it with `OptimizedVideo`:

   ```tsx
   <OptimizedVideo
     {...featureVideos['/videos/floating-workspace.mp4']}
     label="Floatem floating workspace demonstration"
   />
   ```

`OptimizedVideo` initially renders a poster only. It does not mount a video
element or source until the visitor selects Play. After that interaction it
loads video metadata and shows browser controls. Do not add `autoPlay`, a
source element outside this component, or `preload="auto"`.

## Commands

Run these commands from the repository root:

```sh
# Generate all WebP previews and thumbnails from resources/raw.
npm run resources:images

# Generate only thumbnails when needed.
npm run resources:thumbnails

# Generate WebM videos and WebP posters from resources/raw/videos.
npm run resources:videos

# Refresh Vite-tracked asset imports after generating resources.
npm run resources:sync
```

For a complete production verification:

```sh
cd website
vite build --config vite.config.ts
```

## Cache and route-loading rules

- Do not use bare `/resources/optimized/...` strings in a page. Add a static
  `new URL` import in that route's media module. Vite then emits a filename
  containing a content hash; unchanged media retains its URL across builds.
- Place global assets only in `rootMedia.ts`. Put route-specific resources in
  the matching page media module, so another route does not import their URL
  map or code.
- Keep pages behind `React.lazy()` in `src/main.tsx`. A new route should be a
  separate default-exported component inside `src/pages/`.
- Keep original public resources until browser fallback and deployment cleanup
  have been explicitly approved. They are not the preferred modern delivery
  path.

## Before opening a pull request

1. Run `npm run resources:images` and/or `npm run resources:videos`.
2. Run `npm run resources:sync`.
3. Build the website.
4. Open the page using the new media and verify the image appears at desktop and
   mobile widths.
5. Confirm below-the-fold images are lazy in DevTools Network.
6. Confirm a video sends no WebM/MP4 request until Play is selected, then plays
   with controls.
