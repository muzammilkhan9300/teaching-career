import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './api'
import type { BlogPost, Candidate, CandidatesPage, MyCandidateApplication, MySchoolRegistration, School, SchoolDetail, Service, Settings, Vacancy } from '@/types'

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

export function useMyVacancies(enabled = true) {
  return useQuery({ queryKey: ['vacancies', 'mine'], queryFn: () => api.get<Vacancy[]>('/vacancies/mine'), enabled })
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
  return useQuery({
    queryKey: ['candidate-applications', 'mine'],
    queryFn: async () => {
      try {
        return await api.get<MyCandidateApplication>('/candidate-registrations/mine')
      } catch (error) {
        // No application yet is a normal state for this query, not an error.
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
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
  return useQuery({
    queryKey: ['school-registrations', 'mine'],
    queryFn: async () => {
      try {
        return await api.get<MySchoolRegistration>('/school-registrations/mine')
      } catch (error) {
        // No registration yet is a normal state for this query, not an error.
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
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
