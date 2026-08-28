import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUserAuth } from '@/auth/UserAuthContext'
import { LockIcon } from '@/components/icons'

interface RequireLoginProps {
  /** What the visitor is trying to do, e.g. "apply for this vacancy". */
  activity: string
  children: ReactNode
  /** Tighter spacing for contexts like the footer, where the full card would overwhelm the layout. */
  compact?: boolean
}

/**
 * Gates a public form behind a real session — mirrors AdminRoute's pattern
 * but for "must be logged in" rather than "must be staff". This is a UX
 * convenience only; the actual boundary is requireUser on the backend
 * route, which rejects the request regardless of what this component shows.
 */
export function RequireLogin({ activity, children, compact }: RequireLoginProps) {
  const { isAuthenticated, isLoading } = useUserAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const authState = { backgroundLocation: location }
    return (
      <div
        className={
          compact
            ? 'flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-6 text-center'
            : 'flex flex-col items-center gap-4 rounded-3xl border border-line bg-white p-8 text-center shadow-tc'
        }
      >
        <span className={compact ? 'flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-teal' : 'flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-teal-deep'}>
          <LockIcon size={compact ? 18 : 24} />
        </span>
        <p className={compact ? 'text-sm text-white/70' : 'text-body'}>
          Please log in to {activity}.
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            state={authState}
            className={
              compact
                ? 'rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-teal'
                : 'rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-navy transition hover:border-teal hover:text-teal'
            }
          >
            Log In
          </Link>
          <Link
            to="/signup"
            state={authState}
            className="rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white shadow-tc transition hover:bg-teal-dark"
          >
            Sign Up
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
