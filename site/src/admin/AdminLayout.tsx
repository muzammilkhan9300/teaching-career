import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useUserAuth } from '@/auth/UserAuthContext'
import { NotificationsBell } from './components/NotificationsBell'
import type { Capability } from './permissions'
import {
  DashboardIcon,
  VacancyIcon,
  BuildingIcon,
  UsersIcon,
  InboxIcon,
  LogOutIcon,
  ExternalLinkIcon,
} from '@/components/icons/admin'
import { MenuIcon, BookIcon, ShieldIcon } from '@/components/icons'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'

interface NavItem {
  label: string
  to: string
  icon: ComponentType<LucideProps>
  end?: boolean
  requires?: Capability
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: DashboardIcon, end: true },
  { label: 'Vacancies', to: '/admin/vacancies', icon: VacancyIcon },
  { label: 'Schools', to: '/admin/schools', icon: BuildingIcon },
  { label: 'Candidates', to: '/admin/candidates', icon: UsersIcon },
  { label: 'Blogs', to: '/admin/blogs', icon: BookIcon },
  { label: 'Services', to: '/admin/services', icon: ShieldIcon },
  { label: 'Documents', to: '/admin/documents', icon: InboxIcon, requires: 'reviewSubmissions' },
]

const INBOX_ITEMS: NavItem[] = [
  { label: 'Candidate Applications', to: '/admin/candidate-applications', icon: InboxIcon },
  { label: 'School Registrations', to: '/admin/school-registrations', icon: InboxIcon },
  { label: 'Home Tutor Requests', to: '/admin/home-tutor-requests', icon: InboxIcon },
  { label: 'Contact Messages', to: '/admin/contact-messages', icon: InboxIcon },
  { label: 'Vacancy Applications', to: '/admin/vacancy-applications', icon: InboxIcon },
]

const MANAGEMENT_ITEMS: NavItem[] = [
  { label: 'Reports', to: '/admin/reports', icon: DashboardIcon, requires: 'viewReports' },
  { label: 'Staff', to: '/admin/staff', icon: UsersIcon, requires: 'manageStaff' },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: InboxIcon, requires: 'viewAuditLogs' },
  { label: 'Settings', to: '/admin/settings', icon: ShieldIcon, requires: 'manageSettings' },
]

function NavLinkItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user: admin, logout, can } = useUserAuth()
  const visibleManagement = MANAGEMENT_ITEMS.filter((item) => !item.requires || can(item.requires))
  const visibleNav = NAV_ITEMS.filter((item) => !item.requires || can(item.requires))

  return (
    <>
      <div className="px-1.5 pt-1">
        <p className="text-lg font-extrabold text-white">TeachingCareer</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">Admin Panel</p>
      </div>

      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl border border-white/15 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:border-teal hover:bg-white/10"
      >
        <ExternalLinkIcon size={17} />
        Back to Website
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {visibleNav.map((item) => (
            <NavLinkItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <p className="px-3.5 text-xs font-bold uppercase tracking-wide text-white/40">Submissions</p>
          {INBOX_ITEMS.map((item) => (
            <NavLinkItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
        {visibleManagement.length > 0 ? (
          <div className="flex flex-col gap-1">
            <p className="px-3.5 text-xs font-bold uppercase tracking-wide text-white/40">Management</p>
            {visibleManagement.map((item) => (
              <NavLinkItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ) : null}
      </nav>

      <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
        <p className="truncate px-1.5 text-xs text-white/60">
          {admin?.email} <span className="text-white/40">· {admin?.role.replace('_', ' ')}</span>
        </p>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <LogOutIcon size={17} />
          Log Out
        </button>
      </div>
    </>
  )
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-mint/30">
      <aside className="hidden w-72 shrink-0 flex-col gap-6 bg-navy p-5 lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-navy/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col gap-6 bg-navy p-5">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-3 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon size={18} />
          </button>
          <span className="hidden text-sm font-semibold text-body lg:block">TeachingCareer Admin</span>
          <NotificationsBell />
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
