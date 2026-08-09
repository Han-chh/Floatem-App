import { useRef, useState } from 'react'

type OptimizedVideoProps = {
  src: string
  fallbackSrc: string
  poster: string
  label: string
}

/**
 * Autoplays an optimized, muted demo as soon as its route mounts. WebM is used
 * first and the generated H.264 MP4 is available for browsers without WebM.
 */
export function OptimizedVideo({ src, fallbackSrc, poster, label }: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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
      preload="auto"
      poster={poster}
      aria-label={label}
      onCanPlay={(event) => {
        setIsLoading(false)
        startPlayback(event.currentTarget)
      }}
      onPlaying={() => setIsLoading(false)}
      onWaiting={() => setIsLoading(true)}
      onError={() => { setHasError(true); setIsLoading(false) }}
    >
      <source src={src} type="video/webm" />
      <source src={fallbackSrc} type="video/mp4" />
      Your browser does not support embedded video.
    </video>
    {isLoading && !hasError && <span className="optimized-video-status" role="status">Loading video…</span>}
    {hasError && <button className="optimized-video-retry" type="button" onClick={retry}>Try again</button>}
  </div>
}
