import type { OptimizedImageAsset } from '../content/rootMedia'

function image(src: string, thumbnail: string, fallback: string): OptimizedImageAsset {
  return { src, thumbnail, fallback }
}

export const featureImages: Record<string, OptimizedImageAsset> = {
  '/images/app-store/floating.png': image(new URL('../../resources/optimized/images/app-store/floating.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/floating-thumb.webp', import.meta.url).href, '/images/app-store/floating.png'),
  '/images/app-store/desktop.png': image(new URL('../../resources/optimized/images/app-store/desktop.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/desktop-thumb.webp', import.meta.url).href, '/images/app-store/desktop.png'),
  '/images/app-store/tasks.png': image(new URL('../../resources/optimized/images/app-store/tasks.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/tasks-thumb.webp', import.meta.url).href, '/images/app-store/tasks.png'),
  '/images/app-store/guide.png': image(new URL('../../resources/optimized/images/app-store/guide.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/guide-thumb.webp', import.meta.url).href, '/images/app-store/guide.png'),
  '/images/app-store/themes.png': image(new URL('../../resources/optimized/images/app-store/themes.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/themes-thumb.webp', import.meta.url).href, '/images/app-store/themes.png'),
  '/images/app-store/en/notes.png': image(new URL('../../resources/optimized/images/app-store/en/notes.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/en/notes-thumb.webp', import.meta.url).href, '/images/app-store/en/notes.png'),
  '/images/app-store/en/floating.png': image(new URL('../../resources/optimized/images/app-store/en/floating.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/en/floating-thumb.webp', import.meta.url).href, '/images/app-store/en/floating.png'),
  '/images/app-store/en/tasks.png': image(new URL('../../resources/optimized/images/app-store/en/tasks.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/en/tasks-thumb.webp', import.meta.url).href, '/images/app-store/en/tasks.png'),
  '/images/app-store/en/desktop.png': image(new URL('../../resources/optimized/images/app-store/en/desktop.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/en/desktop-thumb.webp', import.meta.url).href, '/images/app-store/en/desktop.png'),
  '/images/app-store/en/themes.png': image(new URL('../../resources/optimized/images/app-store/en/themes.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/en/themes-thumb.webp', import.meta.url).href, '/images/app-store/en/themes.png'),
  '/images/app-store/en/guide.png': image(new URL('../../resources/optimized/images/app-store/en/guide.webp', import.meta.url).href, new URL('../../resources/optimized/images/app-store/en/guide-thumb.webp', import.meta.url).href, '/images/app-store/en/guide.png'),
}

export const featureVideos = {
  '/videos/floatem-card-float-demo.mp4': {
    src: new URL('../../resources/optimized/videos/floatem-card-float-demo.webm', import.meta.url).href,
    poster: new URL('../../resources/optimized/videos/floatem-card-float-demo-poster.webp', import.meta.url).href,
    fallbackSrc: new URL('../../resources/optimized/videos/floatem-card-float-demo.mp4', import.meta.url).href,
  },
  '/videos/floatem-capture-demo-safe.mp4': {
    src: new URL('../../resources/optimized/videos/floatem-capture-demo-safe.webm', import.meta.url).href,
    poster: new URL('../../resources/optimized/videos/floatem-capture-demo-safe-poster.webp', import.meta.url).href,
    fallbackSrc: new URL('../../resources/optimized/videos/floatem-capture-demo-safe.mp4', import.meta.url).href,
  },
  '/videos/floatem-reminder-demo.mp4': {
    src: new URL('../../resources/optimized/videos/floatem-reminder-demo.webm', import.meta.url).href,
    poster: new URL('../../resources/optimized/videos/floatem-reminder-demo-poster.webp', import.meta.url).href,
    fallbackSrc: new URL('../../resources/optimized/videos/floatem-reminder-demo.mp4', import.meta.url).href,
  },
  '/videos/floatem-guide-onboarding-demo.mp4': {
    src: new URL('../../resources/optimized/videos/floatem-guide-onboarding-demo.webm', import.meta.url).href,
    poster: new URL('../../resources/optimized/videos/floatem-guide-onboarding-demo-poster.webp', import.meta.url).href,
    fallbackSrc: new URL('../../resources/optimized/videos/floatem-guide-onboarding-demo.mp4', import.meta.url).href,
  },
}
