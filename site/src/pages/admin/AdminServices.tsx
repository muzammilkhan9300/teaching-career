import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminServices, useServiceMutations } from '@/admin/adminQueries'
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
import type { Service } from '@/types'
import { SERVICE_ICON_OPTIONS } from '@/admin/serviceIcons'

const FIELDS: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'icon', label: 'Icon', type: 'select', options: SERVICE_ICON_OPTIONS, required: true },
  { name: 'order', label: 'Display Order', type: 'number' },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
]

export default function AdminServices() {
  const { data: services, isPending } = useAdminServices()
  const { create, update, remove, runStatusAction } = useServiceMutations()
  const { can } = useUserAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Service | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const controls = useTableControls(services ?? [], { searchKeys: ['title', 'description'], defaultSortKey: 'order' as never })

  const columns: Column<Service>[] = [
    { key: 'order', label: 'Order', sortable: true, className: 'w-16' },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'icon', label: 'Icon' },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  ]

  function handleSubmit(values: Record<string, unknown>) {
    setFormError(null)
    const mutation = editing === 'new' ? create : update
    const payload = editing === 'new' ? values : { id: (editing as Service).id, data: values }

    mutation.mutate(payload as never, {
      onSuccess: () => {
        showToast({ variant: 'success', title: editing === 'new' ? 'Service created' : 'Service updated' })
        setEditing(null)
      },
      onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
    })
  }

  function handleDelete(service: Service) {
    if (!window.confirm(`Permanently delete "${service.title}"? This cannot be undone.`)) return
    remove.mutate(service.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Service deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleStatusAction(service: Service, action: string, label: string) {
    runStatusAction.mutate(
      { id: service.id, action },
      {
        onSuccess: () => showToast({ variant: 'success', title: `Service ${label}` }),
        onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Services — Admin — TeachingCareer</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Services</h1>
          <p className="text-sm text-body">Manage the cards shown on the public Services page.</p>
        </div>
        {can('manageContent') ? (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
          >
            <PlusIcon size={16} />
            Add Service
          </button>
        ) : null}
      </div>

      <ListToolbar search={controls.search} onSearchChange={controls.setSearch} placeholder="Search services…" resultCount={controls.totalCount} />

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading services…
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={controls.rows}
            rowKey={(row) => row.id}
            emptyMessage="No services match."
            sortKey={controls.sortKey as string}
            sortDir={controls.sortDir}
            onSort={(key) => controls.toggleSort(key as keyof Service)}
            actions={(row) => (
              <div className="flex flex-wrap justify-end gap-1.5">
                {can('manageContent') ? (
                  <>
                    {row.status !== 'Published' ? (
                      <button type="button" onClick={() => handleStatusAction(row, 'publish', 'published')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                        Publish
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleStatusAction(row, 'unpublish', 'moved to draft')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                        Unpublish
                      </button>
                    )}
                    {row.status !== 'Archived' ? (
                      <button type="button" onClick={() => handleStatusAction(row, 'archive', 'archived')} className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep">
                        Archive
                      </button>
                    ) : null}
                  </>
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
          title={editing === 'new' ? 'Add Service' : 'Edit Service'}
          fields={FIELDS}
          initialValues={(editing === 'new' ? { order: (services?.length ?? 0) + 1 } : editing) as Record<string, unknown>}
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
