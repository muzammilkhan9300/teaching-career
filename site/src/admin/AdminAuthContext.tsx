import { createContext, useContext, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import { roleHasCapability, type AdminRole, type Capability } from './permissions'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  active: boolean
}

interface AdminAuthContextValue {
  admin: AdminUser | undefined
  isLoading: boolean
  isAuthenticated: boolean
  login: (input: { email: string; password: string }) => Promise<AdminUser>
  loginError: string | null
  isLoggingIn: boolean
  logout: () => void
  can: (capability: Capability) => boolean
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: () => api.get<AdminUser>('/admin/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const loginMutation = useMutation({
    mutationFn: (input: { email: string; password: string }) => api.postJson<AdminUser>('/admin/auth/login', input),
    onSuccess: (admin) => {
      queryClient.setQueryData(['admin', 'me'], admin)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => api.postJson('/admin/auth/logout', {}),
    onSuccess: () => {
      queryClient.setQueryData(['admin', 'me'], undefined)
      queryClient.clear()
    },
  })

  const value: AdminAuthContextValue = {
    admin: meQuery.data,
    isLoading: meQuery.isLoading,
    isAuthenticated: !!meQuery.data,
    login: (input) => loginMutation.mutateAsync(input),
    loginError: loginMutation.error instanceof ApiError ? loginMutation.error.message : null,
    isLoggingIn: loginMutation.isPending,
    logout: () => logoutMutation.mutate(),
    can: (capability) => roleHasCapability(meQuery.data?.role, capability),
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
