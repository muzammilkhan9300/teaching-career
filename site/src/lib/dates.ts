const DAY_MS = 24 * 60 * 60 * 1000

/** "15 Nov 2026" */
export function formatShortDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Whether something published at `value` still counts as "New". */
export function isRecent(value: string | Date, days = 7) {
  return Date.now() - new Date(value).getTime() < days * DAY_MS
}
