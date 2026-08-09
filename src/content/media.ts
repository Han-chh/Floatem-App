import { optimizedAssetManifest } from './optimizedAssetManifest'

export type OptimizedImageAsset = {
  src: string
  thumbnail: string
  fallback: string
}

function withoutExtension(path: string) {
  return path.replace(/^\.?(\/)/, '').replace(/\.[^.]+$/, '')
}

function absolutePath(path: string) {
  return path.startsWith('/') ? path : `/${path.replace(/^\.\//, '')}`
}

/** Maps a current local asset to the non-destructive Phase 1–3 derivative. */
export function optimizedImage(path: string): OptimizedImageAsset {
  const normalized = withoutExtension(path)
  return {
    src: optimizedAssetUrl(`/resources/optimized/${normalized}.webp`),
    thumbnail: optimizedAssetUrl(`/resources/optimized/${normalized}-thumb.webp`),
    fallback: absolutePath(path),
  }
}

export function optimizedVideo(path: string) {
  const normalized = withoutExtension(path).replace(/^videos\//, '')
  return {
    src: optimizedAssetUrl(`/resources/optimized/videos/${normalized}.webm`),
    poster: optimizedAssetUrl(`/resources/optimized/videos/${normalized}-poster.webp`),
    posterThumbnail: optimizedAssetUrl(`/resources/optimized/videos/${normalized}-poster.webp`),
    fallbackSrc: absolutePath(path),
  }
}

export function optimizedAssetUrl(logicalPath: string) {
  return optimizedAssetManifest[logicalPath as keyof typeof optimizedAssetManifest] || logicalPath
}
