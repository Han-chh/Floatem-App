import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Apple, Arrow, Windows } from './components/Icons'
import { Reveal } from './components/Reveal'
import { release, screenshots, support, themes, type Locale } from './content/site'
import { en } from './locales/en'
import { zh } from './locales/zh'
import './styles/main.css'

type Page = 'home' | 'features' | 'download' | 'support' | 'privacy'
type Translation = typeof zh
const pages: Page[] = ['home', 'features', 'download', 'support', 'privacy']

function route(): Page {
  const value = window.location.hash.replace('#/', '').replace('#', '') as Page
  return pages.includes(value) ? value : 'home'
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
    window.location.hash = next === 'home' ? '' : `/${next}`
    setPage(next)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    localStorage.setItem('floatem-language', locale)
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    document.title = locale === 'zh' ? 'Floatem · 思绪，自由浮现' : 'Floatem · Thoughts, gently afloat'
  }, [locale])
  useEffect(() => {
    const onHash = () => setPage(route())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return <>
    <Header t={t} page={page} locale={locale} setLocale={setLocale} go={go} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <main key={page} className="page-enter">
      {page === 'home' && <Home t={t} locale={locale} go={go} />}
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
    <button className="brand" onClick={() => go('home')} aria-label="Floatem home"><img src="./floatem-icon.svg" alt="" /><span>Floatem</span></button>
    <nav className={menuOpen ? 'open' : ''} aria-label="Main navigation">
      {nav.map((item) => <button key={item} className={page === item ? 'active' : ''} onClick={() => go(item)}>{t.nav[item]}</button>)}
      <button className="language mobile-language" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>{locale === 'zh' ? 'EN' : '中文'}</button>
    </nav>
    <button className="language desktop-language" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>{locale === 'zh' ? 'EN' : '中文'}</button>
    <button className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><i /><i /></button>
  </header>
}

function Home({ t, locale, go }: { t: Translation, locale: Locale, go: (page: Page) => void }) {
  const [themeIndex, setThemeIndex] = useState(0)
  const theme = themes[themeIndex]
  const style = { '--theme': theme.color, '--theme-deep': theme.deep } as CSSProperties
  return <>
    <section className="hero" style={style}>
      <div className="hero-noise" />
      <div className="hero-copy"><p className="eyebrow">{t.home.eyebrow}</p><h1><small>Floatem</small>{t.home.title.map((line) => <span key={line}>{line}</span>)}</h1><p className="hero-body">{t.home.body}</p><div className="hero-actions"><button className="button filled" onClick={() => go('download')}>{t.common.get}<Arrow /></button><button className="inline-link" onClick={() => go('features')}>{t.common.explore}<Arrow /></button></div></div>
      <div className="hero-art" aria-label={locale === 'zh' ? 'Floatem 应用界面示意' : 'Floatem application interface'}>
        <div className="aurora" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="float-window distant"><i /><i /><i /></div>
        <div className="float-window note-window"><div className="window-top"><i /><i /><i /><span>Floatem</span></div><p>{locale === 'zh' ? '今天，想留住什么？' : 'What would you keep today?'}</p><div className="hand-line" /><div className="window-bottom"><span>{locale === 'zh' ? '浮现于此' : 'Float here'}</span><b>↗</b></div></div>
        <div className="floating-caption">{t.home.note}</div>
      </div>
      <div className="hero-release"><span>{t.common.latest}</span><b>v{release.version}</b><i>↓</i></div>
    </section>

    <section className="theme-section">
      <Reveal className="section-heading"><p className="eyebrow">{t.common.allThemes}</p><h2>{splitLines(t.home.themeTitle)}</h2><p>{t.home.themeBody}</p></Reveal>
      <div className="theme-showcase" style={style}>
        <div className="theme-image"><img key={theme.id} src={`.${theme.image}`} alt={`${locale === 'zh' ? theme.zh : theme.en} theme`} /></div>
        <div className="theme-detail"><span>0{themeIndex + 1}</span><strong>{locale === 'zh' ? theme.zh : theme.en}</strong><em>{locale === 'zh' ? '此刻的桌面色彩。' : 'A color for this moment.'}</em></div>
        <div className="theme-picker" aria-label={t.common.allThemes}>{themes.map((item, index) => <button key={item.id} className={index === themeIndex ? 'selected' : ''} style={{ '--dot': item.color } as CSSProperties} onClick={() => setThemeIndex(index)} aria-label={locale === 'zh' ? item.zh : item.en}><i /></button>)}</div>
      </div>
    </section>

    <section className="flow-section">
      <Reveal className="section-heading"><p className="eyebrow">FLOAT WITH YOUR FLOW</p><h2>{splitLines(t.home.flowTitle)}</h2><p>{t.home.flowBody}</p></Reveal>
      <div className="scene-grid">
        <Scene image={screenshots.video} label="01" title={t.home.scenes[0]} />
        <Scene image={screenshots.code} label="02" title={t.home.scenes[1]} />
        <Scene image={screenshots.desktop} label="03" title={t.home.scenes[2]} />
        <Scene image={screenshots.todo} label="04" title={t.home.scenes[3]} />
      </div>
    </section>

    <section className="closing"><div className="closing-sun" /><Reveal><p>Floatem</p><h2>{splitLines(t.home.closing)}</h2><button className="button light" onClick={() => go('download')}>{t.common.get}<Arrow /></button></Reveal></section>
  </>
}

function Scene({ image, label, title }: { image: string, label: string, title: string }) {
  return <Reveal className="scene"><div className="scene-image"><img src={`.${image}`} alt="" /></div><div><span>{label}</span><h3>{title}</h3></div></Reveal>
}

function PageIntro({ label, title, intro, children }: { label: string, title: string, intro: string, children: ReactNode }) {
  return <><section className="page-intro"><div><p className="eyebrow">{label}</p><h1>{splitLines(title)}</h1><p>{intro}</p></div><div className="intro-art"><i /><i /><i /></div></section>{children}</>
}

function Features({ t, go }: { t: Translation, go: (page: Page) => void }) {
  const images = [screenshots.desktop, screenshots.todo, screenshots.code, themes[3].image]
  return <PageIntro label={t.features.label} title={t.features.title} intro={t.features.intro}>
    <section className="feature-list">{t.features.items.map(([number, title, body], index) => <Reveal className="feature-row" key={number}><span>{number}</span><div><h2>{title}</h2><p>{body}</p></div><img src={`.${images[index]}`} alt="" /></Reveal>)}</section>
    <section className="quiet-cta"><p>{t.home.closing.replace('\n', ' ')}</p><button className="button filled" onClick={() => go('download')}>{t.common.get}<Arrow /></button></section>
  </PageIntro>
}

function Download({ t, locale }: { t: Translation, locale: Locale }) {
  const hasWindows = Boolean(release.windowsDownload)
  return <PageIntro label={t.download.label} title={t.download.title} intro={t.download.intro}>
    <section className="platform-list">
      <a className="platform-row mac" href={release.macDownload} target="_blank" rel="noreferrer"><Apple /><div><span>macOS</span><h2>{t.download.mac}</h2><p>{release.macRequirement}</p></div><Arrow diagonal /></a>
      {hasWindows ? <a className="platform-row windows" href={release.windowsDownload} target="_blank" rel="noreferrer"><Windows /><div><span>Windows</span><h2>{t.download.windows}</h2><p>{release.windowsRequirement}</p></div><Arrow diagonal /></a> : <div className="platform-row disabled"><Windows /><div><span>Windows</span><h2>{t.download.windows}</h2><p>{release.windowsRequirement}</p></div><b>{t.download.coming}</b></div>}
    </section>
    <section className="release-detail"><div><p className="eyebrow">{t.download.current}</p><h2>v{release.version}</h2><time>{release.date}</time></div><div><p className="eyebrow">{t.download.update}</p><ul>{release.notes.map((note) => <li key={note.en}>{note[locale]}</li>)}</ul></div></section>
    <p className="requirement">{t.download.requirement}：{release.macRequirement}。Windows：{release.windowsRequirement}。</p>
  </PageIntro>
}

function Support({ t }: { t: Translation }) {
  const [open, setOpen] = useState(0)
  return <PageIntro label={t.support.label} title={t.support.title} intro={t.support.intro}>
    <a className="support-contact" href={`mailto:${support.email}?subject=Floatem%20Support`}><span>{t.support.contact}</span><strong>{support.email}</strong><Arrow diagonal /></a>
    <section className="faq"><p className="eyebrow">{t.support.faq}</p>{t.support.questions.map(([question, answer], index) => <button className={`faq-item ${open === index ? 'expanded' : ''}`} key={question} onClick={() => setOpen(open === index ? -1 : index)}><div><span>0{index + 1}</span><h2>{question}</h2><b>+</b></div><p>{answer}</p></button>)}</section>
  </PageIntro>
}

function Privacy({ t }: { t: Translation }) {
  return <PageIntro label={t.privacy.label} title={t.privacy.title} intro={t.privacy.updated}>
    <article className="policy">{t.privacy.sections.map(([heading, body], index) => <Reveal key={heading}><span>0{index + 1}</span><div><h2>{heading}</h2><p>{body}</p></div></Reveal>)}</article>
  </PageIntro>
}

function Footer({ t, go }: { t: Translation, go: (page: Page) => void }) {
  return <footer><button className="footer-brand" onClick={() => go('home')}><img src="./floatem-icon.svg" alt="" /><strong>Floatem</strong><span>© {new Date().getFullYear()} Floatem</span></button><div><button onClick={() => go('support')}>{t.nav.support}</button><button onClick={() => go('privacy')}>{t.nav.privacy}</button><a href={`mailto:${support.email}`}>{support.email}</a></div></footer>
}

createRoot(document.getElementById('root')!).render(<App />)
