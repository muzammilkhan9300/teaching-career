import { Helmet } from 'react-helmet-async'
import { useCandidateApplications, useCandidateVerification, adminDocumentUrl } from '@/admin/adminQueries'
import { useTableControls } from '@/admin/useTableControls'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { ListToolbar } from '@/admin/components/ListToolbar'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { SpinnerIcon } from '@/components/icons/admin'
import { DocUploadIcon } from '@/components/icons'
import type { SubmissionRecord } from '@/admin/adminQueries'

export default function AdminCandidateApplications() {
  const { data: applications, isPending } = useCandidateApplications()
  const { verify, reject } = useCandidateVerification()
  const { showToast } = useToast()

  const controls = useTableControls((applications ?? []) as SubmissionRecord[], {
    searchKeys: ['fullName', 'email', 'city', 'qualification'] as never,
    defaultSortKey: 'createdAt' as never,
  })

  function handleVerify(app: SubmissionRecord) {
    if (!window.confirm(`Verify ${String(app.fullName)}? This creates a public candidate listing and permanently deletes their uploaded documents.`)) return
    verify.mutate(app.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Candidate verified', description: 'Documents deleted; listing published.' }),
      onError: (err) => showToast({ variant: 'error', title: 'Verification failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleReject(app: SubmissionRecord) {
    if (!window.confirm(`Reject ${String(app.fullName)}? This permanently deletes their uploaded documents.`)) return
    reject.mutate(app.id, {
      onSuccess: () => showToast({ variant: 'info', title: 'Application rejected', description: 'Documents deleted.' }),
      onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  const columns: Column<SubmissionRecord>[] = [
    { key: 'fullName', label: 'Name', sortable: true, render: (r) => String(r.fullName) },
    { key: 'email', label: 'Email', render: (r) => String(r.email) },
    { key: 'city', label: 'City', sortable: true, render: (r) => String(r.city) },
    { key: 'qualification', label: 'Qualification', render: (r) => String(r.qualification) },
    {
      key: 'documents',
      label: 'Documents',
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {[
            ['degreeDocument', 'degreeDocumentPath', 'Degree'],
            ['experienceDocument', 'experienceDocumentPath', 'Experience'],
            ['policeVerification', 'policeVerificationPath', 'Police'],
          ]
            .filter(([, pathKey]) => r[pathKey])
            .map(([field, , label]) => (
              <a
                key={field}
                href={adminDocumentUrl(r.id, field)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs font-semibold text-navy hover:border-teal hover:bg-mint/40"
              >
                <DocUploadIcon size={12} />
                {label}
              </a>
            ))}
        </div>
      ),
    },
    { key: 'applicationStatus', label: 'Status', render: (r) => <StatusBadge status={String(r.applicationStatus)} /> },
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
        <title>Candidate Applications — Admin — TeachingCareer</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">Candidate Applications</h1>
        <p className="text-sm text-body">Review submissions, view documents, and verify or reject candidates.</p>
      </div>

      <ListToolbar search={controls.search} onSearchChange={controls.setSearch} placeholder="Search by name, email, city, or qualification…" resultCount={controls.totalCount} />

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading applications…
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={controls.rows}
          rowKey={(row) => row.id}
          emptyMessage="No applications match."
          sortKey={controls.sortKey as string}
          sortDir={controls.sortDir}
          onSort={(key) => controls.toggleSort(key as never)}
          actions={(row) =>
            row.applicationStatus === 'New' || row.applicationStatus === 'Reviewed' ? (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleReject(row)}
                  disabled={reject.isPending || verify.isPending}
                  className="rounded-full border-2 border-line px-3 py-1.5 text-xs font-bold text-navy transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify(row)}
                  disabled={reject.isPending || verify.isPending}
                  className="rounded-full bg-teal px-3 py-1.5 text-xs font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
                >
                  Verify
                </button>
              </div>
            ) : null
          }
        />
      )}
    </div>
  )
}
