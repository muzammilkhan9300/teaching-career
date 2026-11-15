import { ContentManager } from '@/admin/components/ContentManager'
import type { FieldConfig } from '@/admin/components/ResourceFormModal'
import type { Column } from '@/admin/components/DataTable'
import { MERIT_NOTICE } from '@/components/sections/HeroInfoCard'
import type { SchoolRequirement } from '@/types'
import { DateCell, StatusCell } from './shared'
import { publishActions, todayInput } from './helpers'

const FIELDS: FieldConfig[] = [
  { name: 'jobTitle', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g. Mathematics Teacher (O Level)' },
  { name: 'schoolName', label: 'School Name', type: 'text', required: true },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'order', label: 'Display Order', type: 'number', hint: 'Lower numbers show first; equal numbers show newest first.' },
  { name: 'publishedAt', label: 'Publication Date', type: 'date', required: true, hint: 'A future date schedules it.' },
  { name: 'expiresAt', label: 'Expiry Date', type: 'date', hint: 'Optional — hidden automatically after this day.' },
  { name: 'shortDescription', label: 'Short Description', type: 'textarea', required: true, hint: 'Shown on the homepage card (max 300 characters).' },
  { name: 'detailedDescription', label: 'Detailed Description', type: 'paragraphs', hint: 'Shown on the requirement’s details page. Separate paragraphs with a blank line.' },
]

const COLUMNS: Column<SchoolRequirement>[] = [
  { key: 'jobTitle', label: 'Job Title', sortable: true },
  { key: 'schoolName', label: 'School', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'publishedAt', label: 'Published', sortable: true, render: (r) => <DateCell value={r.publishedAt} /> },
  {
    key: 'expiresAt',
    label: 'Expires',
    render: (r) =>
      r.expiresAt && new Date(r.expiresAt) < new Date() ? <span className="text-xs font-bold text-red-600">Expired</span> : <DateCell value={r.expiresAt} />,
  },
  { key: 'order', label: 'Order', sortable: true },
  { key: 'status', label: 'Status', render: (r) => <StatusCell status={r.status} /> },
]

export default function AdminSchoolRequirements() {
  return (
    <ContentManager<SchoolRequirement>
      resource="school-requirements"
      title="School Requirements"
      description="Requirements schools have shared with TeachingCareer, shown in the homepage hero."
      itemName="Requirement"
      fields={FIELDS}
      columns={COLUMNS}
      searchKeys={['jobTitle', 'schoolName', 'city']}
      newDefaults={{ publishedAt: todayInput(), order: 0 }}
      statusActionsFor={publishActions}
      notice={
        <>
          <strong className="text-navy">No direct applications:</strong> {MERIT_NOTICE} Only published, current and unexpired
          requirements appear publicly.
        </>
      }
    />
  )
}
