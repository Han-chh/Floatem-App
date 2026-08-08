import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Apple, Arrow } from './components/Icons'
import { Reveal } from './components/Reveal'
import { release, screenshots, support, type Locale } from './content/site'
import { en } from './locales/en'
import { zh } from './locales/zh'
import './styles/main.css'

type Page = 'features' | 'download' | 'support' | 'privacy'
type Translation = typeof zh
const pages: Page[] = ['features', 'download', 'support', 'privacy']

function route(): Page {
  const value = window.location.hash.replace('#/', '').replace('#', '') as Page
  return pages.includes(value) ? value : 'features'
}

function splitLines(value: string) {
  return value.split('\n').map((line) => <span key={line}>{line}</span>)
}

function App() {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('floatem-language') as Locale) || 'zh')
  const [page, setPage] = useState<Page>(route)
  const [menuOpen, setMenuOpen] = useState(false)
  const t = locale === 'zh' ? zh : en
  const go = (next: Page) => {
    window.location.hash = `/${next}`
    setPage(next)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    localStorage.setItem('floatem-language', locale)
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    document.title = 'Floatem · Let’s Float’em'
  }, [locale])
  useEffect(() => {
    const onHash = () => setPage(route())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return <>
    <Header t={t} page={page} locale={locale} setLocale={setLocale} go={go} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <main key={page} className="page-enter">
      {page === 'features' && <Features t={t} go={go} />}
      {page === 'download' && <Download t={t} locale={locale} />}
      {page === 'support' && <Support t={t} />}
      {page === 'privacy' && <Privacy t={t} />}
    </main>
    <Footer t={t} go={go} />
  </>
}

function Header({ t, page, locale, setLocale, go, menuOpen, setMenuOpen }: { t: Translation, page: Page, locale: Locale, setLocale: (locale: Locale) => void, go: (page: Page) => void, menuOpen: boolean, setMenuOpen: (open: boolean) => void }) {
  const nav = ['features', 'download', 'support', 'privacy'] as const
  return <header className="site-header">
    <button className="brand" onClick={() => go('features')} aria-label="Floatem features"><img className="app-icon" src="./floatem-app-icon-macos.png" alt="" /><span>Floatem</span></button>
    <nav className={menuOpen ? 'open' : ''} aria-label="Main navigation">
      {nav.map((item) => <button key={item} className={page === item ? 'active' : ''} onClick={() => go(item)}>{t.nav[item]}</button>)}
      <button className="language mobile-language" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>{locale === 'zh' ? 'EN' : '中文'}</button>
    </nav>
    <button className="language desktop-language" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>{locale === 'zh' ? 'EN' : '中文'}</button>
    <button className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><i /><i /></button>
  </header>
}

function PageIntro({ label, title, intro, children }: { label: string, title: string, intro: string, children: ReactNode }) {
  return <><section className="page-intro"><div><p className="eyebrow">{label}</p><h1>{splitLines(title)}</h1><p>{intro}</p></div></section>{children}</>
}

function Features({ t, go }: { t: Translation, go: (page: Page) => void }) {
  const images = [screenshots.appStore.floating, screenshots.appStore.desktop, screenshots.appStore.tasks, screenshots.appStore.guide, screenshots.appStore.themes]
  const videos = ['./videos/floatem-card-float-demo.mp4', './videos/floatem-capture-demo-safe.mp4', './videos/floatem-todo-demo.mp4']
  return <PageIntro label={t.features.label} title={t.features.title} intro={t.features.intro}>
    <section className="quiet-cta"><p>Don't lose thoughts, Float 'em.</p><button className="button filled" onClick={() => go('download')}>{t.common.get}<Arrow /></button></section>
    <section className="feature-list">{t.features.items.map(([number, title, body, scenario, detail], index) => <Reveal className="feature-row" key={number}><span>{number}</span><div><h2>{title}</h2><p>{body}</p><p className="feature-scenario">{scenario}</p>{number === '03' ? <ol className="feature-step-chain">{detail.split(' → ').map((step, stepIndex) => <li key={`${stepIndex}-${step}`}><span>{String(stepIndex + 1).padStart(2, '0')}</span><strong>{step}</strong></li>)}</ol> : <small>{detail}</small>}</div><FeatureVisual image={images[index]} videoSrc={videos[index]} /></Reveal>)}</section>
  </PageIntro>
}

function FeatureVisual({ image, videoSrc }: { image: string, videoSrc?: string }) {
  return <><div className="feature-image"><img src={`.${image}`} alt="" /></div>{videoSrc && <FeatureVideo poster={image} src={videoSrc} />}</>
}

function FeatureVideo({ poster, src }: { poster: string, src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const play = () => { video.muted = true; void video.play().catch(() => undefined) }
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting ? play() : video.pause(), { threshold: .35 })
    observer.observe(video)
    play()
    return () => observer.disconnect()
  }, [])
  return <div className="feature-video feature-video-wide"><video ref={videoRef} autoPlay loop muted playsInline preload="auto" poster={`.${poster}`} onCanPlay={(event) => { event.currentTarget.muted = true; void event.currentTarget.play().catch(() => undefined) }}><source src={src} type="video/mp4" /></video></div>
}

function Download({ t, locale }: { t: Translation, locale: Locale }) {
  return <PageIntro label={t.download.label} title={t.download.title} intro={t.download.intro}>
    <section className="platform-list">
      <a className="platform-row mac" href={release.macDownload} target="_blank" rel="noreferrer"><Apple /><div><span>macOS</span><h2>{t.download.mac}</h2><p>{release.macRequirement[locale]}</p></div><Arrow diagonal /></a>
    </section>
    <section className="release-detail"><div><p className="eyebrow">{t.download.current}</p><h2>v{release.version}</h2><time>{release.date}</time></div><div><p className="eyebrow">{t.download.update}</p><ul>{release.notes.map((note) => <li key={note.en}>{note[locale]}</li>)}</ul></div></section>
    <p className="requirement">{locale === 'zh' ? `${t.download.requirement}：${release.macRequirement.zh}。` : `${t.download.requirement}: ${release.macRequirement.en}.`}</p>
  </PageIntro>
}

function Support({ t }: { t: Translation }) {
  const [open, setOpen] = useState(0)
  return <PageIntro label={t.support.label} title={t.support.title} intro={t.support.intro}>
    <section className="support-contact"><div><p>{t.support.contact}</p><h2>{t.support.contactTitle}</h2><span>{t.support.contactHint}</span></div><a href={`mailto:${support.email}?subject=Floatem%20Support`}><em>{support.email}</em><Arrow diagonal /></a><ul>{t.support.contactTopics.map((topic) => <li key={topic}>{topic}</li>)}</ul></section>
    <section className="faq"><p className="eyebrow">{t.support.faq}</p>{t.support.questions.map(([question, answer], index) => <button className={`faq-item ${open === index ? 'expanded' : ''}`} key={question} onClick={() => setOpen(open === index ? -1 : index)}><div><span>0{index + 1}</span><h2>{question}</h2><b>+</b></div><p>{answer}</p></button>)}</section>
  </PageIntro>
}

function Privacy({ t }: { t: Translation }) {
  return <PageIntro label={t.privacy.label} title={t.privacy.title} intro={t.privacy.updated}>
    <article className="policy">{t.privacy.sections.map(([heading, body], index) => <Reveal key={heading}><span>0{index + 1}</span><div><h2>{heading}</h2><p>{body}</p></div></Reveal>)}</article>
  </PageIntro>
}

function Footer({ t, go }: { t: Translation, go: (page: Page) => void }) {
  return <footer><button className="footer-brand" onClick={() => go('features')}><img className="app-icon" src="./floatem-app-icon-macos.png" alt="" /><strong>Floatem</strong><span>© {new Date().getFullYear()} Floatem</span></button><div><button onClick={() => go('support')}>{t.nav.support}</button><button onClick={() => go('privacy')}>{t.nav.privacy}</button><a href={`mailto:${support.email}`}>{support.email}</a></div></footer>
}

createRoot(document.getElementById('root')!).render(<App />)
