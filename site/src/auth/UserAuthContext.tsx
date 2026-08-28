import { createContext, useContext, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import { roleHasCapability, type UserRole, type Capability } from '@/admin/permissions'

export interface SiteUser {
  id: string
  name: string
  email: string
  authProvider: 'local' | 'google'
  avatarUrl: string
  role: UserRole
  active: boolean
  createdAt: string
}

interface RegisterInput {
  name: string
  email: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

interface UserAuthContextValue {
  user: SiteUser | undefined
  isLoading: boolean
  isAuthenticated: boolean
  /** True for any staff-level role (moderator/admin/super_admin) — false for a plain 'user'. */
  isStaff: boolean
  can: (capability: Capability) => boolean
  register: (input: RegisterInput) => Promise<SiteUser>
  registerError: string | null
  isRegistering: boolean
  login: (input: LoginInput) => Promise<SiteUser>
  loginError: string | null
  isLoggingIn: boolean
  logout: () => void
  updateProfile: (input: { name?: string; avatarUrl?: string }) => Promise<SiteUser>
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null)

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => api.get<SiteUser>('/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => api.postJson<SiteUser>('/auth/register', input),
    onSuccess: (user) => queryClient.setQueryData(['user', 'me'], user),
  })

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => api.postJson<SiteUser>('/auth/login', input),
    onSuccess: (user) => queryClient.setQueryData(['user', 'me'], user),
  })

  const logoutMutation = useMutation({
    mutationFn: () => api.postJson('/auth/logout', {}),
    onSuccess: () => {
      // Wipes every cached query, not just ['user','me'] — a staff session
      // caches lists (candidates, vacancies, ...) that must never survive
      // into a different account logging in on the same tab.
      queryClient.clear()
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (input: { name?: string; avatarUrl?: string }) => api.putJson<SiteUser>('/auth/me', input),
    onSuccess: (user) => queryClient.setQueryData(['user', 'me'], user),
  })

  const role = meQuery.data?.role

  const value: UserAuthContextValue = {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    isAuthenticated: !!meQuery.data,
    isStaff: !!role && role !== 'user',
    can: (capability) => (role ? roleHasCapability(role, capability) : false),
    register: (input) => registerMutation.mutateAsync(input),
    registerError: registerMutation.error instanceof ApiError ? registerMutation.error.message : null,
    isRegistering: registerMutation.isPending,
    login: (input) => loginMutation.mutateAsync(input),
    loginError: loginMutation.error instanceof ApiError ? loginMutation.error.message : null,
    isLoggingIn: loginMutation.isPending,
    logout: () => logoutMutation.mutate(),
    updateProfile: (input) => updateProfileMutation.mutateAsync(input),
  }

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext)
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider')
  return ctx
}
