export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M9 5h10v10' : 'M4 12h16m-6-6 6 6-6 6'} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export function Apple() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 12.8c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.1-.9C6.9 7.2 5.4 8.1 4.6 9.6c-1.6 2.8-.4 6.9 1.1 9.1.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2-1.1 2.8-2.2.8-1.2 1.2-2.4 1.2-2.5-.1 0-2-0.8-2-3.4zm-2.4-7.2c.6-.8 1-1.9.9-3-.9 0-2.1.6-2.7 1.3-.6.7-1 1.8-.9 2.9 1 0 2.1-.5 2.7-1.2z" /></svg> }

export function Windows() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m3 5.1 7.3-1v7H3V5.1Zm8.2-1.1L21 2.6v8.5h-9.8V4Zm-8.2 8h7.3v7l-7.3-1V12Zm8.2 0H21v9.4l-9.8-1.4v-8Z" /></svg> }
