import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useAdminStats } from '@/admin/adminQueries'
import { useUserAuth } from '@/auth/UserAuthContext'
import { VacancyIcon, BuildingIcon, UsersIcon, InboxIcon, SpinnerIcon } from '@/components/icons/admin'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'

interface StatCard {
  label: string
  value: (stats: NonNullable<ReturnType<typeof useAdminStats>['data']>) => number
  icon: ComponentType<LucideProps>
  to: string
  hint?: (stats: NonNullable<ReturnType<typeof useAdminStats>['data']>) => string
}

const CARDS: StatCard[] = [
  {
    label: 'Vacancies',
    value: (s) => s.vacancies,
    hint: (s) => `${s.activeVacancies} active`,
    icon: VacancyIcon,
    to: '/admin/vacancies',
  },
  { label: 'Schools', value: (s) => s.schools, icon: BuildingIcon, to: '/admin/schools' },
  { label: 'Candidates', value: (s) => s.candidates, icon: UsersIcon, to: '/admin/candidates' },
  {
    label: 'Candidate Applications',
    value: (s) => s.candidateApplications,
    hint: (s) => (s.pendingVerifications > 0 ? `${s.pendingVerifications} awaiting review` : 'All reviewed'),
    icon: InboxIcon,
    to: '/admin/candidate-applications',
  },
  {
    label: 'School Registrations',
    value: (s) => s.schoolRegistrations,
    hint: (s) => (s.pendingApprovals > 0 ? `${s.pendingApprovals} awaiting review` : 'All reviewed'),
    icon: InboxIcon,
    to: '/admin/school-registrations',
  },
  { label: 'Home Tutor Requests', value: (s) => s.homeTutorRequests, icon: InboxIcon, to: '/admin/home-tutor-requests' },
  { label: 'Contact Messages', value: (s) => s.contactMessages, icon: InboxIcon, to: '/admin/contact-messages' },
  { label: 'Vacancy Applications', value: (s) => s.vacancyApplications, icon: InboxIcon, to: '/admin/vacancy-applications' },
]

export default function AdminDashboard() {
  const { user: admin } = useUserAuth()
  const { data: stats, isPending } = useAdminStats()

  return (
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Admin Dashboard — TeachingCareer</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">Welcome back{admin ? `, ${admin.name}` : ''}</h1>
        <p className="text-sm text-body">Here's what's happening across TeachingCareer right now.</p>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading stats…
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <Link
              key={card.label}
              to={card.to}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-tc transition hover:-translate-y-0.5 hover:shadow-tc-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-teal-deep">
                <card.icon size={19} />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-navy">{card.value(stats)}</p>
                <p className="text-sm font-semibold text-body">{card.label}</p>
                {card.hint ? <p className="mt-1 text-xs text-teal-deep">{card.hint(stats)}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
