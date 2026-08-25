import clsx from 'clsx'
import { ChevronRightIcon } from '@/components/icons'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronRightIcon size={16} className="rotate-180" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={clsx(
            'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition',
            p === page ? 'bg-teal text-white shadow-tc' : 'border border-line text-navy hover:border-teal hover:text-teal',
          )}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRightIcon size={16} />
      </button>
    </nav>
  )
}
