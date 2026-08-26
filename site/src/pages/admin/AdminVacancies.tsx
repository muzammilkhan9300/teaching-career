import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminVacancies, useVacancyMutations } from '@/admin/adminQueries'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { EditIcon, PlusIcon, SpinnerIcon, TrashIcon } from '@/components/icons/admin'
import type { Vacancy } from '@/types'

const FIELDS: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'school', label: 'School Name', type: 'text', required: true },
  { name: 'schoolId', label: 'School ID', type: 'text', required: true, placeholder: 'Mongo _id of the school' },
  { name: 'subject', label: 'Subject', type: 'text', required: true },
  { name: 'qualification', label: 'Qualification', type: 'text', required: true },
  { name: 'experience', label: 'Experience', type: 'text', required: true },
  { name: 'curriculum', label: 'Curriculum', type: 'text', required: true },
  { name: 'employmentType', label: 'Employment Type', type: 'select', options: ['Full Time', 'Part Time'], required: true },
  { name: 'salaryRange', label: 'Salary Range', type: 'text', required: true },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'area', label: 'Area', type: 'text', required: true },
  { name: 'joiningDate', label: 'Joining Date', type: 'text', required: true },
  { name: 'teachersNeeded', label: 'Teachers Needed', type: 'number', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'active', label: 'Active', type: 'checkbox' },
]

export default function AdminVacancies() {
  const { data: vacancies, isPending } = useAdminVacancies()
  const { create, update, remove } = useVacancyMutations()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Vacancy | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const columns: Column<Vacancy>[] = [
    { key: 'title', label: 'Title' },
    { key: 'school', label: 'School' },
    { key: 'city', label: 'City' },
    { key: 'employmentType', label: 'Type' },
    { key: 'active', label: 'Status', render: (v) => (v.active ? 'Active' : 'Closed') },
  ]

  function handleSubmit(values: Record<string, unknown>) {
    setFormError(null)
    const mutation = editing === 'new' ? create : update
    const payload = editing === 'new' ? values : { id: (editing as Vacancy).id, data: values }

    mutation.mutate(payload as never, {
      onSuccess: () => {
        showToast({ variant: 'success', title: editing === 'new' ? 'Vacancy created' : 'Vacancy updated' })
        setEditing(null)
      },
      onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
    })
  }

  function handleDelete(vacancy: Vacancy) {
    if (!window.confirm(`Delete "${vacancy.title}"? This cannot be undone.`)) return
    remove.mutate(vacancy.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Vacancy deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Vacancies — Admin — TeachingCareer</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Vacancies</h1>
          <p className="text-sm text-body">Manage the vacancies shown on the public site.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
        >
          <PlusIcon size={16} />
          Add Vacancy
        </button>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading vacancies…
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={vacancies ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No vacancies yet. Add one to get started."
          actions={(row) => (
            <div className="flex justify-end gap-2">
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
          initialValues={(editing === 'new' ? { active: true, teachersNeeded: 1 } : editing) as Record<string, unknown>}
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
