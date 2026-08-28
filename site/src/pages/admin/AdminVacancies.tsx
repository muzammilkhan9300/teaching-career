import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminVacancies, useVacancyMutations } from '@/admin/adminQueries'
import { useUserAuth } from '@/auth/UserAuthContext'
import { useTableControls } from '@/admin/useTableControls'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ListToolbar } from '@/admin/components/ListToolbar'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { Pagination } from '@/components/ui/Pagination'
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
  // Also toggleable via the Close/Reopen row actions — kept here too so
  // saving an unrelated field edit doesn't silently reset it (the server
  // schema defaults `active` to true when the field is absent from the body).
  { name: 'active', label: 'Active', type: 'checkbox' },
]

export default function AdminVacancies() {
  const { data: vacancies, isPending } = useAdminVacancies()
  const { create, update, remove, runStatusAction } = useVacancyMutations()
  const { can } = useUserAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Vacancy | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const visible = (vacancies ?? []).filter((v) => (showArchived ? true : !v.archived))
  const controls = useTableControls(visible, { searchKeys: ['title', 'school', 'city'], defaultSortKey: 'createdAt' as never })

  const columns: Column<Vacancy>[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'school', label: 'School', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'employmentType', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (v.archived ? 'Archived' : v.active ? 'Active' : 'Closed'),
    },
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
    if (!window.confirm(`Permanently delete "${vacancy.title}"? This cannot be undone.`)) return
    remove.mutate(vacancy.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Vacancy deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleStatusAction(vacancy: Vacancy, action: string, label: string) {
    runStatusAction.mutate(
      { id: vacancy.id, action },
      {
        onSuccess: () => showToast({ variant: 'success', title: `Vacancy ${label}` }),
        onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Vacancies — Admin — TeachingCareer</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Vacancies</h1>
          <p className="text-sm text-body">Manage the vacancies shown on the public site.</p>
        </div>
        {can('manageContent') ? (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
          >
            <PlusIcon size={16} />
            Add Vacancy
          </button>
        ) : null}
      </div>

      <ListToolbar search={controls.search} onSearchChange={controls.setSearch} placeholder="Search by title, school, or city…" resultCount={controls.totalCount}>
        <label className="flex shrink-0 items-center gap-2 text-sm font-semibold text-navy">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="h-4 w-4 accent-teal" />
          Show archived
        </label>
      </ListToolbar>

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading vacancies…
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={controls.rows}
            rowKey={(row) => row.id}
            emptyMessage="No vacancies match."
            sortKey={controls.sortKey as string}
            sortDir={controls.sortDir}
            onSort={(key) => controls.toggleSort(key as keyof Vacancy)}
            actions={(row) => (
              <div className="flex flex-wrap justify-end gap-1.5">
                {!row.archived && can('manageContent') ? (
                  row.active ? (
                    <button type="button" onClick={() => handleStatusAction(row, 'close', 'closed')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                      Close
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleStatusAction(row, 'publish', 'reopened')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                      Reopen
                    </button>
                  )
                ) : null}
                {can('manageContent') ? (
                  row.archived ? (
                    <button type="button" onClick={() => handleStatusAction(row, 'restore', 'restored')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                      Restore
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleStatusAction(row, 'archive', 'archived')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                      Archive
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
          title={editing === 'new' ? 'Add Vacancy' : 'Edit Vacancy'}
          fields={FIELDS}
          initialValues={(editing === 'new' ? { teachersNeeded: 1 } : editing) as Record<string, unknown>}
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
