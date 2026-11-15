import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { MERIT_NOTICE } from '@/components/sections/HeroInfoCard'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { CalendarIcon, CapIcon, ChevronRightIcon, InfoIcon, PinIcon } from '@/components/icons'
import { useSchoolRequirements } from '@/lib/queries'
import { formatShortDate, isRecent } from '@/lib/dates'

export default function SchoolRequirements() {
  const { data: requirements, isPending, isError, refetch } = useSchoolRequirements()

  return (
    <>
      <Helmet>
        <title>School Requirements — TeachingCareer</title>
        <meta name="description" content="Current teaching requirements from schools working with TeachingCareer." />
      </Helmet>

      <Breadcrumb items={[{ label: 'School Requirements' }]} />
      <PageHero
        eyebrow="School Requirements"
        title="Current Teaching Requirements"
        text="Schools share their requirements with TeachingCareer, and we shortlist suitable candidates on merit."
      />

      <section className="py-16">
        <div className="tc-container flex flex-col gap-8">
          <p className="mx-auto flex max-w-3xl gap-3 rounded-2xl bg-mint/60 p-4 text-sm leading-relaxed text-body">
            <InfoIcon size={18} className="mt-0.5 shrink-0 text-teal-deep" />
            {MERIT_NOTICE}
          </p>

          {isError ? (
            <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-center">
              <p className="text-sm text-body">Requirements could not be loaded. Check your connection and try again.</p>
              <button type="button" onClick={() => void refetch()} className="rounded-full border-2 border-teal px-5 py-2 text-sm font-bold text-teal transition hover:bg-mint">
                Retry
              </button>
            </div>
          ) : isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : requirements.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-body">
              There are no open school requirements right now. Please check back soon.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {requirements.map((req) => (
                <article key={req.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6 shadow-tc">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-teal-deep">
                      <CapIcon size={20} />
                    </span>
                    {isRecent(req.publishedAt) ? (
                      <span className="rounded-full bg-teal px-2.5 py-0.5 text-xs font-bold text-white">New</span>
                    ) : null}
                  </div>
                  <h2 className="text-lg font-bold leading-snug text-navy">{req.jobTitle}</h2>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-teal-deep">
                    <PinIcon size={13} />
                    {req.schoolName} · {req.city}
                  </p>
                  <p className="text-sm leading-relaxed text-body">{req.shortDescription}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <span className="flex items-center gap-1 text-xs text-body">
                      <CalendarIcon size={13} />
                      {formatShortDate(req.publishedAt)}
                    </span>
                    <Link to={`/school-requirements/${req.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-teal-deep hover:underline">
                      View Details <ChevronRightIcon size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
