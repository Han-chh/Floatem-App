# Floatem website resource audit

Audit date: 2026-08-09. Scope: `public`, `src`, build output,
and direct static-resource references. The website has no `src/assets` folder;
all binary delivery files currently live under `public` and are copied
to `dist` unchanged by Vite.

## Summary

- `public` is **34.65 MiB** (36,335,532 bytes) before the optimized
  derivative pipeline.
- **21 PNG files exceed 300 KB**. There are no videos above 5 MiB, although
  the three MP4 files total 5.27 MiB and are unnecessarily requested together
  on the Features page.
- The home route can request approximately **14.82 MiB** of image data before
  a visitor reaches the below-the-fold scene cards because all `<img>` elements
  use the browser default eager loading.
- The Features route renders five full PNGs (8.18 MiB) and three videos
  (5.27 MiB). Its videos use `preload="auto"` and are explicitly asked to play
  as soon as the React component mounts.

## Large images (greater than 300 KB)

| File | Size | Format | Current use | Recommendation |
| --- | ---: | --- | --- | --- |
| `public/images/09-桌面固定-彩色便签.png` | 3.37 MiB | PNG | Home scene `screenshots.desktop` | 1200px WebP preview + 320px thumbnail; lazy load. |
| `public/images/10-待办与提醒.png` | 3.16 MiB | PNG | Home scene `screenshots.todo` | 1200px WebP preview + 320px thumbnail; lazy load. |
| `public/images/floatem-watercolor-botanical.png` | 2.54 MiB | PNG | CSS background on home and page intros | Produce WebP/AVIF background variants; load only for routes that use it. |
| `public/images/app-store/desktop.png` | 1.88 MiB | PNG | Feature item 02 | Responsive WebP and lazy load. |
| `public/images/08-多卡片悬浮-代码工作.png` | 1.88 MiB | PNG | Home scene `screenshots.code` | Responsive WebP and lazy load. |
| `public/images/07-悬浮主窗口-视频工作.png` | 1.86 MiB | PNG | Home scene `screenshots.video` | Responsive WebP and lazy load. |
| `public/images/app-store/floating.png` | 1.71 MiB | PNG | Feature item 01 and video poster | Use responsive WebP; use a small generated video poster instead. |
| `public/images/app-store/themes.png` | 1.57 MiB | PNG | Feature item 05 | Responsive WebP and lazy load. |
| `public/images/app-store/notes.png` | 1.53 MiB | PNG | Not displayed by the current Feature list | Keep as source, but do not load until it has a UI consumer. |
| `public/images/app-store/tasks.png` | 1.52 MiB | PNG | Feature item 03 | Responsive WebP and lazy load. |
| `public/images/app-store/guide.png` | 1.48 MiB | PNG | Feature item 04 | Responsive WebP and lazy load. |
| `public/floatem-app-icon.png` | 0.98 MiB | PNG | No source reference | Duplicate of `images/app-icon.png`; retain during migration, then remove one only after deployment verification. |
| `public/images/app-icon.png` | 0.98 MiB | PNG | No source reference | Byte-identical duplicate of `floatem-app-icon.png`; see above. |
| `public/floatem-app-icon-macos.png` | 0.92 MiB | PNG | Header, footer, HTML favicon | Generate small raster favicon and display-size WebP; keep PNG fallback. |
| `public/images/03-梅.png` | 0.59 MiB | PNG | Theme selector | Generate WebP; request only selected/current theme. |
| `public/images/05-竹.png` | 0.59 MiB | PNG | Theme selector | Generate WebP; request only selected/current theme. |
| `public/images/06-菊.png` | 0.58 MiB | PNG | Theme selector | Generate WebP; request only selected/current theme. |
| `public/images/02-浮光.png` | 0.58 MiB | PNG | Theme selector | Generate WebP; request only selected/current theme. |
| `public/images/01-经典色.png` | 0.58 MiB | PNG | Theme selector (initial selection) | Generate WebP preview; it is the only theme image required initially. |
| `public/images/04-兰.png` | 0.57 MiB | PNG | Theme selector | Generate WebP; request only after selection or idle prefetch. |
| `public/images/home-hero-floatem-workspaces.png` | 0.51 MiB | PNG | Home hero | Keep eager as the LCP candidate, but use an appropriately sized WebP/AVIF source. |

`public/floatem-icon.svg` is 294 bytes, is not referenced by source, and is
not a size concern. It should be checked before any cleanup because it may be
used by deployment metadata outside the inspected React source.

## Video inventory

| File | Size | Format / dimensions / duration | Current use | Recommendation |
| --- | ---: | --- | --- | --- |
| `resources/raw/videos/floatem-reminder-demo.mp4` | 51.10 MiB | HEVC, 3320×2160, 33.8s | Feature item 03 | Preserve only as raw source; serve the 1200px WebM/MP4 derivatives. |
| `public/videos/floatem-capture-demo-safe.mp4` | 2.86 MiB | H.264, 1660×1080, 27.0s | Feature item 02 | Serve the generated 1200px WebM with MP4 fallback; route-autoplay muted. |
| `public/videos/floatem-todo-demo.mp4` | 1.34 MiB | H.264, 1660×1080, 36.9s | Preserved legacy source | Keep only as raw/archive material; it is no longer rendered. |
| `public/videos/floatem-card-float-demo.mp4` | 1.07 MiB | H.264, 1280×832, 16.9s | Feature item 01 | Serve the generated VP9 WebM with MP4 fallback; route-autoplay muted. |

The new reminder source exceeds the 5 MiB threshold but is retained only under
`resources/raw`. The deployed Feature videos are capped-width delivery copies.

## Static usage and initial-loading findings

- `src/main.tsx` conditionally renders routes, so hidden routes do not mount
  media until navigation. There is not yet route-level code splitting; the
  whole app code remains in the initial JavaScript entry point.
- The home route mounts its Hero, theme image, and all four scene image
  elements. The four scene cards are below the fold but lack `loading="lazy"`.
- The active theme image changes by state, so only the selected theme image is
  mounted at a time. The remaining theme images are not initially requested.
- The shared botanical CSS background is requested on the home route and each
  page-intro route.
- The Features route mounts all five feature images. The first three feature
  videos have `preload="auto"`; `FeatureVideo` also calls `play()` immediately
  before the IntersectionObserver has determined visibility.
- Google Fonts are stylesheet-loaded from `fonts.googleapis.com`; no font files
  exist in this repository. Font self-hosting is intentionally out of scope for
  this local media phase.

## Duplicates and assets without a source reference

- `public/floatem-app-icon.png` and `public/images/app-icon.png` are
  byte-identical 1024×1024 PNGs (1,024,657 bytes each). Neither is referenced
  by the inspected source. They are preserved in this phase.
- `public/floatem-icon.svg` has no inspected source reference. It is tiny and
  remains preserved.
- `public/images/app-store/notes.png` is listed in `screenshots.appStore`, but
  `Features` uses only the first five entries of a six-item list, leaving it
  without a rendered consumer today. Preserve it until content confirms it is
  obsolete.

## Phase 1–5 outcome

The new scripts preserve current originals, generate 320px thumbnail and
1200px preview derivatives, and write machine-readable manifests. Phase 4 now
uses `OptimizedImage` for every website image: below-the-fold media is lazy,
responsive WebP is selected with `srcset`/`sizes`, and the original local image
remains a fallback. Phase 5 uses `OptimizedVideo`: only a responsive poster is
mounted immediately by the Features route, autoplay muted and looped, and use
WebM/MP4 delivery copies. `resources:sync` makes only generated delivery assets available to Vite
under `/resources/optimized/` without changing the website's visual design.
