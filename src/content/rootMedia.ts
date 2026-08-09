export type OptimizedImageAsset = { src: string, thumbnail: string, fallback: string }

export const appIconImage: OptimizedImageAsset = {
  src: new URL('../../resources/optimized/floatem-app-icon-macos.webp', import.meta.url).href,
  thumbnail: new URL('../../resources/optimized/floatem-app-icon-macos-thumb.webp', import.meta.url).href,
  fallback: '/floatem-app-icon-macos.png',
}

export const botanicalImage = new URL('../../resources/optimized/images/floatem-watercolor-botanical.webp', import.meta.url).href
