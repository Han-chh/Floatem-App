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
 * the visitor chooses to load a demo; once it can play, it starts muted and
 * looping without requiring a second interaction.
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
          autoPlay
          controls
          loop
          muted
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={label}
          onCanPlay={(event) => {
            setIsLoading(false)
            event.currentTarget.muted = true
            void event.currentTarget.play().catch(() => undefined)
          }}
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
