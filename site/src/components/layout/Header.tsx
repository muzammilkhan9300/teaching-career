import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { ChevronRightIcon, CloseIcon, LogOutIcon, MenuIcon, PersonIcon } from '@/components/icons'
import { useUserAuth } from '@/auth/UserAuthContext'

interface NavLeaf {
  label: string
  to: string
}

interface NavParent {
  label: string
  children: NavLeaf[]
}

type NavEntry = NavLeaf | NavParent

const NAV_ITEMS: NavEntry[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Blogs', to: '/blog' },
  {
    label: 'Registrations',
    children: [
      { label: 'Register Your School', to: '/school-registration' },
      { label: 'Register as a Candidate', to: '/candidate-registration' },
    ],
  },
  {
    label: 'Profiles',
    children: [
      { label: 'School Profiles', to: '/school-profiles' },
      { label: 'Candidate Profiles', to: '/candidate-profiles' },
    ],
  },
  { label: 'Contact', to: '/contact' },
]

function isParent(entry: NavEntry): entry is NavParent {
  return 'children' in entry
}

export function Header() {
  const { user, isAuthenticated, logout } = useUserAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMobileMenus, setOpenMobileMenus] = useState<string[]>([])
  const location = useLocation()

  function toggleMobileMenu(label: string) {
    setOpenMobileMenus((current) =>
      current.includes(label) ? current.filter((l) => l !== label) : [...current, label],
    )
  }

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'text-sm font-semibold transition-colors hover:text-teal',
      isActive ? 'text-teal' : 'text-navy',
    )

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="tc-container flex min-h-[88px] items-center gap-6 lg:min-h-[100px]">
        <Link to="/" className="flex shrink-0 items-center" aria-label="TeachingCareer — Home">
          <img
            src="/assets/images/logo.png"
            alt="TeachingCareer — Connecting Talent. Building Futures."
            className="h-14 w-auto lg:h-[64px]"
            width={286}
            height={84}
            loading="eager"
            decoding="async"
          />
        </Link>

        <nav className="hidden flex-1 lg:block" aria-label="Primary">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              if (isParent(item)) {
                const active = item.children.some((child) => location.pathname === child.to)
                return (
                  <li key={item.label} className="group relative">
                    <button
                      type="button"
                      className={clsx(
                        'flex items-center gap-1 text-sm font-semibold transition-colors hover:text-teal',
                        active ? 'text-teal' : 'text-navy',
                      )}
                    >
                      {item.label}
                      <ChevronRightIcon size={12} className="rotate-90 transition-transform group-hover:-rotate-90" />
                    </button>
                    <ul className="invisible absolute left-0 top-full z-20 w-64 translate-y-2 rounded-2xl border border-line bg-white p-2 opacity-0 shadow-tc-lg transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <Link
                            to={child.to}
                            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-navy transition hover:bg-mint hover:text-teal-deep"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              }
              return (
                <li key={item.to}>
                  <NavLink to={item.to} className={linkClasses} end={item.to === '/'}>
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="group relative hidden lg:block">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-line py-1.5 pl-1.5 pr-3 text-sm font-semibold text-navy transition hover:border-teal"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-mint text-teal-deep">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <PersonIcon size={16} />
                  )}
                </span>
                {user.name.split(' ')[0]}
              </button>
              <ul className="invisible absolute right-0 top-full z-20 w-48 translate-y-2 rounded-2xl border border-line bg-white p-2 opacity-0 shadow-tc-lg transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <li>
                  <Link to="/profile" className="block rounded-xl px-4 py-2.5 text-sm font-medium text-navy transition hover:bg-mint hover:text-teal-deep">
                    My Profile
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOutIcon size={14} />
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                to="/login"
                state={{ backgroundLocation: location }}
                className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-teal hover:text-teal"
              >
                <PersonIcon size={15} />
                Log In
              </Link>
              <Link
                to="/signup"
                state={{ backgroundLocation: location }}
                className="flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-tc transition hover:bg-teal-dark"
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="tc-mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy lg:hidden"
          >
            <span className="sr-only">Menu</span>
            {mobileOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav id="tc-mobile-nav" aria-label="Primary" className="border-t border-line bg-white lg:hidden">
          <ul className="tc-container flex flex-col gap-1 py-3">
            {NAV_ITEMS.map((item) => {
              if (isParent(item)) {
                const open = openMobileMenus.includes(item.label)
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleMobileMenu(item.label)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-navy"
                    >
                      {item.label}
                      <ChevronRightIcon size={14} className={clsx('transition-transform', open && 'rotate-90')} />
                    </button>
                    {open ? (
                      <ul className="pl-4">
                        {item.children.map((child) => (
                          <li key={child.to}>
                            <Link
                              to={child.to}
                              onClick={() => setMobileOpen(false)}
                              className="block rounded-lg px-3 py-2 text-sm text-body hover:text-teal"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              }
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'block rounded-lg px-3 py-2.5 text-sm font-semibold',
                        isActive ? 'text-teal' : 'text-navy',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
            <li className="mt-2 border-t border-line pt-3">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-1">
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy"
                  >
                    <PersonIcon size={16} className="text-teal-deep" />
                    My Profile ({user.name.split(' ')[0]})
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600"
                  >
                    <LogOutIcon size={16} />
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    to="/login"
                    state={{ backgroundLocation: location }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy"
                  >
                    <PersonIcon size={16} className="text-teal-deep" />
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    state={{ backgroundLocation: location }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-teal-deep"
                  >
                    <PersonIcon size={16} />
                    Sign Up
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
