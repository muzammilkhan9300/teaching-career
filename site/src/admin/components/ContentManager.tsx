import { useState, type ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import { useUserAuth } from '@/auth/UserAuthContext'
import { useAdminHomepageList, useHomepageContentMutations, type HomepageResource } from '@/admin/adminQueries'
import { useTableControls } from '@/admin/useTableControls'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ListToolbar } from '@/admin/components/ListToolbar'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { EditIcon, PlusIcon, SpinnerIcon, TrashIcon } from '@/components/icons/admin'

export interface StatusAction {
  action: string
  label: string
  /** Past tense for the toast, e.g. "published". */
  done: string
}

interface ContentManagerProps<T extends { id: string }> {
  resource: HomepageResource
  title: string
  description: string
  /** Singular noun for buttons/toasts, e.g. "Requirement". */
  itemName: string
  fields: FieldConfig[]
  columns: Column<T>[]
  searchKeys: (keyof T)[]
  newDefaults: Record<string, unknown>
  /** Row actions available for this record's current state (publish/unpublish, activate/...). */
  statusActionsFor: (row: T) => StatusAction[]
  /** Optional note shown above the table. */
  notice?: ReactNode
}

/** Turns a server validation error into the first field message, e.g. "Expiry date must be after…". */
function errorMessage(err: unknown) {
  if (!(err instanceof ApiError)) return 'Something went wrong.'
  const details = err.details as { fieldErrors?: Record<string, string[] | undefined> } | undefined
  const firstFieldError = details?.fieldErrors && Object.values(details.fieldErrors).find((msgs) => msgs?.length)?.[0]
  return firstFieldError ?? err.message
}

/**
 * Generic list + add/edit/delete + status-action page used by every
 * Homepage Management section. Writes are capability-gated in the UI here
 * and enforced server-side by createAdminCrudRouter (manageContent/hardDelete).
 */
export function ContentManager<T extends { id: string; createdAt: string }>({
  resource,
  title,
  description,
  itemName,
  fields,
  columns,
  searchKeys,
  newDefaults,
  statusActionsFor,
  notice,
}: ContentManagerProps<T>) {
  const { data: rows, isPending, isError, refetch } = useAdminHomepageList<T>(resource)
  const { create, update, remove, runStatusAction } = useHomepageContentMutations<T>(resource)
  const { can } = useUserAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<T | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const canEdit = can('manageContent')

  const controls = useTableControls(rows ?? [], { searchKeys, defaultSortKey: 'order' as keyof T })

  function handleSubmit(values: Record<string, unknown>) {
    setFormError(null)
    const isNew = editing === 'new'
    const onSuccess = () => {
      showToast({ variant: 'success', title: isNew ? `${itemName} added` : `${itemName} updated` })
      setEditing(null)
    }
    const onError = (err: unknown) => setFormError(errorMessage(err))
    if (isNew) create.mutate(values, { onSuccess, onError })
    else update.mutate({ id: (editing as T).id, data: values }, { onSuccess, onError })
  }

  function handleDelete(row: T) {
    if (!window.confirm(`Permanently delete this ${itemName.toLowerCase()}? This cannot be undone.`)) return
    remove.mutate(row.id, {
      onSuccess: () => showToast({ variant: 'success', title: `${itemName} deleted` }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: errorMessage(err) }),
    })
  }

  function handleStatus(row: T, sa: StatusAction) {
    runStatusAction.mutate(
      { id: row.id, action: sa.action },
      {
        onSuccess: () => showToast({ variant: 'success', title: `${itemName} ${sa.done}` }),
        onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: errorMessage(err) }),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>{`${title} — Admin — TeachingCareer`}</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-teal-deep">Homepage Management</p>
          <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
          <p className="text-sm text-body">{description}</p>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
          >
            <PlusIcon size={16} />
            Add {itemName}
          </button>
        ) : null}
      </div>

      {notice ? <div className="rounded-2xl bg-mint/50 p-4 text-sm text-body">{notice}</div> : null}

      <ListToolbar search={controls.search} onSearchChange={controls.setSearch} placeholder="Search…" resultCount={controls.totalCount} />

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading…
        </div>
      ) : isError ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white py-12 text-center">
          <p className="text-sm text-body">This list could not be loaded.</p>
          <button type="button" onClick={() => void refetch()} className="rounded-full border-2 border-teal px-5 py-2 text-sm font-bold text-teal hover:bg-mint">
            Retry
          </button>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={controls.rows}
            rowKey={(row) => row.id}
            emptyMessage={`No ${itemName.toLowerCase()} entries yet.`}
            sortKey={controls.sortKey as string}
            sortDir={controls.sortDir}
            onSort={(key) => controls.toggleSort(key as keyof T)}
            actions={(row) => (
              <div className="flex flex-wrap justify-end gap-1.5">
                {canEdit
                  ? statusActionsFor(row).map((sa) => (
                      <button
                        key={sa.action}
                        type="button"
                        onClick={() => handleStatus(row, sa)}
                        disabled={runStatusAction.isPending}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep disabled:opacity-50"
                      >
                        {sa.label}
                      </button>
                    ))
                  : null}
                {canEdit ? (
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
          title={editing === 'new' ? `Add ${itemName}` : `Edit ${itemName}`}
          fields={fields}
          initialValues={(editing === 'new' ? newDefaults : editing) as Record<string, unknown>}
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
