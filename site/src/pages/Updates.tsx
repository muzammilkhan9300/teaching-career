import { Helmet } from 'react-helmet-async'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { BellIcon, CalendarIcon, ChevronRightIcon } from '@/components/icons'
import { useHomepageUpdates } from '@/lib/queries'
import { ContentLink } from '@/lib/contentLinks'
import { formatShortDate, isRecent } from '@/lib/dates'

/** "All Updates" — every published update from Admin → Homepage → Latest Updates. */
export default function Updates() {
  const { data: updates, isPending, isError, refetch } = useHomepageUpdates()

  return (
    <>
      <Helmet>
        <title>Latest Updates — TeachingCareer</title>
        <meta name="description" content="News, announcements and newly registered schools on TeachingCareer." />
      </Helmet>

      <Breadcrumb items={[{ label: 'Latest Updates' }]} />
      <PageHero
        eyebrow="Latest Updates"
        title="News & Announcements"
        text="Newly registered schools and academies, education partners, and the latest TeachingCareer news."
      />

      <section className="py-16">
        <div className="tc-container">
          {isError ? (
            <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-center">
              <p className="text-sm text-body">Updates could not be loaded. Check your connection and try again.</p>
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
          ) : updates.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-body">No updates yet. Please check back soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {updates.map((update) => (
                <article key={update.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-tc">
                  <div className="aspect-[16/9] w-full bg-mint">
                    {update.image ? (
                      <img src={update.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-teal-deep">
                        <BellIcon size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs font-semibold text-body">
                        <CalendarIcon size={13} />
                        <time dateTime={update.publishedAt}>{formatShortDate(update.publishedAt)}</time>
                      </span>
                      {isRecent(update.publishedAt) ? (
                        <span className="rounded-full bg-teal px-2.5 py-0.5 text-[11px] font-bold text-white">New</span>
                      ) : null}
                    </div>
                    <h2 className="text-lg font-bold leading-snug text-navy">{update.title}</h2>
                    <p className="text-sm leading-relaxed text-body">{update.description}</p>
                    {update.readMoreUrl ? (
                      <ContentLink href={update.readMoreUrl} className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-bold text-teal-deep hover:underline">
                        Read More <ChevronRightIcon size={14} />
                      </ContentLink>
                    ) : null}
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
