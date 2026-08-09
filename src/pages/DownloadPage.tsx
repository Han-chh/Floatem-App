import { Apple, Arrow } from '../components/Icons'
import { release, type Locale } from '../content/site'
import { zh } from '../locales/zh'
import { PageIntro } from './PageIntro'

type Translation = typeof zh

export default function DownloadPage({ t, locale }: { t: Translation, locale: Locale }) {
  return <PageIntro label={t.download.label} title={t.download.title} intro={t.download.intro}>
    <section className="platform-list">
      <a className="platform-row mac" href={release.macDownload} target="_blank" rel="noreferrer"><Apple /><div><span>macOS</span><h2>{t.download.mac}</h2><p>{release.macRequirement[locale]}</p></div><Arrow diagonal /></a>
    </section>
    <section className="release-detail"><div><p className="eyebrow">{t.download.current}</p><h2>v{release.version}</h2><time>{release.date}</time></div><div><p className="eyebrow">{t.download.update}</p><ul>{release.notes.map((note) => <li key={note.en}>{note[locale]}</li>)}</ul></div></section>
    <p className="requirement">{locale === 'zh' ? `${t.download.requirement}：${release.macRequirement.zh}。` : `${t.download.requirement}: ${release.macRequirement.en}.`}</p>
  </PageIntro>
}
