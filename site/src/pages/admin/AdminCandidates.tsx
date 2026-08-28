import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminCandidates, useCandidateMutations } from '@/admin/adminQueries'
import { useUserAuth } from '@/auth/UserAuthContext'
import { useTableControls } from '@/admin/useTableControls'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ListToolbar } from '@/admin/components/ListToolbar'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { Pagination } from '@/components/ui/Pagination'
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
  const { create, update, remove, runStatusAction } = useCandidateMutations()
  const { can } = useUserAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Candidate | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const controls = useTableControls(candidates ?? [], { searchKeys: ['name', 'role', 'city'], defaultSortKey: 'createdAt' as never })

  const columns: Column<Candidate>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'verified', label: 'Verified', render: (c) => (c.verified ? 'Yes' : 'No') },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
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
    if (!window.confirm(`Permanently delete "${candidate.name}"? This cannot be undone.`)) return
    remove.mutate(candidate.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Candidate deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleStatusAction(candidate: Candidate, action: string, label: string) {
    runStatusAction.mutate(
      { id: candidate.id, action },
      {
        onSuccess: () => showToast({ variant: 'success', title: `Candidate ${label}` }),
        onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Candidates — Admin — TeachingCareer</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Candidates</h1>
          <p className="text-sm text-body">Manage the candidate profiles shown on the public site.</p>
        </div>
        {can('manageContent') ? (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
          >
            <PlusIcon size={16} />
            Add Candidate
          </button>
        ) : null}
      </div>

      <ListToolbar search={controls.search} onSearchChange={controls.setSearch} placeholder="Search by name, role, or city…" resultCount={controls.totalCount} />

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading candidates…
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={controls.rows}
            rowKey={(row) => row.id}
            emptyMessage="No candidates match."
            sortKey={controls.sortKey as string}
            sortDir={controls.sortDir}
            onSort={(key) => controls.toggleSort(key as keyof Candidate)}
            actions={(row) => (
              <div className="flex flex-wrap justify-end gap-1.5">
                {can('manageContent') ? (
                  row.status === 'Active' ? (
                    <button type="button" onClick={() => handleStatusAction(row, 'suspend', 'suspended')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                      Suspend
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleStatusAction(row, 'restore', 'restored')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                      Restore
                    </button>
                  )
                ) : null}
                {can('manageContent') ? (
                  <button type="button" onClick={() => setEditing(row)} className="rounded-lg p-1.5 text-body hover:bg-mint hover:text-teal-deep" aria-label="Edit">
                    <EditIcon size={16} />
                  </button>
                ) : null}
                {can('hardDelete') ? (
                  <button type="button" onClick={() => handleDelete(row)} className="rounded-lg p-1.5 text-body hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                    <TrashIcon size={16} />
                  </button>
                ) : null}
              </div>
            )}
          />
          <Pagination page={controls.page} totalPages={controls.totalPages} onChange={controls.setPage} />
        </>
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
