import { Helmet } from 'react-helmet-async'
import { useSchoolRegistrations, useSchoolApproval } from '@/admin/adminQueries'
import { useTableControls } from '@/admin/useTableControls'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ListToolbar } from '@/admin/components/ListToolbar'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { SpinnerIcon } from '@/components/icons/admin'
import type { SubmissionRecord } from '@/admin/adminQueries'

export default function AdminSchoolRegistrations() {
  const { data: registrations, isPending } = useSchoolRegistrations()
  const { approve, reject } = useSchoolApproval()
  const { showToast } = useToast()

  const controls = useTableControls((registrations ?? []) as SubmissionRecord[], {
    searchKeys: ['schoolName', 'schoolCity', 'schoolWhatsapp'] as never,
    defaultSortKey: 'createdAt' as never,
  })

  function handleApprove(reg: SubmissionRecord) {
    if (!window.confirm(`Approve ${String(reg.schoolName)}? This creates a public school listing.`)) return
    approve.mutate(reg.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'School approved', description: 'Listing published.' }),
      onError: (err) => showToast({ variant: 'error', title: 'Approval failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleReject(reg: SubmissionRecord) {
    if (!window.confirm(`Reject ${String(reg.schoolName)}?`)) return
    reject.mutate(reg.id, {
      onSuccess: () => showToast({ variant: 'info', title: 'Registration rejected' }),
      onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  const columns: Column<SubmissionRecord>[] = [
    { key: 'schoolName', label: 'School', sortable: true, render: (r) => String(r.schoolName) },
    { key: 'schoolCity', label: 'City', sortable: true, render: (r) => String(r.schoolCity) },
    { key: 'schoolWhatsapp', label: 'WhatsApp', render: (r) => String(r.schoolWhatsapp) },
    { key: 'schoolBoard', label: 'Board', render: (r) => String(r.schoolBoard ?? '—') },
    { key: 'registrationStatus', label: 'Status', render: (r) => <StatusBadge status={String(r.registrationStatus)} /> },
    {
      key: 'createdAt',
      label: 'Submitted',
      sortable: true,
      render: (r) => new Date(String(r.createdAt)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>School Registrations — Admin — TeachingCareer</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">School Registrations</h1>
        <p className="text-sm text-body">Review submissions and approve or reject school registrations.</p>
      </div>

      <ListToolbar search={controls.search} onSearchChange={controls.setSearch} placeholder="Search by school name, city, or WhatsApp…" resultCount={controls.totalCount} />

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading registrations…
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={controls.rows}
          rowKey={(row) => row.id}
          emptyMessage="No registrations match."
          sortKey={controls.sortKey as string}
          sortDir={controls.sortDir}
          onSort={(key) => controls.toggleSort(key as never)}
          actions={(row) =>
            row.registrationStatus === 'New' || row.registrationStatus === 'Reviewed' ? (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleReject(row)}
                  disabled={approve.isPending || reject.isPending}
                  className="rounded-full border-2 border-line px-3 py-1.5 text-xs font-bold text-navy transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(row)}
                  disabled={approve.isPending || reject.isPending}
                  className="rounded-full bg-teal px-3 py-1.5 text-xs font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
                >
                  Approve
                </button>
              </div>
            ) : null
          }
        />
      )}
    </div>
  )
}
