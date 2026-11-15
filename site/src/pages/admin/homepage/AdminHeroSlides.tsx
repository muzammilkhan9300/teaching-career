import { ContentManager } from '@/admin/components/ContentManager'
import type { FieldConfig } from '@/admin/components/ResourceFormModal'
import type { Column } from '@/admin/components/DataTable'
import { StatusBadge } from '@/admin/components/StatusBadge'
import type { HeroSlide } from '@/types'
import { Thumbnail } from './shared'

const FIELDS: FieldConfig[] = [
  { name: 'image', label: 'Background Image', type: 'image', required: true },
  { name: 'alt', label: 'Image Description', type: 'text', placeholder: 'e.g. Teachers at a school annual function', hint: 'Describes the photo for accessibility.' },
  { name: 'order', label: 'Display Order', type: 'number', hint: 'Lower numbers show first.' },
  {
    name: 'position',
    label: 'Focus Point',
    type: 'text',
    placeholder: '50% 50%',
    hint: 'Which part of the photo stays in view: horizontal% vertical% (e.g. "20% 50%" keeps the left side).',
  },
  { name: 'active', label: 'Active (show in the slider)', type: 'checkbox' },
]

const COLUMNS: Column<HeroSlide>[] = [
  { key: 'image', label: 'Image', render: (r) => <Thumbnail src={r.image} /> },
  { key: 'alt', label: 'Description', render: (r) => r.alt || '—' },
  { key: 'position', label: 'Focus Point' },
  { key: 'order', label: 'Order', sortable: true },
  { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'Active' : 'Inactive'} /> },
]

export default function AdminHeroSlides() {
  return (
    <ContentManager<HeroSlide>
      resource="hero-slides"
      title="Hero Slider"
      description="Background images of the homepage hero, shown in display order."
      itemName="Slide"
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['alt', 'image']}
      newDefaults={{ order: 0, position: '50% 50%', active: true }}
      statusActionsFor={(row) =>
        row.active
          ? [{ action: 'deactivate', label: 'Deactivate', done: 'deactivated' }]
          : [{ action: 'activate', label: 'Activate', done: 'activated' }]
      }
      notice="Use wide landscape photos (at least 1600px wide). The left side sits behind the hero text, so choose images where the main subject is not hidden by it."
    />
  )
}
