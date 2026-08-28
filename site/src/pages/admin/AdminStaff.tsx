import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminStaff, useStaffMutations } from '@/admin/adminQueries'
import { useUserAuth } from '@/auth/UserAuthContext'
import type { SiteUser } from '@/auth/UserAuthContext'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { ResourceFormModal, type FieldConfig } from '@/admin/components/ResourceFormModal'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { EditIcon, PlusIcon, SpinnerIcon } from '@/components/icons/admin'
import { RequireCapability } from '@/admin/components/RequireCapability'

const ROLE_OPTIONS = ['super_admin', 'admin', 'moderator']

const CREATE_FIELDS: FieldConfig[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email Address', type: 'text', required: true },
  { name: 'password', label: 'Password', type: 'password', required: true, placeholder: 'At least 8 characters' },
  { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, required: true },
]

const EDIT_FIELDS: FieldConfig[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, required: true },
  { name: 'password', label: 'New Password (leave blank to keep current)', type: 'password', placeholder: 'At least 8 characters' },
  { name: 'active', label: 'Active', type: 'checkbox' },
]

export default function AdminStaff() {
  const { data: staff, isPending } = useAdminStaff()
  const { create, update } = useStaffMutations()
  const { user: currentAdmin } = useUserAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<SiteUser | 'new' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const columns: Column<SiteUser>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (a) => a.role.replace('_', ' ') },
    { key: 'active', label: 'Status', render: (a) => <StatusBadge status={a.active ? 'Active' : 'Suspended'} /> },
  ]

  function handleSubmit(values: Record<string, unknown>) {
    setFormError(null)
    if (editing === 'new') {
      create.mutate(values as { name: string; email: string; password: string; role: string }, {
        onSuccess: () => {
          showToast({ variant: 'success', title: 'Staff account created' })
          setEditing(null)
        },
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
      })
    } else {
      const data = { ...values }
      if (!data.password) delete data.password
      update.mutate(
        { id: (editing as SiteUser).id, data },
        {
          onSuccess: () => {
            showToast({ variant: 'success', title: 'Staff account updated' })
            setEditing(null)
          },
          onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
        },
      )
    }
  }

  function handleToggleActive(member: SiteUser) {
    update.mutate(
      { id: member.id, data: { active: !member.active } },
      {
        onSuccess: () => showToast({ variant: 'success', title: member.active ? 'Account suspended' : 'Account restored' }),
        onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
      },
    )
  }

  return (
    <RequireCapability capability="manageStaff">
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Staff — Admin — TeachingCareer</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Staff &amp; Permissions</h1>
          <p className="text-sm text-body">Manage admin accounts and their roles.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
        >
          <PlusIcon size={16} />
          Add Staff
        </button>
      </div>

      <div className="rounded-2xl bg-mint/50 p-4 text-sm text-body">
        <strong className="text-navy">Roles:</strong> Super Admin manages everything including staff, settings, and
        audit logs. Admin manages all content and submissions. Moderator can review and action submissions only.
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading staff…
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={staff ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No staff accounts yet."
          actions={(row) => (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleToggleActive(row)}
                disabled={row.id === currentAdmin?.id}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-body hover:bg-mint hover:text-teal-deep disabled:opacity-40"
                title={row.id === currentAdmin?.id ? "You can't suspend your own account" : undefined}
              >
                {row.active ? 'Suspend' : 'Restore'}
              </button>
              <button type="button" onClick={() => setEditing(row)} className="rounded-lg p-1.5 text-body hover:bg-mint hover:text-teal-deep" aria-label="Edit">
                <EditIcon size={16} />
              </button>
            </div>
          )}
        />
      )}

      {editing ? (
        <ResourceFormModal
          title={editing === 'new' ? 'Add Staff Account' : 'Edit Staff Account'}
          fields={editing === 'new' ? CREATE_FIELDS : EDIT_FIELDS}
          initialValues={(editing === 'new' ? { role: 'moderator' } : editing) as Record<string, unknown>}
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
    </RequireCapability>
  )
}
