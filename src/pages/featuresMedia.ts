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
}

export const featureVideos = {
  '/videos/floatem-card-float-demo.mp4': {
    src: new URL('../../resources/optimized/videos/floatem-card-float-demo.webm', import.meta.url).href,
    poster: new URL('../../resources/optimized/videos/floatem-card-float-demo-poster.webp', import.meta.url).href,
    posterThumbnail: new URL('../../resources/optimized/videos/floatem-card-float-demo-poster.webp', import.meta.url).href,
    fallbackSrc: '/videos/floatem-card-float-demo.mp4',
  },
  '/videos/floatem-capture-demo-safe.mp4': {
    src: new URL('../../resources/optimized/videos/floatem-capture-demo-safe.webm', import.meta.url).href,
    poster: new URL('../../resources/optimized/videos/floatem-capture-demo-safe-poster.webp', import.meta.url).href,
    posterThumbnail: new URL('../../resources/optimized/videos/floatem-capture-demo-safe-poster.webp', import.meta.url).href,
    fallbackSrc: '/videos/floatem-capture-demo-safe.mp4',
  },
  '/videos/floatem-todo-demo.mp4': {
    src: new URL('../../resources/optimized/videos/floatem-todo-demo.webm', import.meta.url).href,
    poster: new URL('../../resources/optimized/videos/floatem-todo-demo-poster.webp', import.meta.url).href,
    posterThumbnail: new URL('../../resources/optimized/videos/floatem-todo-demo-poster.webp', import.meta.url).href,
    fallbackSrc: '/videos/floatem-todo-demo.mp4',
  },
}
