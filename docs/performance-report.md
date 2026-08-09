# Floatem website performance report

Test date: 2026-08-09. This report covers the completed resource, image, video,
route-splitting, and cache work (Phases 1–8).

## Test method

- Production build: `vite build --config vite.config.ts` from `website/`
- Lighthouse: v12.8.2, local `dist/` served on port 4173, Chrome headless,
  Performance category only
- The Lighthouse run uses its simulated mobile network/CPU profile. Treat the
  paint values as a reproducible local baseline, not field data.

## Comparison

| Metric | Before | After | Result |
| --- | ---: | ---: | --- |
| Initial entry JavaScript | 164 KiB | 156.4 KiB (53.7 KiB gzip) | 4.6% smaller entry; route code is split separately. |
| Route code delivery | One app module | 5 route chunks (0.5–37.9 KiB) | A visitor does not load Features, Download, Support, or Privacy code until navigating there. |
| Source image/video inventory | 34.65 MiB | 3.49 MiB optimized WebP/WebM delivery set | 89.9% smaller optimized delivery media. |
| Largest visual asset | 3.37 MiB PNG | 1.53 MiB WebM, route-autoplay | The largest delivery file is optimized, but is requested when Features renders. |
| Estimated home media before scrolling | 14.82 MiB image payload | 1.54 MiB total Lighthouse transfer | About 89.6% less total transfer in the measured run. |
| Lighthouse performance score | Not captured before implementation | 56 / 100 | First repeatable local measurement. |
| First Contentful Paint | Not captured before implementation | 9.1 s | See remaining bottleneck below. |
| Largest Contentful Paint | Not captured before implementation | 10.1 s | See remaining bottleneck below. |
| Total Blocking Time | Not captured before implementation | 0 ms | No main-thread blocking issue observed. |
| Cumulative Layout Shift | Not captured before implementation | 0.000 | Responsive media reservation is stable in this run. |

The earlier build output was 34.33 MiB; the new full `dist` directory is
38.30 MiB. This physical-directory increase is expected because the original
`public` files are deliberately preserved as browser fallbacks while Vite also
emits the new hashed delivery assets. It does **not** represent initial network
transfer: the Lighthouse run fetched 1.54 MiB. A future cleanup phase may stop
copying legacy fallback files after browser-support requirements are agreed.

## Completed optimizations

- Images use WebP previews, 320px thumbnails, `srcset`, `sizes`, native lazy
  loading, async decoding, and a blur-up placeholder.
- Videos mount their optimized WebM source (with H.264 MP4 fallback) when the
  Features route renders, then autoplay muted and looped without a click.
- Every page is a `React.lazy()` import behind `Suspense`; route-only feature
  and policy code is no longer part of the entry module.
- `resources:sync` writes Vite-tracked `new URL()` imports. Production builds
  emit content-hashed names such as `home-hero-floatem-workspaces-WYhGJHJA.webp`,
  enabling reuse of unchanged responses on later visits.
- The 962 KiB PNG favicon was replaced with the existing 294-byte SVG favicon.

## Remaining bottleneck

The Lighthouse request trace from the original click-to-load configuration
shows that Google Fonts is the dominant
initial transfer source: its stylesheet plus Noto Serif SC subsets account for
roughly 1 MiB. It is also the likely reason that FCP/LCP remain high despite
the media improvements. Font self-hosting/subsetting was intentionally not
included in the requested image/video and loading phases; it is the highest
value next performance task. The route-autoplay behavior introduced afterward
intentionally increases Features-page transfer by loading its three optimized
videos immediately; it should be measured separately from this prior baseline.

## Re-run commands

```sh
npm run resources:images
npm run resources:videos
npm run resources:sync
cd website && vite build --config vite.config.ts
npx --yes lighthouse@12.8.2 http://127.0.0.1:4173/ --chrome-path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --only-categories=performance
```
