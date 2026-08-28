import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserAuth } from '@/auth/UserAuthContext'
import { SpinnerIcon, AlertIcon } from '@/components/icons/admin'
import { Button } from '@/components/ui/Button'

export function AdminRoute() {
  const { isAuthenticated, isStaff, isLoading } = useUserAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <SpinnerIcon className="animate-spin text-white" size={32} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Authenticated, but not a staff-level role — this is not a login
  // problem, so it isn't a redirect to the login form. The real boundary is
  // the backend's 401/403 on every /api/admin/* call regardless of this UI.
  if (!isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mint/30 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-tc">
          <AlertIcon size={28} />
        </span>
        <h1 className="text-xl font-extrabold text-navy">Access Denied</h1>
        <p className="max-w-sm text-sm text-body">
          Your account doesn&rsquo;t have permission to view the Admin Dashboard. Contact a super admin if you believe
          this is a mistake.
        </p>
        <Button to="/">Back to TeachingCareer</Button>
      </div>
    )
  }

  return <Outlet />
}
