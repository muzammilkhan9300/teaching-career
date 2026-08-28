import { useState } from 'react'
import { useMyVacancies, useMyVacancyMutations } from '@/lib/queries'
import { useTableControls } from '@/admin/useTableControls'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { EditIcon, PlusIcon, SpinnerIcon, TrashIcon } from '@/components/icons/admin'
import type { Vacancy } from '@/types'

const FIELDS: FieldConfig[] = [
  { name: 'title', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g. Senior Mathematics Teacher' },
  { name: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'e.g. Mathematics' },
  { name: 'qualification', label: 'Qualification', type: 'text', required: true, placeholder: "e.g. Master's / B.Ed" },
  { name: 'experience', label: 'Experience Required', type: 'text', required: true, placeholder: 'e.g. 2+ Years' },
  { name: 'curriculum', label: 'Curriculum', type: 'text', required: true, placeholder: 'e.g. Cambridge' },
  { name: 'employmentType', label: 'Employment Type', type: 'select', options: ['Full Time', 'Part Time'], required: true },
  { name: 'salaryRange', label: 'Salary Range', type: 'text', required: true, placeholder: 'e.g. PKR 40,000 - 60,000' },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'area', label: 'Area', type: 'text', required: true },
  { name: 'joiningDate', label: 'Joining Date', type: 'text', required: true, placeholder: 'e.g. Immediate' },
  { name: 'teachersNeeded', label: 'Teachers Needed', type: 'number', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'active', label: 'Accepting applications now', type: 'checkbox' },
]

/**
 * Self-service vacancy CRUD for the logged-in school owner. Ownership is
 * resolved entirely server-side from the session (see /api/vacancies/mine),
 * so this never takes a schoolId prop — render it only where the caller has
 * already confirmed the viewer owns an approved school.
 */
export function VacancyManager() {
  const { data: vacancies, isPending: isLoadingVacancies } = useMyVacancies()
  const { create, update, remove } = useMyVacancyMutations()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Vacancy | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const controls = useTableControls(vacancies ?? [], { searchKeys: ['title', 'city', 'subject'], defaultSortKey: 'createdAt' as never })

  function handleSubmit(values: Record<string, unknown>) {
    setFormError(null)
    const mutation = editing === 'new' ? create : update
    const payload = editing === 'new' ? values : { id: (editing as Vacancy).id, data: values }

    mutation.mutate(payload as never, {
      onSuccess: () => {
        showToast({ variant: 'success', title: editing === 'new' ? 'Vacancy posted' : 'Vacancy updated' })
        setEditing(null)
      },
      onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
    })
  }

  function handleDelete(vacancy: Vacancy) {
    if (!window.confirm(`Permanently delete "${vacancy.title}"? This cannot be undone.`)) return
    remove.mutate(vacancy.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Vacancy deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  const columns: Column<Vacancy>[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'city', label: 'City', sortable: true, render: (v) => `${v.city}, ${v.area}` },
    { key: 'employmentType', label: 'Type' },
    { key: 'teachersNeeded', label: 'Needed', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${v.active ? 'bg-mint text-teal-deep' : 'bg-amber-50 text-amber-700'}`}>
          {v.active ? 'Accepting Applications' : 'Closed'}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-body">
          {vacancies?.length ?? 0} {(vacancies?.length ?? 0) === 1 ? 'vacancy' : 'vacancies'} posted for your school.
        </p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
        >
          <PlusIcon size={16} />
          Add Vacancy
        </button>
      </div>

      {isLoadingVacancies ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading your vacancies…
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={controls.rows}
          rowKey={(row) => row.id}
          emptyMessage="You haven't posted any vacancies yet."
          sortKey={controls.sortKey as string}
          sortDir={controls.sortDir}
          onSort={(key) => controls.toggleSort(key as never)}
          actions={(row) => (
            <div className="flex justify-end gap-1.5">
              <button type="button" onClick={() => setEditing(row)} className="rounded-lg p-1.5 text-body hover:bg-mint hover:text-teal-deep" aria-label="Edit">
                <EditIcon size={16} />
              </button>
              <button type="button" onClick={() => handleDelete(row)} className="rounded-lg p-1.5 text-body hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                <TrashIcon size={16} />
              </button>
            </div>
          )}
        />
      )}

      {editing ? (
        <ResourceFormModal
          title={editing === 'new' ? 'Add Vacancy' : 'Edit Vacancy'}
          fields={FIELDS}
          initialValues={(editing === 'new' ? { teachersNeeded: 1, active: true } : editing) as Record<string, unknown>}
          isSubmitting={create.isPending || update.isPending}
          error={formError}
          onSubmit={handleSubmit}
          onClose={() => {
            setEditing(null)
            setFormError(null)
          }}
        />
      ) : null}
    </div>
  )
}
