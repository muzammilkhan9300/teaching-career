import type { ReactNode } from 'react'
import { ChevronRightIcon } from '@/components/icons'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  actions?: (row: T) => ReactNode
  emptyMessage?: string
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  actions,
  emptyMessage = 'No records yet.',
  sortKey,
  sortDir,
  onSort,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-tc">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/40">
              {columns.map((col) => (
                <th key={col.key} className={`whitespace-nowrap px-4 py-3 font-bold text-navy ${col.className ?? ''}`}>
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className="flex items-center gap-1 hover:text-teal-deep"
                    >
                      {col.label}
                      <ChevronRightIcon
                        size={13}
                        className={
                          sortKey === col.key
                            ? sortDir === 'asc'
                              ? '-rotate-90 text-teal-deep'
                              : 'rotate-90 text-teal-deep'
                            : 'rotate-90 text-body/40'
                        }
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {actions ? <th className="px-4 py-3 text-right font-bold text-navy">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-10 text-center text-body">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-line last:border-0 hover:bg-mint/20">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 align-top text-navy ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                  {actions ? <td className="px-4 py-3 text-right">{actions(row)}</td> : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
