import { ContentManager } from '@/admin/components/ContentManager'
import type { FieldConfig } from '@/admin/components/ResourceFormModal'
import type { Column } from '@/admin/components/DataTable'
import type { HomepageUpdate } from '@/types'
import { DateCell, StatusCell, Thumbnail } from './shared'
import { publishActions, todayInput } from './helpers'

const FIELDS: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Beacon School joins TeachingCareer' },
  { name: 'publishedAt', label: 'Publication Date', type: 'date', required: true },
  { name: 'description', label: 'Short Description', type: 'textarea', required: true },
  { name: 'image', label: 'School Logo or Image', type: 'image' },
  {
    name: 'readMoreUrl',
    label: 'Read More Link',
    type: 'text',
    placeholder: '/blog/article-slug or https://…',
    hint: 'Optional. A site path (starting with /) or a full https:// link.',
  },
  { name: 'order', label: 'Display Order', type: 'number', hint: 'Lower numbers show first; equal numbers show newest first.' },
]

const COLUMNS: Column<HomepageUpdate>[] = [
  { key: 'image', label: 'Image', render: (r) => <Thumbnail src={r.image} /> },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'publishedAt', label: 'Published', sortable: true, render: (r) => <DateCell value={r.publishedAt} /> },
  { key: 'order', label: 'Order', sortable: true },
  { key: 'status', label: 'Status', render: (r) => <StatusCell status={r.status} /> },
]

export default function AdminHomepageUpdates() {
  return (
    <ContentManager<HomepageUpdate>
      resource="homepage-updates"
      title="Latest Updates"
      description="New schools and partners, announcements and news for the homepage’s Latest Updates tab."
      itemName="Update"
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['title', 'description']}
      newDefaults={{ publishedAt: todayInput(), order: 0 }}
      statusActionsFor={publishActions}
    />
  )
}
