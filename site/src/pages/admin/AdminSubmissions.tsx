import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminSubmissions, useSubmissionMutations, useAssignTutor, useAdminCandidates, type SubmissionRecord } from '@/admin/adminQueries'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { StatusSelect } from '@/admin/components/StatusBadge'
import { AssignTutorModal } from '@/admin/components/AssignTutorModal'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { SpinnerIcon, TrashIcon, UserPlusIcon } from '@/components/icons/admin'

export type SubmissionResource =
  | 'candidate-applications'
  | 'school-registrations'
  | 'home-tutor-requests'
  | 'contact-messages'
  | 'vacancy-applications'

interface ResourceConfig {
  title: string
  statusField: string
  columns: Column<SubmissionRecord>[]
}

function textColumn(key: string, label: string): Column<SubmissionRecord> {
  return { key, label, render: (row) => String(row[key] ?? '—') }
}

function dateColumn(): Column<SubmissionRecord> {
  return {
    key: 'createdAt',
    label: 'Submitted',
    render: (row) => new Date(String(row.createdAt)).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
  }
}

const RESOURCE_CONFIG: Record<SubmissionResource, ResourceConfig> = {
  'candidate-applications': {
    title: 'Candidate Applications',
    statusField: 'applicationStatus',
    columns: [textColumn('fullName', 'Name'), textColumn('email', 'Email'), textColumn('city', 'City'), textColumn('qualification', 'Qualification'), dateColumn()],
  },
  'school-registrations': {
    title: 'School Registrations',
    statusField: 'registrationStatus',
    columns: [textColumn('schoolName', 'School'), textColumn('schoolCity', 'City'), textColumn('schoolWhatsapp', 'WhatsApp'), dateColumn()],
  },
  'home-tutor-requests': {
    title: 'Home Tutor Requests',
    statusField: 'requestStatus',
    columns: [
      textColumn('parentName', 'Parent'),
      textColumn('studentName', 'Student'),
      textColumn('subjectsNeeded', 'Subjects'),
      textColumn('parentCity', 'City'),
      { key: 'assignedCandidateName', label: 'Assigned Tutor', render: (row) => (row.assignedCandidateName ? String(row.assignedCandidateName) : '—') },
      dateColumn(),
    ],
  },
  'contact-messages': {
    title: 'Contact Messages',
    statusField: 'status',
    columns: [textColumn('name', 'Name'), textColumn('email', 'Email'), { key: 'message', label: 'Message', render: (r) => <span className="line-clamp-2 max-w-xs">{String(r.message)}</span> }, dateColumn()],
  },
  'vacancy-applications': {
    title: 'Vacancy Applications',
    statusField: 'applicationStatus',
    columns: [
      textColumn('vacancyTitle', 'Vacancy'),
      textColumn('applicantName', 'Applicant'),
      textColumn('applicantEmail', 'Email'),
      textColumn('applicantPhone', 'Phone'),
      dateColumn(),
    ],
  },
}

export default function AdminSubmissions({ resource }: { resource: SubmissionResource }) {
  const config = RESOURCE_CONFIG[resource]
  const { data, isPending } = useAdminSubmissions(resource)
  const { updateStatus, remove } = useSubmissionMutations(resource)
  const assignTutor = useAssignTutor()
  const isHomeTutor = resource === 'home-tutor-requests'
  const { data: candidates } = useAdminCandidates()
  const { showToast } = useToast()
  const [assigningRow, setAssigningRow] = useState<SubmissionRecord | null>(null)

  function handleDelete(row: SubmissionRecord) {
    if (!window.confirm('Delete this submission? This cannot be undone.')) return
    remove.mutate(row.id, {
      onSuccess: () => showToast({ variant: 'success', title: 'Submission deleted' }),
      onError: (err) => showToast({ variant: 'error', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  function handleAssign(candidateId: string | null) {
    if (!assigningRow) return
    assignTutor.mutate(
      { id: assigningRow.id, candidateId },
      {
        onSuccess: () => {
          showToast({ variant: 'success', title: candidateId ? 'Tutor assigned' : 'Assignment removed' })
          setAssigningRow(null)
        },
        onError: (err) => showToast({ variant: 'error', title: 'Assignment failed', description: err instanceof ApiError ? err.message : undefined }),
      },
    )
  }

  const columns: Column<SubmissionRecord>[] = [
    ...config.columns,
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusSelect
          value={String(row[config.statusField] ?? 'New')}
          disabled={updateStatus.isPending}
          onChange={(status) => updateStatus.mutate({ id: row.id, status })}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>{config.title} — Admin — TeachingCareer</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">{config.title}</h1>
        <p className="text-sm text-body">Review submissions and update their status.</p>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading submissions…
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No submissions yet."
          actions={(row) => (
            <>
              {isHomeTutor ? (
                <button
                  type="button"
                  onClick={() => setAssigningRow(row)}
                  className="rounded-lg p-1.5 text-body hover:bg-mint hover:text-teal-deep"
                  aria-label="Assign tutor"
                >
                  <UserPlusIcon size={16} />
                </button>
              ) : null}
              <button type="button" onClick={() => handleDelete(row)} className="rounded-lg p-1.5 text-body hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                <TrashIcon size={16} />
              </button>
            </>
          )}
        />
      )}

      {assigningRow ? (
        <AssignTutorModal
          request={assigningRow}
          candidates={candidates ?? []}
          isSubmitting={assignTutor.isPending}
          onAssign={handleAssign}
          onClose={() => setAssigningRow(null)}
        />
      ) : null}
    </div>
  )
}
