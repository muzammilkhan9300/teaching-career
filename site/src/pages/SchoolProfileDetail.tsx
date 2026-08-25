import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FormCard } from '@/components/ui/FormCard'
import { Button } from '@/components/ui/Button'
import { useSchool } from '@/lib/queries'
import { CheckCircleIcon, ChevronRightIcon, PinIcon, ShieldIcon } from '@/components/icons'

export default function SchoolProfileDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: school, isPending } = useSchool(id)

  if (isPending) {
    return (
      <section className="tc-container flex min-h-[50vh] items-center justify-center py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </section>
    )
  }

  if (!school) {
    return (
      <section className="tc-container flex flex-col items-center gap-4 py-24 text-center">
        <Helmet>
          <title>School Not Found — TeachingCareer</title>
        </Helmet>
        <h1 className="text-2xl font-extrabold text-navy">School Not Available</h1>
        <p className="max-w-md text-body">This school profile isn&rsquo;t available, or the link may be incorrect.</p>
        <Button to="/school-profiles" icon={<ChevronRightIcon size={15} />}>
          Browse School Profiles
        </Button>
      </section>
    )
  }

  const activeVacancies = school.activeVacancies

  return (
    <>
      <Helmet>
        <title>{school.name} — School Profile — TeachingCareer</title>
        <meta name="description" content={`${school.name} in ${school.city}, registered on TeachingCareer.`} />
      </Helmet>

      <Breadcrumb items={[{ label: 'Profiles', to: '/school-profiles' }, { label: school.name }]} />

      <section className="py-16">
        <div className="tc-container">
          <FormCard>
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="h-28 w-40 shrink-0 overflow-hidden rounded-2xl bg-mint">
                <img src={school.photo} alt={school.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-extrabold text-navy">{school.name}</h1>
                  {school.registered ? (
                    <span className="flex items-center gap-1 rounded-full bg-badge px-3 py-1 text-xs font-bold text-teal-deep">
                      <CheckCircleIcon size={13} />
                      Registered
                    </span>
                  ) : null}
                </div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-teal-deep">
                  <PinIcon size={13} />
                  {school.city}, {school.area} &middot; {school.curriculum}
                </p>
              </div>
            </div>

            <hr className="my-8 border-line" />

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-body">About</p>
              <p className="leading-relaxed text-body">{school.about}</p>
            </div>

            <hr className="my-8 border-line" />

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-body">Active Vacancies</p>
              {activeVacancies.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {activeVacancies.map((v) => (
                    <Link
                      key={v.id}
                      to={`/vacancy/${v.id}`}
                      className="flex flex-col gap-1 rounded-2xl border border-line p-4 transition hover:border-teal hover:bg-mint/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-bold text-navy">{v.title}</span>
                      <span className="text-sm text-body">
                        {v.employmentType} &middot; {v.city}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-line p-5 text-sm text-body">
                  No active vacancies at this school right now.
                </p>
              )}
            </div>

            <hr className="my-8 border-line" />

            <div className="flex flex-col items-start gap-4 rounded-2xl bg-mint/50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-sm text-body">
                <ShieldIcon size={16} className="mt-0.5 shrink-0 text-teal-deep" />
                Apply directly to a vacancy above — TeachingCareer manages the introduction from there.
              </p>
            </div>
          </FormCard>
        </div>
      </section>
    </>
  )
}
