import { Link } from 'react-router-dom'
import { BookIcon, CheckCircleIcon, PinIcon, ShieldIcon } from '@/components/icons'
import type { School } from '@/types'

export function SchoolCard({ school }: { school: School }) {
  return (
    <Link
      to={`/school-profiles/${school.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-tc transition hover:-translate-y-1 hover:shadow-tc-lg"
    >
      <div className="relative h-40 w-full bg-mint">
        <img src={school.photo} alt={school.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        {school.registered ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-teal-deep shadow-tc">
            <CheckCircleIcon size={13} />
            Registered
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-teal-deep">
          <ShieldIcon size={20} />
        </span>
        <h3 className="text-lg font-bold text-navy">{school.name}</h3>
        <span className="w-fit rounded-full bg-badge px-3 py-1 text-xs font-bold text-teal-deep">{school.tag}</span>
        <div className="flex flex-col gap-1.5 text-sm text-body">
          <span className="flex items-center gap-2">
            <PinIcon size={13} />
            {school.city}
          </span>
          <span className="flex items-start gap-2">
            <BookIcon size={13} className="mt-0.5 shrink-0" />
            <span>
              <strong className="text-navy">Subjects:</strong> {school.subjects}
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}
