import type { StatusAction } from '@/admin/components/ContentManager'

/** Today as a <input type="date"> value (YYYY-MM-DD). */
export const todayInput = () => new Date().toISOString().slice(0, 10)

export function publishActions(row: { status: string }): StatusAction[] {
  return row.status === 'Published'
    ? [{ action: 'unpublish', label: 'Unpublish', done: 'unpublished' }]
    : [{ action: 'publish', label: 'Publish', done: 'published' }]
}
