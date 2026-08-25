import type { ReactNode } from 'react'

interface PageHeroProps {
  eyebrow?: string
  title: ReactNode
  text?: string
  children?: ReactNode
}

export function PageHero({ eyebrow, title, text, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-mint/40 py-14" aria-label={typeof title === 'string' ? title : undefined}>
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-badge blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-mint-2 blur-3xl" aria-hidden="true" />

      <div className="tc-container relative flex flex-col items-center gap-4 text-center">
        {eyebrow ? (
          <span className="w-fit rounded-full bg-badge px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-deep">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-navy sm:text-4xl">{title}</h1>
        {text ? <p className="max-w-2xl text-base leading-relaxed text-body">{text}</p> : null}
        <span className="h-1 w-16 rounded-full bg-teal" aria-hidden="true" />
        {children}
      </div>
    </section>
  )
}
