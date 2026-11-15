import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FormCard } from '@/components/ui/FormCard'
import { Button } from '@/components/ui/Button'
import { MERIT_NOTICE } from '@/components/sections/HeroInfoCard'
import { CalendarIcon, ChevronRightIcon, ClockIcon, InfoIcon, PinIcon } from '@/components/icons'
import { useSchoolRequirement } from '@/lib/queries'
import { ApiError } from '@/lib/api'
import { formatShortDate, isRecent } from '@/lib/dates'

export default function SchoolRequirementDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: req, isPending, isError, error, refetch } = useSchoolRequirement(id)

  if (isPending) {
    return (
      <section className="tc-container flex min-h-[50vh] items-center justify-center py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </section>
    )
  }

  if (isError && !(error instanceof ApiError && error.status === 404)) {
    return (
      <section className="tc-container flex flex-col items-center gap-4 py-24 text-center" role="alert">
        <h1 className="text-2xl font-extrabold text-navy">Requirement Could Not Be Loaded</h1>
        <p className="max-w-md text-body">Check your connection and try again.</p>
        <Button onClick={() => void refetch()}>Retry</Button>
      </section>
    )
  }

  if (!req) {
    return (
      <section className="tc-container flex flex-col items-center gap-4 py-24 text-center">
        <Helmet>
          <title>Requirement Not Available — TeachingCareer</title>
        </Helmet>
        <h1 className="text-2xl font-extrabold text-navy">Requirement Not Available</h1>
        <p className="max-w-md text-body">This requirement has closed or the link is incorrect.</p>
        <Button to="/school-requirements" icon={<ChevronRightIcon size={15} />}>
          View Current Requirements
        </Button>
      </section>
    )
  }

  const paragraphs = (req.detailedDescription || req.shortDescription).split(/\n\s*\n/).filter(Boolean)

  return (
    <>
      <Helmet>
        <title>{`${req.jobTitle} — ${req.schoolName} — TeachingCareer`}</title>
        <meta name="description" content={req.shortDescription} />
      </Helmet>

      <Breadcrumb items={[{ label: 'School Requirements', to: '/school-requirements' }, { label: req.jobTitle }]} />

      <section className="py-16">
        <div className="tc-container">
          <FormCard>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{req.jobTitle}</h1>
              {isRecent(req.publishedAt) ? <span className="rounded-full bg-teal px-2.5 py-0.5 text-xs font-bold text-white">New</span> : null}
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm font-semibold text-teal-deep">
              <span className="flex items-center gap-1.5">
                <PinIcon size={14} />
                {req.schoolName} · {req.city}
              </span>
              <span className="flex items-center gap-1.5 text-body">
                <CalendarIcon size={14} />
                Published {formatShortDate(req.publishedAt)}
              </span>
              {req.expiresAt ? (
                <span className="flex items-center gap-1.5 text-body">
                  <ClockIcon size={14} />
                  Open until {formatShortDate(req.expiresAt)}
                </span>
              ) : null}
            </p>

            <hr className="my-8 border-line" />

            <div className="flex flex-col gap-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line leading-relaxed text-body">
                  {p}
                </p>
              ))}
            </div>

            <hr className="my-8 border-line" />

            <div className="flex flex-col gap-4 rounded-2xl bg-mint/60 p-5">
              <p className="flex gap-3 text-sm leading-relaxed text-body">
                <InfoIcon size={18} className="mt-0.5 shrink-0 text-teal-deep" />
                {MERIT_NOTICE}
              </p>
              <p className="text-sm text-body">
                Not registered yet? Create your candidate profile so TeachingCareer can consider you for requirements like this one.
              </p>
              <div>
                <Button to="/candidate-registration" variant="outline" icon={<ChevronRightIcon size={15} />}>
                  Register as a Candidate
                </Button>
              </div>
            </div>
          </FormCard>
        </div>
      </section>
    </>
  )
}
