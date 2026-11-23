import { Link } from 'react-router-dom'
import { CapIcon, CheckCircleIcon, ClockIcon, PersonIcon, PinIcon } from '@/components/icons'
import { EditIcon } from '@/components/icons/admin'
import type { Candidate } from '@/types'
import { CandidatePhoto } from '@/components/ui/CandidatePhoto'
import { useUserAuth } from '@/auth/UserAuthContext'
import { useMyCandidateApplication } from '@/lib/queries'

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  // Same rules as the profile page's Edit button: the owner edits their own
  // profile, content admins can edit any; everyone else just views it. The
  // server re-checks permissions on every edit request.
  const { isAuthenticated, can } = useUserAuth()
  const { data: myApplication } = useMyCandidateApplication()
  const isOwner = myApplication?.publishedCandidateId === candidate.id
  const editTo = isOwner
    ? '/profile/candidate/edit'
    : isAuthenticated && can('manageContent')
      ? `/candidate-profiles/${candidate.id}/edit`
      : null

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-tc transition hover:-translate-y-1 hover:shadow-tc-lg">
      {/* Fixed-height band on the brand green; the 3:4 passport photo is shown whole
          (object-fit: contain), centred, with thin green sides on wide cards. */}
      <div className="h-[220px] w-full overflow-hidden bg-[#064E43]">
        <CandidatePhoto src={candidate.photo} alt={`${candidate.name} — profile photo`} iconSize={48} lazy fit="contain" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="min-w-0 break-words text-lg font-bold text-navy">{candidate.name}</h3>
            {candidate.verified ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-teal-deep shadow-tc">
                <CheckCircleIcon size={13} />
                Verified
              </span>
            ) : null}
          </div>
          <p className="text-sm font-semibold text-teal-deep">{candidate.role}</p>
        </div>
        <div className="flex flex-col gap-1.5 text-sm text-body">
          <span className="flex items-center gap-2">
            <PinIcon size={13} />
            {candidate.city}, {candidate.area}
          </span>
          <span className="flex items-center gap-2">
            <CapIcon size={13} />
            {candidate.qualification}
          </span>
          <span className="flex items-center gap-2">
            <ClockIcon size={13} />
            {candidate.experience}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {candidate.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-teal-deep">
              {tag}
            </span>
          ))}
        </div>
        <Link
          to={editTo ?? `/candidate-profiles/${candidate.id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-teal px-5 py-2.5 text-sm font-bold text-teal transition hover:bg-mint"
        >
          {editTo ? <EditIcon size={15} /> : <PersonIcon size={15} />}
          {editTo ? 'Edit Profile' : 'View Profile'}
        </Link>
      </div>
    </div>
  )
}
