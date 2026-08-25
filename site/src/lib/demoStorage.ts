/**
 * Frontend-only demo persistence. Form submissions are saved to
 * localStorage purely so the app is testable end-to-end (a "submitted"
 * form leads to a real success page). This is NOT secure storage and is
 * replaced by real API calls (POST to Express + MongoDB) in the backend
 * phase — every call site here is a single, isolated line to swap.
 */
export const DEMO_STORAGE_KEYS = {
  candidateApplications: 'tc_demo_candidate_applications',
  schoolRegistrations: 'tc_demo_school_registrations',
  homeTutorRequests: 'tc_demo_home_tutor_requests',
  contactMessages: 'tc_demo_contact_messages',
  vacancyApplications: 'tc_demo_candidate_applications_to_vacancies',
} as const

export function saveDemoRecord(storageKey: string, record: Record<string, unknown>) {
  let existing: Record<string, unknown>[] = []
  try {
    existing = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
  } catch {
    existing = []
  }
  existing.push({ ...record, submittedAt: new Date().toISOString() })
  localStorage.setItem(storageKey, JSON.stringify(existing))
}
