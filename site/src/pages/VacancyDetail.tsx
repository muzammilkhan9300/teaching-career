import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FormCard, FormSectionTitle } from '@/components/ui/FormCard'
import { RequireLogin } from '@/components/auth/RequireLogin'
import { Button } from '@/components/ui/Button'
import { TextField, TextareaField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { useVacancy } from '@/lib/queries'
import { api, ApiError } from '@/lib/api'
import { vacancyApplicationSchema, type VacancyApplicationInput } from '@/lib/validation'
import { CapIcon, ChevronRightIcon, ClockIcon, PinIcon } from '@/components/icons'
import type { Vacancy } from '@/types'

const DETAIL_ROWS: { label: string; key: keyof Vacancy }[] = [
  { label: 'School', key: 'school' },
  { label: 'Subject', key: 'subject' },
  { label: 'Qualification', key: 'qualification' },
  { label: 'Experience', key: 'experience' },
  { label: 'Curriculum', key: 'curriculum' },
  { label: 'Employment Type', key: 'employmentType' },
  { label: 'Salary Range', key: 'salaryRange' },
  { label: 'City', key: 'city' },
  { label: 'Area', key: 'area' },
  { label: 'Joining Date', key: 'joiningDate' },
  { label: 'Teachers Needed', key: 'teachersNeeded' },
]

export default function VacancyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: vacancy, isPending } = useVacancy(id)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VacancyApplicationInput>({ resolver: zodResolver(vacancyApplicationSchema) })

  const applyMutation = useMutation({
    mutationFn: (data: VacancyApplicationInput) => api.postJson(`/vacancies/${id}/apply`, data),
    onSuccess: () => {
      showToast({ variant: 'success', title: 'Application sent', description: `You applied to ${vacancy?.title}.` })
      navigate('/registration-success?type=application')
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Please try applying again.'
      showToast({ variant: 'error', title: 'Something went wrong', description: message })
    },
  })

  function onSubmit(data: VacancyApplicationInput) {
    applyMutation.mutate(data)
  }

  if (isPending) {
    return (
      <section className="tc-container flex min-h-[50vh] items-center justify-center py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </section>
    )
  }

  if (!vacancy) {
    return (
      <section className="tc-container flex flex-col items-center gap-4 py-24 text-center">
        <Helmet>
          <title>Vacancy Not Found — TeachingCareer</title>
        </Helmet>
        <h1 className="text-2xl font-extrabold text-navy">Vacancy Not Available</h1>
        <p className="max-w-md text-body">This vacancy isn&rsquo;t available, or the link may be incorrect.</p>
        <Button to="/school-profiles" icon={<ChevronRightIcon size={15} />}>
          Browse Schools
        </Button>
      </section>
    )
  }

  return (
    <>
      <Helmet>
        <title>{vacancy.title} — TeachingCareer</title>
        <meta name="description" content={`${vacancy.title} at ${vacancy.school}, ${vacancy.city}.`} />
      </Helmet>

      <Breadcrumb items={[{ label: 'Profiles', to: '/school-profiles' }, { label: vacancy.title }]} />

      <section className="py-16">
        <div className="tc-container">
          <FormCard>
            <div>
              <h1 className="text-2xl font-extrabold text-navy">{vacancy.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-teal-deep">
                <span className="flex items-center gap-1.5">
                  <PinIcon size={14} />
                  {vacancy.school} &middot; {vacancy.city}, {vacancy.area}
                </span>
                <span className="flex items-center gap-1.5">
                  <ClockIcon size={14} />
                  {vacancy.employmentType}
                </span>
              </p>
            </div>

            <hr className="my-8 border-line" />

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-body">Job Description</p>
              <p className="leading-relaxed text-body">{vacancy.description}</p>
            </div>

            <hr className="my-8 border-line" />

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-body">Vacancy Details</p>
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {DETAIL_ROWS.map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-line py-2 text-sm">
                    <dt className="text-body">{row.label}</dt>
                    <dd className="font-semibold text-navy">{String(vacancy[row.key])}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <hr className="my-8 border-line" />

            <RequireLogin activity="apply for this vacancy">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <FormSectionTitle>Apply for This Vacancy</FormSectionTitle>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id="applicantName"
                    label="Full Name"
                    required
                    placeholder="Your full name"
                    error={errors.applicantName?.message}
                    {...register('applicantName')}
                  />
                  <TextField
                    id="applicantPhone"
                    label="Phone / WhatsApp"
                    required
                    placeholder="03XX XXXXXXX"
                    error={errors.applicantPhone?.message}
                    {...register('applicantPhone')}
                  />
                  <TextField
                    id="applicantEmail"
                    type="email"
                    label="Email"
                    required
                    placeholder="you@example.com"
                    wrapperClassName="sm:col-span-2"
                    error={errors.applicantEmail?.message}
                    {...register('applicantEmail')}
                  />
                  <TextareaField
                    id="coverNote"
                    label="Message to the school"
                    optional
                    placeholder="Briefly introduce yourself (optional)"
                    wrapperClassName="sm:col-span-2"
                    error={errors.coverNote?.message}
                    {...register('coverNote')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
                >
                  <CapIcon size={16} />
                  {applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
                </button>
              </form>
            </RequireLogin>
          </FormCard>
        </div>
      </section>
    </>
  )
}
