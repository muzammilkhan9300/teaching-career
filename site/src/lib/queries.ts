import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import type { BlogPost, Candidate, CandidatesPage, School, SchoolDetail, Vacancy } from '@/types'

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
