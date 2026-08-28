import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { SiteUser } from '@/auth/UserAuthContext'
import type { Candidate, School, Service, Settings, Vacancy, BlogPost } from '@/types'

// ---- Managed listings (Vacancy / School / Candidate / BlogPost / Service): admin CRUD ----
// These call the /admin/* endpoints (not the public ones), which return
// every record including archived/suspended/draft ones — the public routes
// filter those out, so the admin list would otherwise never be able to find
// and restore them.

export function useAdminVacancies() {
  return useQuery({ queryKey: ['admin', 'vacancies'], queryFn: () => api.get<Vacancy[]>('/admin/vacancies') })
}

export function useAdminSchools() {
  return useQuery({ queryKey: ['admin', 'schools'], queryFn: () => api.get<School[]>('/admin/schools') })
}

export function useAdminCandidates() {
  return useQuery({ queryKey: ['admin', 'candidates'], queryFn: () => api.get<Candidate[]>('/admin/candidates') })
}

export function useAdminBlogPosts() {
  return useQuery({ queryKey: ['admin', 'blog-posts'], queryFn: () => api.get<BlogPost[]>('/admin/blog-posts') })
}

export function useAdminServices() {
  return useQuery({ queryKey: ['admin', 'services'], queryFn: () => api.get<Service[]>('/admin/services') })
}

function useCrudMutations<T extends { id: string }>(resource: string, invalidateKeys: string[][]) {
  const queryClient = useQueryClient()
  const invalidate = () => invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))

  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.postJson<T>(`/admin/${resource}`, data),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.putJson<T>(`/admin/${resource}/${id}`, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/${resource}/${id}`),
    onSuccess: invalidate,
  })
  const runStatusAction = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patchJson<T>(`/admin/${resource}/${id}/status`, { action }),
    onSuccess: invalidate,
  })

  return { create, update, remove, runStatusAction }
}

export function useVacancyMutations() {
  return useCrudMutations<Vacancy>('vacancies', [['admin', 'vacancies'], ['vacancies'], ['admin', 'stats'], ['admin', 'reports']])
}

export function useSchoolMutations() {
  return useCrudMutations<School>('schools', [['admin', 'schools'], ['schools'], ['admin', 'stats'], ['admin', 'reports']])
}

export function useCandidateMutations() {
  return useCrudMutations<Candidate>('candidates', [['admin', 'candidates'], ['candidates'], ['admin', 'stats'], ['admin', 'reports']])
}

export function useBlogPostMutations() {
  return useCrudMutations<BlogPost>('blog-posts', [['admin', 'blog-posts'], ['blog-posts']])
}

export function useServiceMutations() {
  return useCrudMutations<Service>('services', [['admin', 'services'], ['services']])
}

// ---- Submission inboxes: read + status update + delete ----
// (Home Tutor Requests / Contact Messages / Vacancy Applications — Candidate
// Applications and School Registrations have their own dedicated
// verify/approve flow below instead of a free-text status field.)

export interface SubmissionRecord {
  id: string
  createdAt: string
  [key: string]: unknown
}

export function useAdminSubmissions(resource: string) {
  return useQuery({
    queryKey: ['admin', resource],
    queryFn: () => api.get<SubmissionRecord[]>(`/admin/${resource}`),
  })
}

export function useSubmissionMutations(resource: string) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', resource] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patchJson<SubmissionRecord>(`/admin/${resource}/${id}/status`, { status }),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/${resource}/${id}`),
    onSuccess: invalidate,
  })

  return { updateStatus, remove }
}

// ---- Home tutor requests: assign a verified candidate as the tutor ----

export function useAssignTutor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, candidateId }: { id: string; candidateId: string | null }) =>
      api.patchJson<SubmissionRecord>(`/admin/home-tutor-requests/${id}/assign`, { candidateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'home-tutor-requests'] })
    },
  })
}

// ---- Candidate verification & school approval (promotion workflow) ----

export function useCandidateApplications() {
  return useAdminSubmissions('candidate-applications')
}

export function useCandidateVerification() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'candidate-applications'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'candidates'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'documents', 'pending'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const verify = useMutation({
    mutationFn: (id: string) => api.postJson(`/admin/candidate-applications/${id}/verify`, {}),
    onSuccess: invalidate,
  })
  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.postJson(`/admin/candidate-applications/${id}/reject`, { reason }),
    onSuccess: invalidate,
  })

  return { verify, reject }
}

export function useSchoolRegistrations() {
  return useAdminSubmissions('school-registrations')
}

export function useSchoolApproval() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'school-registrations'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'schools'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const approve = useMutation({
    mutationFn: (id: string) => api.postJson(`/admin/school-registrations/${id}/approve`, {}),
    onSuccess: invalidate,
  })
  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.postJson(`/admin/school-registrations/${id}/reject`, { reason }),
    onSuccess: invalidate,
  })

  return { approve, reject }
}

// ---- Document management (private, temporary) ----

export function useAdminPendingDocuments() {
  return useQuery({
    queryKey: ['admin', 'documents', 'pending'],
    queryFn: () => api.get<SubmissionRecord[]>('/admin/documents/pending'),
  })
}

export function adminDocumentUrl(applicationId: string, field: string) {
  return `/api/admin/documents/${applicationId}/${field}`
}

// ---- Notifications ----

export interface NotificationRecord {
  id: string
  type: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export function useAdminNotifications() {
  return useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => api.get<{ items: NotificationRecord[]; unreadCount: number }>('/admin/notifications'),
    refetchInterval: 30_000,
  })
}

export function useNotificationMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })

  const markRead = useMutation({
    mutationFn: (id: string) => api.patchJson(`/admin/notifications/${id}/read`, {}),
    onSuccess: invalidate,
  })
  const markAllRead = useMutation({
    mutationFn: () => api.postJson('/admin/notifications/mark-all-read', {}),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/notifications/${id}`),
    onSuccess: invalidate,
  })

  return { markRead, markAllRead, remove }
}

// ---- Staff & permissions ----

export function useAdminStaff() {
  return useQuery({ queryKey: ['admin', 'staff'], queryFn: () => api.get<SiteUser[]>('/admin/staff') })
}

export function useStaffMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })

  const create = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
      api.postJson<SiteUser>('/admin/staff', data),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.putJson<SiteUser>(`/admin/staff/${id}`, data),
    onSuccess: invalidate,
  })

  return { create, update }
}

// ---- Audit logs ----

export interface AuditLogRecord {
  id: string
  adminEmail: string
  action: string
  resource: string
  resourceId?: string
  details?: string
  ip?: string
  createdAt: string
}

export function useAuditLogs(page: number) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => api.get<{ items: AuditLogRecord[]; total: number; page: number; totalPages: number }>(`/admin/audit-logs?page=${page}`),
    placeholderData: (prev) => prev,
  })
}

// ---- Reports ----

export interface ReportsOverview {
  submissionsByDay: {
    date: string
    candidateApplications: number
    schoolRegistrations: number
    homeTutorRequests: number
    contactMessages: number
    vacancyApplications: number
  }[]
  applicationsByStatus: { label: string; count: number }[]
  vacanciesByCity: { label: string; count: number }[]
  vacanciesByEmploymentType: { label: string; count: number }[]
  schoolsByCurriculum: { label: string; count: number }[]
  candidatesByCity: { label: string; count: number }[]
}

export function useAdminReports() {
  return useQuery({ queryKey: ['admin', 'reports'], queryFn: () => api.get<ReportsOverview>('/admin/reports/overview') })
}

// ---- Settings ----

export function useAdminSettingsQuery() {
  return useQuery({ queryKey: ['admin', 'settings'], queryFn: () => api.get<Settings>('/settings') })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.putJson<Settings>('/admin/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

// ---- Dashboard stats ----

export interface AdminStats {
  vacancies: number
  activeVacancies: number
  schools: number
  candidates: number
  candidateApplications: number
  schoolRegistrations: number
  homeTutorRequests: number
  contactMessages: number
  vacancyApplications: number
  pendingVerifications: number
  pendingApprovals: number
}

export function useAdminStats() {
  return useQuery({ queryKey: ['admin', 'stats'], queryFn: () => api.get<AdminStats>('/admin/stats') })
}
