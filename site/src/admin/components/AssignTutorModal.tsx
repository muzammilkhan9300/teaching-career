import { useMemo, useState } from 'react'
import { CloseIcon } from '@/components/icons'
import { SpinnerIcon } from '@/components/icons/admin'
import type { Candidate } from '@/types'
import type { SubmissionRecord } from '../adminQueries'

interface AssignTutorModalProps {
  request: SubmissionRecord
  candidates: Candidate[]
  isSubmitting?: boolean
  onAssign: (candidateId: string | null) => void
  onClose: () => void
}

export function AssignTutorModal({ request, candidates, isSubmitting, onAssign, onClose }: AssignTutorModalProps) {
  const [search, setSearch] = useState('')
  const parentCity = String(request.parentCity ?? '')

  const sorted = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? candidates.filter((c) => c.name.toLowerCase().includes(query) || c.role.toLowerCase().includes(query))
      : candidates
    return [...filtered].sort((a, b) => {
      const aMatch = a.city === parentCity ? 0 : 1
      const bMatch = b.city === parentCity ? 0 : 1
      return aMatch - bMatch || a.name.localeCompare(b.name)
    })
  }, [candidates, search, parentCity])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-tc-lg sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-navy">Assign a Tutor</h2>
            <p className="text-sm text-body">
              For {String(request.studentName ?? 'the student')} in {parentCity || 'unspecified city'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-body hover:text-navy" aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search candidates by name or role…"
          className="mb-4 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
        />

        {request.assignedCandidateId ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onAssign(null)}
            className="mb-3 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
          >
            Remove current assignment ({String(request.assignedCandidateName)})
          </button>
        ) : null}

        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {sorted.length === 0 ? (
            <p className="py-6 text-center text-sm text-body">No candidates found.</p>
          ) : (
            sorted.map((candidate) => {
              const isAssigned = request.assignedCandidateId === candidate.id
              const isCityMatch = candidate.city === parentCity
              return (
                <button
                  key={candidate.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onAssign(candidate.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition disabled:opacity-60 ${
                    isAssigned ? 'border-teal bg-mint/40' : 'border-line hover:border-teal hover:bg-mint/20'
                  }`}
                >
                  <span>
                    <span className="block font-semibold text-navy">{candidate.name}</span>
                    <span className="text-xs text-body">
                      {candidate.role} &middot; {candidate.city}
                      {isCityMatch ? ' · City match' : ''}
                    </span>
                  </span>
                  {isSubmitting ? <SpinnerIcon size={16} className="animate-spin text-teal" /> : null}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
