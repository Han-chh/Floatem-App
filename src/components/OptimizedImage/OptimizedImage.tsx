import { useState, type CSSProperties, type ImgHTMLAttributes } from 'react'

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'loading'> & {
  /** Responsive WebP preview, normally the 1200px derivative. */
  src: string
  /** Small WebP derivative displayed while the preview loads. */
  thumbnail: string
  /** Original local asset used only if the optimized source cannot be displayed. */
  fallback: string
  sizes: string
  priority?: boolean
  wrapperClassName?: string
}

/**
 * Keeps image loading policy consistent across the site without changing its
 * layout: a small blurred thumbnail is painted first, then the responsive
 * preview replaces it. The original source remains a browser fallback.
 */
export function OptimizedImage({
  src,
  thumbnail,
  fallback,
  sizes,
  priority = false,
  wrapperClassName = '',
  className,
  alt,
  onLoad,
  onError,
  style,
  ...imageProps
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const placeholderStyle = { '--optimized-image-placeholder': `url("${thumbnail}")` } as CSSProperties

  return <span className={`optimized-image ${loaded ? 'is-loaded' : ''} ${usingFallback ? 'is-fallback' : ''} ${wrapperClassName}`.trim()} style={placeholderStyle}>
    <picture>
      {!usingFallback && <source type="image/webp" srcSet={`${thumbnail} 320w, ${src} 1200w`} sizes={sizes} />}
      <img
        {...imageProps}
        className={className}
        src={fallback}
        sizes={usingFallback ? undefined : sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        alt={alt}
        style={style}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
        onError={(event) => {
          if (!usingFallback) {
            setUsingFallback(true)
            return
          }
          setLoaded(true)
          onError?.(event)
        }}
      />
    </picture>
  </span>
}
