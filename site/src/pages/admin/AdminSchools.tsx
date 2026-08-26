import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminSchools, useSchoolMutations } from '@/admin/adminQueries'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { EditIcon, PlusIcon, SpinnerIcon, TrashIcon } from '@/components/icons/admin'
import type { School } from '@/types'

const FIELDS: FieldConfig[] = [
  { name: 'name', label: 'School Name', type: 'text', required: true },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'area', label: 'Area', type: 'text', required: true },
  { name: 'curriculum', label: 'Curriculum', type: 'text', required: true },
  { name: 'tag', label: 'Tag', type: 'text', required: true, placeholder: 'e.g. O Level, IB, Federal' },
  { name: 'photo', label: 'Photo URL', type: 'text', required: true, placeholder: '/assets/images/School1.jpg' },
  { name: 'subjects', label: 'Subjects', type: 'text', required: true, placeholder: 'Mathematics, Physics, English' },
  { name: 'about', label: 'About', type: 'textarea', required: true },
  { name: 'registered', label: 'Registered', type: 'checkbox' },
]

export default function AdminSchools() {
  const { data: schools, isPending } = useAdminSchools()
  const { create, update, remove } = useSchoolMutations()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<School | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const columns: Column<School>[] = [
    { key: 'name', label: 'Name' },
    { key: 'city', label: 'City' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'registered', label: 'Registered', render: (s) => (s.registered ? 'Yes' : 'No') },
  ]

  function handleSubmit(values: Record<string, unknown>) {
    setFormError(null)
    const mutation = editing === 'new' ? create : update
    const payload = editing === 'new' ? values : { id: (editing as School).id, data: values }

    mutation.mutate(payload as never, {
      onSuccess: () => {
        showToast({ variant: 'success', title: editing === 'new' ? 'School created' : 'School updated' })
        setEditing(null)
      },
      onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
    })
  }

  function handleDelete(school: School) {
    if (!window.confirm(`Delete "${school.name}"? This cannot be undone.`)) return
    remove.mutate(school.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'School deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Schools — Admin — TeachingCareer</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Schools</h1>
          <p className="text-sm text-body">Manage the school profiles shown on the public site.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
        >
          <PlusIcon size={16} />
          Add School
        </button>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading schools…
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={schools ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No schools yet. Add one to get started."
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
          title={editing === 'new' ? 'Add School' : 'Edit School'}
          fields={FIELDS}
          initialValues={(editing === 'new' ? { registered: true } : editing) as Record<string, unknown>}
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
