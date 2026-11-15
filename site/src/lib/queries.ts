import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './api'
import { useUserAuth } from '@/auth/UserAuthContext'
import type {
  BlogPost,
  Candidate,
  CandidatesPage,
  HomepageContent,
  HomepageUpdate,
  MyCandidateApplication,
  MySchoolRegistration,
  School,
  SchoolDetail,
  SchoolRequirement,
  Service,
  Settings,
  Vacancy,
} from '@/types'

// ---- Homepage hero (slides + the three info-box tabs, one request) ----

export function useHomepageContent() {
  return useQuery({ queryKey: ['homepage'], queryFn: () => api.get<HomepageContent>('/homepage') })
}

export function useHomepageUpdates() {
  return useQuery({ queryKey: ['updates'], queryFn: () => api.get<HomepageUpdate[]>('/updates') })
}

export function useSchoolRequirements() {
  return useQuery({ queryKey: ['school-requirements'], queryFn: () => api.get<SchoolRequirement[]>('/school-requirements') })
}

export function useSchoolRequirement(id: string | undefined) {
  return useQuery({
    queryKey: ['school-requirement', id],
    queryFn: () => api.get<SchoolRequirement>(`/school-requirements/${id}`),
    enabled: Boolean(id),
    retry: false,
  })
}

export function useVacancies() {
  return useQuery({ queryKey: ['vacancies'], queryFn: () => api.get<Vacancy[]>('/vacancies') })
}

export function useVacancy(id: string | undefined) {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => api.get<Vacancy>(`/vacancies/${id}`),
    enabled: Boolean(id),
    retry: false,
  })
}

// ---- A logged-in school owner's own vacancies (self-service post/edit/delete) ----

// The "mine" queries below are keyed by the signed-in user's id and only run
// while signed in: a visitor who logs in (e.g. via the header modal) gets a
// fresh fetch under a new key instead of a stale 401 cached from before login.
export function useMyVacancies(enabled = true) {
  const { user } = useUserAuth()
  return useQuery({
    queryKey: ['vacancies', 'mine', user?.id],
    queryFn: () => api.get<Vacancy[]>('/vacancies/mine'),
    enabled: enabled && Boolean(user),
  })
}

export function useMyVacancyMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['vacancies', 'mine'] })
    queryClient.invalidateQueries({ queryKey: ['vacancies'] })
    queryClient.invalidateQueries({ queryKey: ['schools'] })
  }

  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.postJson<Vacancy>('/vacancies/mine', data),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.putJson<Vacancy>(`/vacancies/mine/${id}`, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/vacancies/mine/${id}`),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

export function useSchools() {
  return useQuery({ queryKey: ['schools'], queryFn: () => api.get<School[]>('/schools') })
}

export function useSchool(id: string | undefined) {
  return useQuery({
    queryKey: ['school', id],
    queryFn: () => api.get<SchoolDetail>(`/schools/${id}`),
    enabled: Boolean(id),
    retry: false,
  })
}

export function useCandidateFilterOptions() {
  return useQuery({
    queryKey: ['candidates', 'filters'],
    queryFn: () => api.get<{ cities: string[]; teachingTypes: string[] }>('/candidates/filters'),
  })
}

export interface CandidateFilters {
  city: string
  teachingType: string
  search: string
  page: number
}

export function useCandidates(filters: CandidateFilters) {
  const params = new URLSearchParams()
  if (filters.city !== 'All Cities') params.set('city', filters.city)
  if (filters.teachingType !== 'All Teaching Types') params.set('teachingType', filters.teachingType)
  if (filters.search) params.set('search', filters.search)
  params.set('page', String(filters.page))

  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => api.get<CandidatesPage>(`/candidates?${params.toString()}`),
    placeholderData: (previous) => previous,
  })
}

export function useCandidate(id: string | undefined) {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => api.get<Candidate>(`/candidates/${id}`),
    enabled: Boolean(id),
    retry: false,
  })
}

export function useBlogPosts() {
  return useQuery({ queryKey: ['blog-posts'], queryFn: () => api.get<BlogPost[]>('/blog-posts') })
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => api.get<BlogPost>(`/blog-posts/${slug}`),
    enabled: Boolean(slug),
    retry: false,
  })
}

export function useServices() {
  return useQuery({ queryKey: ['services'], queryFn: () => api.get<Service[]>('/services') })
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<Settings>('/settings'),
    staleTime: 5 * 60 * 1000,
  })
}

// ---- A logged-in candidate's own application (self-service edit/resubmit) ----

export function useMyCandidateApplication() {
  const { user } = useUserAuth()
  return useQuery({
    queryKey: ['candidate-applications', 'mine', user?.id],
    enabled: Boolean(user),
    // A 401 means the session expired — retrying won't fix it, and the pages
    // reading this query send the visitor to log in again right away.
    retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 3,
    // Server returns 200 + null when there's no application yet — that's a
    // normal state for this query, not an error, so no 404 to catch here.
    queryFn: () => api.get<MyCandidateApplication | null>('/candidate-registrations/mine'),
  })
}

export function useMyCandidateApplicationMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['candidate-applications', 'mine'] })

  const create = useMutation({
    mutationFn: (formData: FormData) => api.postForm<MyCandidateApplication>('/candidate-registrations', formData),
    onSuccess: invalidate,
  })
  const resubmit = useMutation({
    mutationFn: (formData: FormData) => api.putForm<MyCandidateApplication>('/candidate-registrations/mine', formData),
    onSuccess: invalidate,
  })

  return { create, resubmit }
}

// ---- A logged-in school owner's own registration (self-service edit/resubmit) ----

export function useMySchoolRegistration() {
  const { user } = useUserAuth()
  return useQuery({
    queryKey: ['school-registrations', 'mine', user?.id],
    enabled: Boolean(user),
    // Server returns 200 + null when there's no registration yet — that's a
    // normal state for this query, not an error, so no 404 to catch here.
    queryFn: () => api.get<MySchoolRegistration | null>('/school-registrations/mine'),
  })
}

export function useMySchoolRegistrationMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['school-registrations', 'mine'] })

  const create = useMutation({
    mutationFn: (formData: FormData) => api.postForm<MySchoolRegistration>('/school-registrations', formData),
    onSuccess: invalidate,
  })
  const resubmit = useMutation({
    mutationFn: (formData: FormData) => api.putForm<MySchoolRegistration>('/school-registrations/mine', formData),
    onSuccess: invalidate,
  })

  return { create, resubmit }
}

// ---- Self-service Edit Profile (published candidate / approved school) ----
// Goes live directly without re-review; documents are never part of these requests.

export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.putForm<{ application: MyCandidateApplication; candidate: Candidate }>('/profile/candidate', formData),
    onSuccess: ({ candidate }) => {
      queryClient.invalidateQueries({ queryKey: ['candidate-applications', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['candidate', candidate.id] })
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}

export function useUpdateSchoolProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.putForm<{ registration: MySchoolRegistration; school: School }>('/profile/school', formData),
    onSuccess: ({ school }) => {
      queryClient.invalidateQueries({ queryKey: ['school-registrations', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['school', school.id] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
    },
  })
}

// ---- Admin: edit any published candidate/school profile (same form as the owner's) ----

export function useAdminCandidateApplication(candidateId: string | undefined) {
  return useQuery({
    queryKey: ['admin-profile-edit', 'candidate', candidateId],
    enabled: Boolean(candidateId),
    retry: false,
    queryFn: () => api.get<MyCandidateApplication>(`/admin/profile-edit/candidate/${candidateId}`),
  })
}

export function useAdminUpdateCandidateProfile(candidateId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.putForm<{ application: MyCandidateApplication; candidate: Candidate }>(`/admin/profile-edit/candidate/${candidateId}`, formData),
    onSuccess: ({ candidate }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile-edit'] })
      queryClient.invalidateQueries({ queryKey: ['candidate', candidate.id] })
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}

export function useAdminSchoolRegistration(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['admin-profile-edit', 'school', schoolId],
    enabled: Boolean(schoolId),
    retry: false,
    queryFn: () => api.get<MySchoolRegistration>(`/admin/profile-edit/school/${schoolId}`),
  })
}

export function useAdminUpdateSchoolProfile(schoolId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.putForm<{ registration: MySchoolRegistration; school: School }>(`/admin/profile-edit/school/${schoolId}`, formData),
    onSuccess: ({ school }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile-edit'] })
      queryClient.invalidateQueries({ queryKey: ['school', school.id] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
    },
  })
}
