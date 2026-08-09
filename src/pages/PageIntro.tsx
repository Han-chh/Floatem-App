import type { ReactNode } from 'react'

function splitLines(value: string) {
  return value.split('\n').map((line) => <span key={line}>{line}</span>)
}

export function PageIntro({ label, title, intro, children }: { label: string, title: string, intro: string, children: ReactNode }) {
  return <><section className="page-intro"><div><p className="eyebrow">{label}</p><h1>{splitLines(title)}</h1><p>{intro}</p></div></section>{children}</>
}
