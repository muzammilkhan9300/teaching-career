interface BarChartProps {
  data: { label: string; count: number }[]
  maxBars?: number
}

export function BarChart({ data, maxBars = 8 }: BarChartProps) {
  const rows = data.slice(0, maxBars)
  const max = Math.max(1, ...rows.map((r) => r.count))

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-body">No data yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-xs font-semibold text-navy" title={row.label}>
            {row.label}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-mint/60">
            <div
              className="h-full rounded-full bg-teal transition-all"
              style={{ width: `${Math.max(4, (row.count / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-bold text-navy">{row.count}</span>
        </div>
      ))}
    </div>
  )
}
