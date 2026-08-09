import { Arrow } from '../components/Icons'
import { OptimizedImage } from '../components/OptimizedImage'
import { OptimizedVideo } from '../components/OptimizedVideo'
import { Reveal } from '../components/Reveal'
import { screenshots } from '../content/site'
import { zh } from '../locales/zh'
import { PageIntro } from './PageIntro'
import { featureImages, featureVideos } from './featuresMedia'

type Translation = typeof zh

export default function FeaturesPage({ t, go }: { t: Translation, go: (page: 'download') => void }) {
  const images = [screenshots.appStore.floating, screenshots.appStore.desktop, screenshots.appStore.tasks, screenshots.appStore.guide, screenshots.appStore.themes]
  const videos = ['/videos/floatem-card-float-demo.mp4', '/videos/floatem-capture-demo-safe.mp4', '/videos/floatem-todo-demo.mp4']
  return <PageIntro label={t.features.label} title={t.features.title} intro={t.features.intro}>
    <section className="quiet-cta"><p>Don't lose thoughts, Float 'em.</p><button className="button filled" onClick={() => go('download')}>{t.common.get}<Arrow /></button></section>
    <section className="feature-list">{t.features.items.map(([number, title, body, scenario, detail], index) => <Reveal className="feature-row" key={number}><span>{number}</span><div><h2>{title}</h2><p>{body}</p><p className="feature-scenario">{scenario}</p><small className={number === '03' ? 'feature-step-chain' : undefined}>{detail}</small></div><FeatureVisual image={images[index]} videoSrc={videos[index]} /></Reveal>)}</section>
  </PageIntro>
}

function FeatureVisual({ image, videoSrc }: { image: string, videoSrc?: string }) {
  return <><div className="feature-image"><OptimizedImage {...featureImages[image]} sizes="(max-width: 760px) 82vw, 330px" alt="" /></div>{videoSrc && <FeatureVideo src={videoSrc} />}</>
}

function FeatureVideo({ src }: { src: string }) {
  return <div className="feature-video feature-video-wide"><OptimizedVideo {...featureVideos[src as keyof typeof featureVideos]} label="Floatem feature demonstration" /></div>
}
