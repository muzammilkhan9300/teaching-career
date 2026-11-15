import { StatusBadge } from '@/admin/components/StatusBadge'
import { formatShortDate } from '@/lib/dates'

export function StatusCell({ status }: { status: string }) {
  return <StatusBadge status={status} />
}

export function DateCell({ value }: { value: string | null | undefined }) {
  return <span className="whitespace-nowrap">{value ? formatShortDate(value) : '—'}</span>
}

export function Thumbnail({ src }: { src: string }) {
  return src ? (
    <img src={src} alt="" className="h-10 w-16 rounded-md object-cover" />
  ) : (
    <span className="flex h-10 w-16 items-center justify-center rounded-md bg-mint text-[10px] text-body">None</span>
  )
}
