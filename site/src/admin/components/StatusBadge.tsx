import clsx from 'clsx'

const STATUS_STYLES: Record<string, string> = {
  New: 'bg-badge text-teal-deep',
  Reviewed: 'bg-blue-50 text-blue-700',
  Contacted: 'bg-blue-50 text-blue-700',
  Approved: 'bg-mint text-teal-deep',
  Rejected: 'bg-red-50 text-red-600',
  Applied: 'bg-badge text-teal-deep',
  Pending: 'bg-amber-50 text-amber-700',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold',
        STATUS_STYLES[status] ?? 'bg-mint text-teal-deep',
      )}
    >
      {status}
    </span>
  )
}

const STATUS_OPTIONS = ['New', 'Reviewed', 'Contacted', 'Approved', 'Rejected'] as const

export function StatusSelect({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <select
      value={STATUS_OPTIONS.includes(value as (typeof STATUS_OPTIONS)[number]) ? value : STATUS_OPTIONS[0]}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-navy outline-none focus:border-teal disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}
