import { useState } from 'react'
import { OptimizedImage } from '../OptimizedImage'

type OptimizedVideoProps = {
  src: string
  fallbackSrc: string
  poster: string
  posterThumbnail: string
  label: string
}

/**
 * A deliberate, click-to-load video player. No video bytes are requested until
 * the visitor chooses to play a demo; the poster itself stays responsive and
 * lazy-loaded through OptimizedImage.
 */
export function OptimizedVideo({ src, fallbackSrc, poster, posterThumbnail, label }: OptimizedVideoProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const loadVideo = () => {
    setHasError(false)
    setIsLoading(true)
    setShouldLoad(true)
  }

  return <div className={`optimized-video ${shouldLoad ? 'is-loaded' : ''}`}>
    {shouldLoad
      ? <video
          controls
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={label}
          onCanPlay={() => setIsLoading(false)}
          onError={() => { setHasError(true); setIsLoading(false) }}
        >
          <source src={src} type="video/webm" />
          <source src={fallbackSrc} type="video/mp4" />
          Your browser does not support embedded video.
        </video>
      : <button className="optimized-video-launch" type="button" onClick={loadVideo} aria-label={`Play ${label}`}>
          <OptimizedImage src={poster} thumbnail={posterThumbnail} fallback={poster} sizes="(max-width: 760px) 88vw, 1080px" alt="" />
          <span className="optimized-video-play" aria-hidden="true">▶</span>
          <span className="optimized-video-label">Play demo</span>
        </button>}
    {isLoading && <span className="optimized-video-status" role="status">Loading video…</span>}
    {hasError && <button className="optimized-video-retry" type="button" onClick={loadVideo}>Try again</button>}
  </div>
}
