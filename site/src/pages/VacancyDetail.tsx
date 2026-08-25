import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FormCard } from '@/components/ui/FormCard'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { vacancies } from '@/data/vacancies'
import { DEMO_STORAGE_KEYS, saveDemoRecord } from '@/lib/demoStorage'
import { CapIcon, ChevronRightIcon, ClockIcon, PinIcon } from '@/components/icons'

const DETAIL_ROWS: { label: string; key: keyof (typeof vacancies)[number] }[] = [
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
  const vacancy = vacancies.find((v) => v.id === id)

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

  function handleApply() {
    if (!vacancy) return
    saveDemoRecord(DEMO_STORAGE_KEYS.vacancyApplications, {
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.title,
      schoolId: vacancy.schoolId,
      applicationDate: new Date().toISOString(),
      applicationStatus: 'Applied',
    })
    showToast({ variant: 'success', title: 'Application sent', description: `You applied to ${vacancy.title}.` })
    navigate('/registration-success?type=application')
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

            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark"
            >
              <CapIcon size={16} />
              Apply for This Vacancy
            </button>
          </FormCard>
        </div>
      </section>
    </>
  )
}
