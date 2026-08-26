import type { ReactNode } from 'react'
import { SearchIcon } from '@/components/icons'

interface ListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  resultCount?: number
  children?: ReactNode
}

export function ListToolbar({ search, onSearchChange, placeholder = 'Search…', resultCount, children }: ListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-tc sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-line py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
        />
      </div>
      {children}
      {resultCount !== undefined ? <span className="shrink-0 text-xs font-semibold text-body">{resultCount} results</span> : null}
    </div>
  )
}
