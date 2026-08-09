import { useState, type CSSProperties } from 'react'
import { Arrow } from '../components/Icons'
import { OptimizedImage } from '../components/OptimizedImage'
import { Reveal } from '../components/Reveal'
import { release, screenshots, themes, type Locale } from '../content/site'
import { zh } from '../locales/zh'
import { homeImages } from './homeMedia'

type Translation = typeof zh

function splitLines(value: string) {
  return value.split('\n').map((line) => <span key={line}>{line}</span>)
}

export default function HomePage({ t, locale, go }: { t: Translation, locale: Locale, go: (page: 'features' | 'download') => void }) {
  const [themeIndex, setThemeIndex] = useState(0)
  const theme = themes[themeIndex]
  const style = { '--theme': theme.color, '--theme-deep': theme.deep } as CSSProperties
  return <>
    <section className="hero" style={style}>
      <div className="hero-noise" />
      <div className="hero-copy"><p className="eyebrow">{t.home.eyebrow}</p><h1><small>Floatem</small>{t.home.title.map((line) => <span key={line}>{line}</span>)}</h1><p className="hero-body">{t.home.body}</p><div className="hero-actions"><button className="button filled" onClick={() => go('download')}>{t.common.get}<Arrow /></button><button className="inline-link" onClick={() => go('features')}>{t.common.explore}<Arrow /></button></div></div>
      <div className="hero-art" aria-label={locale === 'zh' ? 'Floatem 应用界面示意' : 'Floatem application interface'}>
        <div className="hero-screenshot"><OptimizedImage {...homeImages[screenshots.homeHero]} sizes="(max-width: 760px) 110vw, 52vw" priority alt={locale === 'zh' ? 'Floatem 在代码、视频与桌面工作场景中的悬浮卡片' : 'Floatem floating cards across code, video, and desktop work'} /></div>
        <div className="floating-caption">{t.home.note}</div>
      </div>
      <div className="hero-release"><span>{t.common.latest}</span><b>v{release.version}</b><i>↓</i></div>
    </section>

    <section className="theme-section">
      <Reveal className="section-heading"><p className="eyebrow">{t.common.allThemes}</p><h2>{splitLines(t.home.themeTitle)}</h2><p>{t.home.themeBody}</p></Reveal>
      <div className="theme-showcase" style={style}>
        <div className="theme-image"><OptimizedImage key={theme.id} {...homeImages[theme.image]} sizes="(max-width: 760px) 78vw, 57vw" alt={`${locale === 'zh' ? theme.zh : theme.en} theme`} /></div>
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
  return <Reveal className="scene"><div className="scene-image"><OptimizedImage {...homeImages[image]} sizes="(max-width: 760px) 88vw, 50vw" alt="" /></div><div><span>{label}</span><h3>{title}</h3></div></Reveal>
}
