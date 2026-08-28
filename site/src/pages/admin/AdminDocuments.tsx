import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminPendingDocuments, useCandidateVerification, adminDocumentUrl, type SubmissionRecord } from '@/admin/adminQueries'
import { RejectReasonModal } from '@/admin/components/RejectReasonModal'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { SpinnerIcon } from '@/components/icons/admin'
import { DocUploadIcon, LockIcon } from '@/components/icons'

const DOC_FIELDS: { field: string; pathKey: string; label: string }[] = [
  { field: 'degreeDocument', pathKey: 'degreeDocumentPath', label: 'Degree / Qualification' },
  { field: 'experienceDocument', pathKey: 'experienceDocumentPath', label: 'Experience Letter' },
  { field: 'policeVerification', pathKey: 'policeVerificationPath', label: 'Police Verification' },
]

export default function AdminDocuments() {
  const { data: applications, isPending } = useAdminPendingDocuments()
  const { verify, reject } = useCandidateVerification()
  const { showToast } = useToast()
  const [rejecting, setRejecting] = useState<SubmissionRecord | null>(null)

  function handleVerify(app: SubmissionRecord) {
    if (!window.confirm(`Verify ${app.fullName as string}? This creates a public candidate listing and permanently deletes their uploaded documents.`)) return
    verify.mutate(app.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Candidate verified', description: 'Documents deleted; listing published.' }),
      onError: (err) => showToast({ variant: 'error', title: 'Verification failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleReject(reason: string) {
    if (!rejecting) return
    reject.mutate(
      { id: rejecting.id, reason },
      {
        onSuccess: () => {
          showToast({ variant: 'info', title: 'Application rejected', description: 'Documents deleted.' })
          setRejecting(null)
        },
        onError: (err) => showToast({ variant: 'error', title: 'Action failed', description: err instanceof ApiError ? err.message : undefined }),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Document Review — Admin — TeachingCareer</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">Document Review</h1>
        <p className="text-sm text-body">
          Candidate documents awaiting a decision. Every document is deleted permanently the moment it's verified or
          rejected — only the decision itself is kept.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-2xl bg-mint/50 p-4 text-sm text-body">
        <LockIcon size={16} className="mt-0.5 shrink-0 text-teal-deep" />
        These files are private and only reachable through this authenticated view — they are never served publicly.
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading pending documents…
        </div>
      ) : !applications || applications.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-body">
          Nothing pending — every submitted application has been reviewed.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app) => (
            <div key={app.id} className="rounded-2xl border border-line bg-white p-5 shadow-tc">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-navy">{String(app.fullName)}</p>
                  <p className="text-sm text-body">
                    {String(app.qualification)} · {String(app.city)}, {String(app.area)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRejecting(app)}
                    disabled={reject.isPending || verify.isPending}
                    className="rounded-full border-2 border-line px-4 py-2 text-xs font-bold text-navy transition hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify(app)}
                    disabled={reject.isPending || verify.isPending}
                    className="rounded-full bg-teal px-4 py-2 text-xs font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
                  >
                    Verify &amp; Publish
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {DOC_FIELDS.filter((d) => app[d.pathKey]).map((d) => (
                  <a
                    key={d.field}
                    href={adminDocumentUrl(app.id, d.field)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-navy transition hover:border-teal hover:bg-mint/40"
                  >
                    <DocUploadIcon size={14} />
                    {d.label}
                  </a>
                ))}
                {DOC_FIELDS.every((d) => !app[d.pathKey]) ? (
                  <span className="text-xs text-body">No documents on file (fresher, no supporting documents required).</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {rejecting ? (
        <RejectReasonModal
          title={`Reject ${String(rejecting.fullName)}`}
          description="This reason is shown to the candidate so they know what to fix before resubmitting. This also permanently deletes their uploaded documents."
          isSubmitting={reject.isPending}
          onSubmit={handleReject}
          onClose={() => setRejecting(null)}
        />
      ) : null}
    </div>
  )
}
