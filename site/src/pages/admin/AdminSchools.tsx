import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminSchools, useSchoolMutations } from '@/admin/adminQueries'
import { useAdminAuth } from '@/admin/AdminAuthContext'
import { useTableControls } from '@/admin/useTableControls'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ListToolbar } from '@/admin/components/ListToolbar'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { Pagination } from '@/components/ui/Pagination'
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
  const { create, update, remove, runStatusAction } = useSchoolMutations()
  const { can } = useAdminAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<School | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const controls = useTableControls(schools ?? [], { searchKeys: ['name', 'city', 'curriculum'], defaultSortKey: 'createdAt' as never })

  const columns: Column<School>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s.status} /> },
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
    if (!window.confirm(`Permanently delete "${school.name}"? This cannot be undone.`)) return
    remove.mutate(school.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'School deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleStatusAction(school: School, action: string, label: string) {
    runStatusAction.mutate(
      { id: school.id, action },
      {
        onSuccess: () => showToast({ variant: 'success', title: `School ${label}` }),
        onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Schools — Admin — TeachingCareer</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Schools</h1>
          <p className="text-sm text-body">Manage the school profiles shown on the public site.</p>
        </div>
        {can('manageContent') ? (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
          >
            <PlusIcon size={16} />
            Add School
          </button>
        ) : null}
      </div>

      <ListToolbar search={controls.search} onSearchChange={controls.setSearch} placeholder="Search by name, city, or curriculum…" resultCount={controls.totalCount} />

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading schools…
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={controls.rows}
            rowKey={(row) => row.id}
            emptyMessage="No schools match."
            sortKey={controls.sortKey as string}
            sortDir={controls.sortDir}
            onSort={(key) => controls.toggleSort(key as keyof School)}
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
