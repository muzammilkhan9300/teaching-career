import { Link } from 'react-router-dom'
import { CapIcon, CheckCircleIcon, ClockIcon, PersonIcon, PinIcon } from '@/components/icons'
import type { Candidate } from '@/types'

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-tc transition hover:-translate-y-1 hover:shadow-tc-lg">
      <div className="relative h-48 w-full bg-mint">
        {candidate.photo ? (
          <img
            src={candidate.photo}
            alt={candidate.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-teal-deep" role="img" aria-label={`${candidate.name} — profile photo`}>
            <PersonIcon size={48} />
          </div>
        )}
        {candidate.verified ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-teal-deep shadow-tc">
            <CheckCircleIcon size={13} />
            Verified
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-bold text-navy">{candidate.name}</h3>
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
          to={`/candidate-profiles/${candidate.id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-teal px-5 py-2.5 text-sm font-bold text-teal transition hover:bg-mint"
        >
          <PersonIcon size={15} />
          View Profile
        </Link>
      </div>
    </div>
  )
}
