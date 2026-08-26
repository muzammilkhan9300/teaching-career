import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Candidate, CandidatesPage, School, Vacancy } from '@/types'

// ---- Managed listings (Vacancy / School / Candidate): admin CRUD ----

export function useAdminVacancies() {
  return useQuery({ queryKey: ['admin', 'vacancies'], queryFn: () => api.get<Vacancy[]>('/vacancies') })
}

export function useAdminSchools() {
  return useQuery({ queryKey: ['admin', 'schools'], queryFn: () => api.get<School[]>('/schools') })
}

export function useAdminCandidates() {
  return useQuery({
    queryKey: ['admin', 'candidates'],
    queryFn: () => api.get<CandidatesPage>('/candidates?limit=1000&page=1'),
    select: (data) => data.items,
  })
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

  return { create, update, remove }
}

export function useVacancyMutations() {
  return useCrudMutations<Vacancy>('vacancies', [['admin', 'vacancies'], ['vacancies'], ['admin', 'stats']])
}

export function useSchoolMutations() {
  return useCrudMutations<School>('schools', [['admin', 'schools'], ['schools'], ['admin', 'stats']])
}

export function useCandidateMutations() {
  return useCrudMutations<Candidate>('candidates', [['admin', 'candidates'], ['candidates'], ['admin', 'stats']])
}

// ---- Submission inboxes: read + status update + delete ----

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
}

export function useAdminStats() {
  return useQuery({ queryKey: ['admin', 'stats'], queryFn: () => api.get<AdminStats>('/admin/stats') })
}
