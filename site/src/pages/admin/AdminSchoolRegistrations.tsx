import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSchoolRegistrations, useSchoolApproval } from '@/admin/adminQueries'
import { useTableControls } from '@/admin/useTableControls'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ListToolbar } from '@/admin/components/ListToolbar'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { RejectReasonModal } from '@/admin/components/RejectReasonModal'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { SpinnerIcon } from '@/components/icons/admin'
import type { SubmissionRecord } from '@/admin/adminQueries'

const REVIEWABLE = new Set(['Pending', 'Resubmitted'])

export default function AdminSchoolRegistrations() {
  const { data: registrations, isPending } = useSchoolRegistrations()
  const { approve, reject } = useSchoolApproval()
  const { showToast } = useToast()
  const [rejecting, setRejecting] = useState<SubmissionRecord | null>(null)

  const controls = useTableControls((registrations ?? []) as SubmissionRecord[], {
    searchKeys: ['schoolName', 'schoolCity', 'schoolWhatsapp'] as never,
    defaultSortKey: 'createdAt' as never,
  })

  function handleApprove(reg: SubmissionRecord) {
    const verb = reg.registrationStatus === 'Resubmitted' ? 'Approve the updated details for' : 'Approve'
    if (!window.confirm(`${verb} ${String(reg.schoolName)}? This publishes the listing.`)) return
    approve.mutate(reg.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'School approved', description: 'Listing published.' }),
      onError: (err) => showToast({ variant: 'error', title: 'Approval failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleReject(reason: string) {
    if (!rejecting) return
    reject.mutate(
      { id: rejecting.id, reason },
      {
        onSuccess: () => {
          showToast({ variant: 'info', title: 'Registration rejected' })
          setRejecting(null)
        },
        onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
      },
    )
  }

  const columns: Column<SubmissionRecord>[] = [
    { key: 'schoolName', label: 'School', sortable: true, render: (r) => String(r.schoolName) },
    { key: 'schoolCity', label: 'City', sortable: true, render: (r) => String(r.schoolCity) },
    { key: 'schoolWhatsapp', label: 'WhatsApp', render: (r) => String(r.schoolWhatsapp) },
    { key: 'schoolBoard', label: 'Board', render: (r) => String(r.schoolBoard ?? '—') },
    { key: 'registrationStatus', label: 'Status', render: (r) => <StatusBadge status={String(r.registrationStatus)} /> },
    {
      key: 'rejectionReason',
      label: 'Rejection Reason',
      render: (r) => (r.rejectionReason ? <span className="line-clamp-2 max-w-xs text-xs text-body">{String(r.rejectionReason)}</span> : '—'),
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      sortable: true,
      render: (r) => new Date(String(r.submittedAt ?? r.createdAt)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>School Registrations — Admin — TeachingCareer</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">School Registrations</h1>
        <p className="text-sm text-body">Review submissions and resubmissions, and approve or reject school registrations.</p>
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
            REVIEWABLE.has(String(row.registrationStatus)) ? (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejecting(row)}
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

      {rejecting ? (
        <RejectReasonModal
          title={`Reject ${String(rejecting.schoolName)}`}
          description="This reason is shown to the school owner so they know what to fix before resubmitting."
          isSubmitting={reject.isPending}
          onSubmit={handleReject}
          onClose={() => setRejecting(null)}
        />
      ) : null}
    </div>
  )
}
