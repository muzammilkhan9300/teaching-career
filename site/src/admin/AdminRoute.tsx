import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'
import { SpinnerIcon } from '@/components/icons/admin'

export function AdminRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <SpinnerIcon className="animate-spin text-white" size={32} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
