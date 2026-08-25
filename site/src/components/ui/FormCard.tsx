import type { ReactNode } from 'react'

export function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-line bg-white p-6 shadow-tc sm:p-10">{children}</div>
  )
}

export function FormSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="border-b border-line pb-2 text-sm font-extrabold uppercase tracking-wide text-teal-deep">
      {children}
    </p>
  )
}
