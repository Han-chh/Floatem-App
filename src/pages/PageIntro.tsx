import type { ReactNode } from 'react'

function splitLines(value: string) {
  return value.split('\n').map((line) => <span key={line}>{line}</span>)
}

export function PageIntro({ label, title, intro, className = '', actions, children }: { label: string, title: string, intro: string, className?: string, actions?: ReactNode, children: ReactNode }) {
  return <><section className={`page-intro${className ? ` ${className}` : ''}`}><div><p className="eyebrow">{label}</p><h1>{splitLines(title)}</h1><p>{intro}</p>{actions && <div className="page-intro-actions">{actions}</div>}</div></section>{children}</>
}
