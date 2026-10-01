import { useEffect, useRef, useState } from 'react'

type OptimizedVideoProps = {
  src: string
  sourceType?: 'video/webm' | 'video/mp4'
  fallbackSrc: string
  fallbackType?: 'video/webm' | 'video/mp4'
  poster: string
  posterMedium?: string
  label: string
}

/**
 * Loads an optimized, muted demo shortly before it enters the viewport. The
 * smaller H.264 source is preferred and WebM remains available as a fallback.
 */
export function OptimizedVideo({ src, sourceType = 'video/mp4', fallbackSrc, fallbackType = 'video/webm', poster, posterMedium, label }: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true)
      setIsLoading(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      setShouldLoad(true)
      setIsLoading(true)
      observer.disconnect()
    }, { rootMargin: '80px 0px' })
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (shouldLoad) videoRef.current?.load()
  }, [shouldLoad])

  const startPlayback = (video: HTMLVideoElement) => {
    video.muted = true
    void video.play().catch(() => undefined)
  }

  const retry = () => {
    const video = videoRef.current
    if (!video) return
    setHasError(false)
    setIsLoading(true)
    video.load()
  }

  return <div className="optimized-video is-loaded">
    <video
      ref={videoRef}
      autoPlay
      controls
      loop
      muted
      playsInline
      preload={shouldLoad ? 'metadata' : 'none'}
      poster={shouldLoad ? posterMedium || poster : undefined}
      aria-label={label}
      onCanPlay={(event) => {
        setIsLoading(false)
        startPlayback(event.currentTarget)
      }}
      onPlaying={() => setIsLoading(false)}
      onWaiting={() => setIsLoading(true)}
      onError={() => { setHasError(true); setIsLoading(false) }}
    >
      {shouldLoad && <source src={src} type={sourceType} />}
      {shouldLoad && fallbackSrc !== src && <source src={fallbackSrc} type={fallbackType} />}
      Your browser does not support embedded video.
    </video>
    {!shouldLoad && <img className="optimized-video-poster" src={posterMedium || poster} srcSet={posterMedium ? `${posterMedium} 720w, ${poster} 1200w` : undefined} sizes="(max-width: 760px) calc(100vw - 48px), 330px" loading="lazy" decoding="async" alt="" />}
    {isLoading && !hasError && <span className="optimized-video-status" role="status">Loading video…</span>}
    {hasError && <button className="optimized-video-retry" type="button" onClick={retry}>Try again</button>}
  </div>
}
