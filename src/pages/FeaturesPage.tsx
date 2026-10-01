import { useEffect, useRef, useState } from 'react'
import { Arrow } from '../components/Icons'
import { FloatplaneDemo } from '../components/FloatplaneDemo'
import { OptimizedImage } from '../components/OptimizedImage'
import { OptimizedVideo } from '../components/OptimizedVideo'
import { Reveal } from '../components/Reveal'
import { screenshots, type Locale } from '../content/site'
import { zh } from '../locales/zh'
import { PageIntro } from './PageIntro'
import { featureImages, featureVideos } from './featuresMedia'

type Translation = typeof zh
type DemoPhase = 'open' | 'closing' | 'closed' | 'preparing' | 'opening'

export default function FeaturesPage({ t, locale, go }: { t: Translation, locale: Locale, go: (page: 'download') => void }) {
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('open')
  const demoColumnRef = useRef<HTMLElement>(null)
  const restoreControlRef = useRef<HTMLButtonElement>(null)
  const phaseTimerRef = useRef<number | undefined>(undefined)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const localizedScreenshots = screenshots.appStore[locale]
  const images = [localizedScreenshots.floating, localizedScreenshots.desktop, localizedScreenshots.tasks, localizedScreenshots.guide, localizedScreenshots.themes]
  const videos = ['/videos/floatem-card-float-demo.mp4', '/videos/floatem-capture-demo-safe.mp4', '/videos/floatem-reminder-demo.mp4', '/videos/floatem-guide-onboarding-demo.mp4']
  const restoreDemoLabel = locale === 'zh' ? '展开 Preview' : 'Expand preview'

  useEffect(() => () => {
    if (phaseTimerRef.current) window.clearTimeout(phaseTimerRef.current)
    if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current)
  }, [])

  function setCollapseVector() {
    const demo = demoColumnRef.current
    const control = restoreControlRef.current
    if (!demo || !control) return

    // Measure the panel without its preparing transform so both directions use
    // the same origin and finish at the restore control's exact dimensions.
    demo.style.setProperty('transition', 'none')
    demo.style.setProperty('transform', 'none')
    const demoRect = demo.getBoundingClientRect()
    demo.style.removeProperty('transform')
    demo.style.removeProperty('transition')
    control.style.setProperty('transition', 'none')
    control.style.setProperty('scale', '1')
    const controlRect = control.getBoundingClientRect()
    control.style.removeProperty('scale')
    control.style.removeProperty('transition')
    const x = controlRect.left + controlRect.width / 2 - (demoRect.left + demoRect.width / 2)
    const y = controlRect.top + controlRect.height / 2 - (demoRect.top + demoRect.height / 2)
    demo.style.setProperty('--demo-collapse-x', `${x}px`)
    demo.style.setProperty('--demo-collapse-y', `${y}px`)
    demo.style.setProperty('--demo-collapse-scale-x', `${control.offsetWidth / demoRect.width}`)
    demo.style.setProperty('--demo-collapse-scale-y', `${control.offsetHeight / demoRect.height}`)
    const stops = [['04', .04], ['10', .1], ['20', .2], ['34', .34], ['50', .5], ['66', .66], ['80', .8], ['90', .9], ['96', .96]] as const
    stops.forEach(([name, factor]) => {
      demo.style.setProperty(`--demo-collapse-x-${name}`, `${x * factor}px`)
      demo.style.setProperty(`--demo-collapse-y-${name}`, `${y * factor}px`)
    })
  }

  function collapseDemo() {
    if (demoPhase !== 'open') return
    setCollapseVector()
    setDemoPhase('closing')
    phaseTimerRef.current = window.setTimeout(() => setDemoPhase('closed'), 440)
  }

  function expandDemo() {
    if (demoPhase !== 'closed') return
    setDemoPhase('preparing')
    animationFrameRef.current = window.requestAnimationFrame(() => {
      setCollapseVector()
      setDemoPhase('opening')
      phaseTimerRef.current = window.setTimeout(() => setDemoPhase('open'), 480)
    })
  }

  return <PageIntro label={t.features.label} title={t.features.title} intro={t.features.intro} className="features-intro" actions={<div className="features-intro-cta"><p>Don't lose thoughts, Float 'em.</p><button className="button filled" onClick={() => go('download')}>{t.common.get}<Arrow /></button></div>}>
    <section className={`feature-experience feature-experience-${demoPhase === 'closed' ? 'story' : 'split'} feature-experience-phase-${demoPhase}`}>
      <button ref={restoreControlRef} className="feature-demo-restore" onClick={expandDemo} aria-label={restoreDemoLabel} title={restoreDemoLabel} aria-hidden={demoPhase !== 'closed'} tabIndex={demoPhase === 'closed' ? 0 : -1} disabled={demoPhase !== 'closed'}><span aria-hidden="true" /></button>
      <div className="feature-experience-grid">
        <div className="feature-story-pane">
          <div className="feature-story"><section className="feature-list">{t.features.items.map(([number, title, body, scenario, detail], index) => <Reveal className={`feature-row${number === '05' ? ' feature-row-stacked' : ''}`} key={number}><span>{number}</span><div><h2>{title}</h2><p>{body}</p><p className="feature-scenario">{scenario}</p><small className={number === '03' ? 'feature-step-chain' : undefined}>{detail}</small></div><FeatureVisual image={images[index]} videoSrc={videos[index]} /></Reveal>)}</section></div>
        </div>
        <aside className="feature-demo-column" ref={demoColumnRef}>
          <FloatplaneDemo siteLocale={locale} onCollapse={collapseDemo} />
        </aside>
      </div>
    </section>
  </PageIntro>
}

function FeatureVisual({ image, videoSrc }: { image: string, videoSrc?: string }) {
  return <><div className="feature-image"><OptimizedImage {...featureImages[image]} sizes="(max-width: 760px) 82vw, 330px" alt="" /></div>{videoSrc && <FeatureVideo src={videoSrc} />}</>
}

function FeatureVideo({ src }: { src: string }) {
  const isGuideDemo = src === '/videos/floatem-guide-onboarding-demo.mp4'
  return <div className={`feature-video feature-video-wide${isGuideDemo ? ' feature-video-guide' : ''}`}><OptimizedVideo {...featureVideos[src as keyof typeof featureVideos]} label={isGuideDemo ? 'Floatem interactive guide demonstration' : 'Floatem feature demonstration'} /></div>
}
