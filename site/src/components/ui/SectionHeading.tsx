import clsx from 'clsx'

interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  accent?: string
  text?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ eyebrow, title, text, align = 'left', className }: SectionHeadingProps) {
  return (
    <div className={clsx('flex flex-col gap-4', align === 'center' && 'items-center text-center', className)}>
      {eyebrow ? (
        <span className="inline-flex w-fit items-center rounded-full bg-badge px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-deep">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-extrabold leading-tight text-navy sm:text-4xl">{title}</h2>
      {text ? <p className="max-w-2xl text-base leading-relaxed text-body">{text}</p> : null}
      <span className="h-1 w-16 rounded-full bg-teal" aria-hidden="true" />
    </div>
  )
}
