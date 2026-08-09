import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'
import { OptimizedImage } from './components/OptimizedImage'
import { appIconImage, botanicalImage } from './content/rootMedia'
import { support, type Locale } from './content/site'
import { en } from './locales/en'
import { zh } from './locales/zh'
import './styles/main.css'

type Page = 'features' | 'download' | 'support' | 'privacy'
type Translation = typeof zh
const pages: Page[] = ['features', 'download', 'support', 'privacy']

const FeaturesPage = lazy(() => import('./pages/FeaturesPage'))
const DownloadPage = lazy(() => import('./pages/DownloadPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))

function route(): Page {
  const value = window.location.hash.replace('#/', '').replace('#', '') as Page
  return pages.includes(value) ? value : 'features'
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

  return <div className="app-shell" style={{ '--botanical-image': `url("${botanicalImage}")` } as CSSProperties}>
    <Header t={t} page={page} locale={locale} setLocale={setLocale} go={go} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <Suspense fallback={<main className="page-enter page-loading" aria-live="polite" aria-label="Loading page" />}>
      <main key={page} className="page-enter">
        {page === 'features' && <FeaturesPage t={t} go={go} />}
        {page === 'download' && <DownloadPage t={t} locale={locale} />}
        {page === 'support' && <SupportPage t={t} />}
        {page === 'privacy' && <PrivacyPage t={t} />}
      </main>
    </Suspense>
    <Footer t={t} go={go} />
  </div>
}

function Header({ t, page, locale, setLocale, go, menuOpen, setMenuOpen }: { t: Translation, page: Page, locale: Locale, setLocale: (locale: Locale) => void, go: (page: Page) => void, menuOpen: boolean, setMenuOpen: (open: boolean) => void }) {
  const nav = ['features', 'download', 'support', 'privacy'] as const
  return <header className="site-header">
    <button className="brand" onClick={() => go('features')} aria-label="Floatem features"><OptimizedImage {...appIconImage} className="app-icon" wrapperClassName="app-icon-frame" sizes="27px" alt="" priority /><span>Floatem</span></button>
    <nav className={menuOpen ? 'open' : ''} aria-label="Main navigation">
      {nav.map((item) => <button key={item} className={page === item ? 'active' : ''} onClick={() => go(item)}>{t.nav[item]}</button>)}
      <button className="language mobile-language" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>{locale === 'zh' ? 'EN' : '中文'}</button>
    </nav>
    <button className="language desktop-language" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>{locale === 'zh' ? 'EN' : '中文'}</button>
    <button className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><i /><i /></button>
  </header>
}

function Footer({ t, go }: { t: Translation, go: (page: Page) => void }) {
  return <footer><button className="footer-brand" onClick={() => go('features')}><OptimizedImage {...appIconImage} className="app-icon" wrapperClassName="app-icon-frame footer-icon" sizes="28px" alt="" /><strong>Floatem</strong><span>© {new Date().getFullYear()} Floatem</span></button><div><button onClick={() => go('support')}>{t.nav.support}</button><button onClick={() => go('privacy')}>{t.nav.privacy}</button><a href={`mailto:${support.email}`}>{support.email}</a></div></footer>
}

createRoot(document.getElementById('root')!).render(<App />)
