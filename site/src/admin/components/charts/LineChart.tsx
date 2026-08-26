interface Series {
  key: string
  label: string
  /** Tailwind `stroke-*` class for the line itself. */
  colorClass: string
  /** Tailwind `bg-*` class for the legend dot — a sibling literal, not
   * derived from colorClass at runtime (Tailwind's scanner only picks up
   * classes that appear as literal strings, so a `.replace('stroke-','bg-')`
   * trick silently produces an unstyled, invisible dot for any color that
   * isn't already used as a bare `bg-*` class elsewhere in the app). */
  dotClass: string
}

interface LineChartProps {
  data: Record<string, string | number>[]
  xKey: string
  series: Series[]
  height?: number
}

const WIDTH = 600

export function LineChart({ data, xKey, series, height = 180 }: LineChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-body">No data yet.</p>
  }

  const max = Math.max(1, ...data.flatMap((row) => series.map((s) => Number(row[s.key]) || 0)))
  const stepX = WIDTH / Math.max(1, data.length - 1)

  function pointsFor(key: string) {
    return data
      .map((row, i) => {
        const x = i * stepX
        const y = height - (Number(row[key]) / max) * (height - 10) - 5
        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <div className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="h-44 w-full" preserveAspectRatio="none">
        <line x1={0} y1={height - 1} x2={WIDTH} y2={height - 1} className="stroke-line" strokeWidth={1} />
        {series.map((s) => (
          <polyline
            key={s.key}
            points={pointsFor(s.key)}
            fill="none"
            className={s.colorClass}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-body">
            <span className={`h-2 w-2 rounded-full ${s.dotClass}`} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-body/70">
        <span>{data[0]?.[xKey]}</span>
        <span>{data[data.length - 1]?.[xKey]}</span>
      </div>
    </div>
  )
}
