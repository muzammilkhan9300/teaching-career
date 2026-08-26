import { useMemo, useState } from 'react'

interface TableControlsOptions<T> {
  /** Fields checked against the search box, in priority order. */
  searchKeys: (keyof T)[]
  pageSize?: number
  defaultSortKey?: keyof T
}

export function useTableControls<T extends object>(rows: T[], options: TableControlsOptions<T>) {
  const { searchKeys, pageSize = 10, defaultSortKey } = options

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultSortKey)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  function toggleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(query)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  return {
    search,
    setSearch: updateSearch,
    sortKey,
    sortDir,
    toggleSort,
    page: safePage,
    setPage,
    totalPages,
    totalCount: sorted.length,
    rows: pageRows,
  }
}
