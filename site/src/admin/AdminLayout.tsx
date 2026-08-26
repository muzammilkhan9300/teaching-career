import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { useAdminAuth } from './AdminAuthContext'
import {
  DashboardIcon,
  VacancyIcon,
  BuildingIcon,
  UsersIcon,
  InboxIcon,
  LogOutIcon,
} from '@/components/icons/admin'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'

interface NavItem {
  label: string
  to: string
  icon: ComponentType<LucideProps>
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: DashboardIcon, end: true },
  { label: 'Vacancies', to: '/admin/vacancies', icon: VacancyIcon },
  { label: 'Schools', to: '/admin/schools', icon: BuildingIcon },
  { label: 'Candidates', to: '/admin/candidates', icon: UsersIcon },
]

const INBOX_ITEMS: NavItem[] = [
  { label: 'Candidate Applications', to: '/admin/candidate-applications', icon: InboxIcon },
  { label: 'School Registrations', to: '/admin/school-registrations', icon: InboxIcon },
  { label: 'Home Tutor Requests', to: '/admin/home-tutor-requests', icon: InboxIcon },
  { label: 'Contact Messages', to: '/admin/contact-messages', icon: InboxIcon },
  { label: 'Vacancy Applications', to: '/admin/vacancy-applications', icon: InboxIcon },
]

function NavLinkItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition',
          isActive ? 'bg-teal text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
        )
      }
    >
      <item.icon size={17} />
      {item.label}
    </NavLink>
  )
}

export function AdminLayout() {
  const { admin, logout } = useAdminAuth()

  return (
    <div className="flex min-h-screen bg-mint/30">
      <aside className="flex w-72 shrink-0 flex-col gap-6 bg-navy p-5">
        <div className="px-1.5 pt-1">
          <p className="text-lg font-extrabold text-white">TeachingCareer</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Admin Panel</p>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLinkItem key={item.to} item={item} />
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <p className="px-3.5 text-xs font-bold uppercase tracking-wide text-white/40">Submissions</p>
            {INBOX_ITEMS.map((item) => (
              <NavLinkItem key={item.to} item={item} />
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
          <p className="truncate px-1.5 text-xs text-white/60">{admin?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOutIcon size={17} />
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
