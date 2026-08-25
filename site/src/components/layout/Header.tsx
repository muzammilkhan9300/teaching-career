import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { ChevronRightIcon, CloseIcon, MenuIcon, PhoneIcon } from '@/components/icons'

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
          <a
            href="tel:03128423676"
            className="hidden items-center gap-2 text-navy sm:flex"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-teal-deep">
              <PhoneIcon size={16} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold">0312 8423676</span>
              <span className="text-[11px] text-body">24/7 Availability</span>
            </span>
          </a>

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
              <a href="tel:03128423676" className="flex items-center gap-2 px-3 text-sm font-bold text-navy">
                <PhoneIcon size={16} className="text-teal-deep" />
                0312 8423676
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
