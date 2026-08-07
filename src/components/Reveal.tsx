import { PropsWithChildren, useEffect, useRef } from 'react'

export function Reveal({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && node.classList.add('is-visible'), { threshold: 0.12 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}
