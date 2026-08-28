import { useState } from 'react'
import { CloseIcon } from '@/components/icons'

export function RejectReasonModal({
  title,
  description,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  title: string
  description: string
  isSubmitting: boolean
  onSubmit: (reason: string) => void
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-tc-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-navy">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-body hover:text-navy">
            <CloseIcon size={20} />
          </button>
        </div>
        <p className="mb-3 text-sm text-body">{description}</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Explain what needs to change before resubmitting…"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-mint/40">
            Cancel
          </button>
          <button
            type="button"
            disabled={reason.trim().length < 3 || isSubmitting}
            onClick={() => onSubmit(reason.trim())}
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}
