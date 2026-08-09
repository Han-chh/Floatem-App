import { useState } from 'react'
import { Arrow } from '../components/Icons'
import { support } from '../content/site'
import { zh } from '../locales/zh'
import { PageIntro } from './PageIntro'

type Translation = typeof zh

export default function SupportPage({ t }: { t: Translation }) {
  const [open, setOpen] = useState(0)
  return <PageIntro label={t.support.label} title={t.support.title} intro={t.support.intro}>
    <section className="support-contact"><div><p>{t.support.contact}</p><h2>{t.support.contactTitle}</h2><span>{t.support.contactHint}</span></div><a href={`mailto:${support.email}?subject=Floatem%20Support`}><em>{support.email}</em><Arrow diagonal /></a><ul>{t.support.contactTopics.map((topic) => <li key={topic}>{topic}</li>)}</ul></section>
    <section className="faq"><p className="eyebrow">{t.support.faq}</p>{t.support.questions.map(([question, answer], index) => <button className={`faq-item ${open === index ? 'expanded' : ''}`} key={question} onClick={() => setOpen(open === index ? -1 : index)}><div><span>0{index + 1}</span><h2>{question}</h2><b>+</b></div><p>{answer}</p></button>)}</section>
  </PageIntro>
}
