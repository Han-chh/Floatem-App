import { Reveal } from '../components/Reveal'
import { zh } from '../locales/zh'
import { PageIntro } from './PageIntro'

type Translation = typeof zh

export default function PrivacyPage({ t }: { t: Translation }) {
  return <PageIntro label={t.privacy.label} title={t.privacy.title} intro={t.privacy.updated}>
    <article className="policy">{t.privacy.sections.map(([heading, body], index) => <Reveal key={heading}><span>0{index + 1}</span><div><h2>{heading}</h2><p>{body}</p></div></Reveal>)}</article>
  </PageIntro>
}
