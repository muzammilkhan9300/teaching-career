import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminCandidates, useCandidateMutations } from '@/admin/adminQueries'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { EditIcon, PlusIcon, SpinnerIcon, TrashIcon } from '@/components/icons/admin'
import type { Candidate } from '@/types'

const FIELDS: FieldConfig[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'role', label: 'Role', type: 'text', required: true, placeholder: 'e.g. Mathematics Teacher' },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'area', label: 'Area', type: 'text', required: true },
  { name: 'qualification', label: 'Qualification', type: 'text', required: true },
  { name: 'experience', label: 'Experience', type: 'text', required: true },
  { name: 'tags', label: 'Tags (comma separated)', type: 'tags', placeholder: 'School Teaching, O Level' },
  { name: 'photo', label: 'Photo URL', type: 'text', placeholder: '/assets/images/candidate-...jpg' },
  { name: 'verified', label: 'Verified', type: 'checkbox' },
]

export default function AdminCandidates() {
  const { data: candidates, isPending } = useAdminCandidates()
  const { create, update, remove } = useCandidateMutations()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Candidate | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const columns: Column<Candidate>[] = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'city', label: 'City' },
    { key: 'verified', label: 'Verified', render: (c) => (c.verified ? 'Yes' : 'No') },
  ]

  function handleSubmit(values: Record<string, unknown>) {
    setFormError(null)
    const mutation = editing === 'new' ? create : update
    const payload = editing === 'new' ? values : { id: (editing as Candidate).id, data: values }

    mutation.mutate(payload as never, {
      onSuccess: () => {
        showToast({ variant: 'success', title: editing === 'new' ? 'Candidate created' : 'Candidate updated' })
        setEditing(null)
      },
      onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
    })
  }

  function handleDelete(candidate: Candidate) {
    if (!window.confirm(`Delete "${candidate.name}"? This cannot be undone.`)) return
    remove.mutate(candidate.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Candidate deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Candidates — Admin — TeachingCareer</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Candidates</h1>
          <p className="text-sm text-body">Manage the candidate profiles shown on the public site.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
        >
          <PlusIcon size={16} />
          Add Candidate
        </button>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading candidates…
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={candidates ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No candidates yet. Add one to get started."
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
          title={editing === 'new' ? 'Add Candidate' : 'Edit Candidate'}
          fields={FIELDS}
          initialValues={(editing === 'new' ? { verified: true, tags: [] } : editing) as Record<string, unknown>}
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
