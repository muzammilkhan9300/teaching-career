import { useRef, useState, type ComponentType, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  BellIcon,
  BriefcaseIcon,
  CalendarIcon,
  CapIcon,
  ChevronRightIcon,
  InfoIcon,
  PinIcon,
  PlayIcon,
  SparklesIcon,
  type IconProps,
} from '@/components/icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { ContentLink } from '@/lib/contentLinks'
import { formatShortDate, isRecent } from '@/lib/dates'
import { youTubeThumbnailUrl } from '@/lib/youtube'
import type { HomepageContent, HomepageVideo } from '@/types'
import { VideoModal } from './VideoModal'

export const MERIT_NOTICE =
  'TeachingCareer shortlists candidates based on merit and school requirements. Shortlisted candidates will be contacted by TeachingCareer for further tests or interviews. No direct application is required.'

type TabKey = 'requirements' | 'services' | 'updates'

// Tab order as shown; the first tab (New Services) is active on load.
const TABS: { key: TabKey; label: string; icon: ComponentType<IconProps> }[] = [
  { key: 'services', label: 'New Services', icon: SparklesIcon },
  { key: 'updates', label: 'Latest Updates', icon: BellIcon },
  { key: 'requirements', label: 'School Requirements', icon: BriefcaseIcon },
]

/** How many items each tab shows — the box is intentionally compact; "All …" links lead to the full lists. */
const MAX_REQUIREMENTS = 2

interface HeroInfoCardProps {
  content: HomepageContent | undefined
  isPending: boolean
  isError: boolean
  onRetry: () => void
}

function NewBadge() {
  return <span className="w-fit shrink-0 rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">New</span>
}

function PanelHeading({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-extrabold text-navy">{title}</h3>
      <Link to={linkTo} className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-teal-deep hover:underline">
        {linkLabel} <ChevronRightIcon size={13} />
      </Link>
    </div>
  )
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-body">
      {children}
    </p>
  )
}

function LoadingPanel() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading">
      <Skeleton className="h-4 w-1/2" />
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Skeleton className="h-44 w-full rounded-2xl sm:h-[250px]" />
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="mt-2 h-8 w-28 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function RequirementsPanel({ content }: { content: HomepageContent }) {
  const items = content.requirements.slice(0, MAX_REQUIREMENTS)
  return (
    <div className="flex h-full flex-col">
      <PanelHeading title="Latest Requirements" linkTo="/school-requirements" linkLabel="All Requirements" />
      {items.length === 0 ? (
        <EmptyState>No open school requirements right now. Please check back soon.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((req) => (
            <li key={req.id}>
              <Link
                to={`/school-requirements/${req.id}`}
                className="group flex items-center gap-3.5 rounded-2xl border border-line bg-white px-4 py-3.5 transition hover:border-teal/60 hover:bg-mint/30"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint text-teal-deep">
                  <CapIcon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="line-clamp-2 text-[15px] font-bold leading-snug text-navy group-hover:text-teal-deep sm:line-clamp-1">{req.jobTitle}</span>
                    {isRecent(req.publishedAt) ? <NewBadge /> : null}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-body">
                    <PinIcon size={11} className="shrink-0 text-teal-deep" />
                    <span className="truncate">
                      {req.schoolName} · {req.city}
                    </span>
                  </span>
                </span>
                <ChevronRightIcon size={16} className="shrink-0 text-body/50 transition group-hover:text-teal-deep" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-auto flex gap-2 rounded-xl bg-mint/60 px-3.5 py-2.5 text-xs leading-snug text-body">
        <InfoIcon size={14} className="mt-px shrink-0 text-teal-deep" />
        {MERIT_NOTICE}
      </p>
    </div>
  )
}

/** One featured item (service or update): a large image beside its text. */
function FeaturedItem({
  image,
  fallbackIcon: FallbackIcon,
  title,
  badge,
  meta,
  description,
  actions,
  onPlay,
  playLabel,
}: {
  image: string
  fallbackIcon: ComponentType<IconProps>
  title: string
  badge?: boolean
  meta?: ReactNode
  description: string
  actions: ReactNode
  /** When set, the image becomes a play button that opens the associated YouTube video. */
  onPlay?: () => void
  playLabel?: string
}) {
  // Large, fixed-height image (not aspect ratio) so the item always fits the
  // fixed-height box, whatever the card's width.
  const mediaClasses = 'relative block h-44 w-full overflow-hidden rounded-2xl bg-mint shadow-tc sm:h-[250px]'
  const media = image ? (
    <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
  ) : (
    <span className="flex h-full w-full items-center justify-center text-teal-deep">
      <FallbackIcon size={48} />
    </span>
  )

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {onPlay ? (
        <button type="button" onClick={onPlay} aria-label={playLabel} className={`group cursor-pointer ${mediaClasses}`}>
          {media}
          {/* Subtle dark overlay + a YouTube-style red play button, centred on the
              image (inset-0 + flex centring, so it stays centred at any size). */}
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors duration-200 group-hover:bg-black/35">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF0000] text-white shadow-lg ring-4 ring-white/25 transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110">
              <PlayIcon size={28} className="ml-1 fill-current" aria-hidden="true" />
            </span>
          </span>
        </button>
      ) : (
        <div className={mediaClasses}>{media}</div>
      )}
      <div className="flex min-w-0 flex-col gap-2.5">
        {badge ? <NewBadge /> : null}
        <p className="line-clamp-2 text-lg font-extrabold leading-tight text-navy sm:line-clamp-3 sm:text-[22px]">{title}</p>
        {meta}
        <p className="line-clamp-2 text-sm leading-relaxed text-body sm:line-clamp-3">{description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">{actions}</div>
      </div>
    </div>
  )
}

const primaryAction =
  'inline-flex items-center gap-1 rounded-full border-2 border-teal px-4 py-1.5 text-xs font-bold text-teal transition hover:bg-mint'

function ServicesPanel({ content }: { content: HomepageContent }) {
  const [playing, setPlaying] = useState<HomepageVideo | null>(null)
  const service = content.services[0]
  const video = content.videos[0]

  return (
    <div className="flex h-full flex-col">
      <PanelHeading title="Our New Service" linkTo="/services" linkLabel="All Services" />
      {!service ? (
        <EmptyState>New services will appear here soon.</EmptyState>
      ) : (
        <FeaturedItem
          // No service image? Fall back to the video's YouTube thumbnail.
          image={service.image || (video ? youTubeThumbnailUrl(video.youtubeId) : '')}
          fallbackIcon={SparklesIcon}
          title={service.title}
          // Only services the admin flagged as new get the badge (the API
          // falls back to a regular published service when none are flagged).
          badge={service.showAsNew}
          description={service.description}
          // The featured video from the TeachingCareer YouTube channel (Admin →
          // YouTube Videos) plays from a play button centred on the image.
          onPlay={video ? () => setPlaying(video) : undefined}
          playLabel={video ? `Play video: ${video.title}` : undefined}
          actions={
            <ContentLink href={service.learnMoreUrl || '/services'} className={primaryAction}>
              Learn More <ChevronRightIcon size={13} />
            </ContentLink>
          }
        />
      )}
      {playing ? <VideoModal videoId={playing.youtubeId} title={playing.title} onClose={() => setPlaying(null)} /> : null}
    </div>
  )
}

function UpdatesPanel({ content }: { content: HomepageContent }) {
  const update = content.updates[0]
  return (
    <div className="flex h-full flex-col">
      <PanelHeading title="Latest Update" linkTo="/updates" linkLabel="All Updates" />
      {!update ? (
        <EmptyState>No updates yet. News and announcements will appear here.</EmptyState>
      ) : (
        <FeaturedItem
          image={update.image}
          fallbackIcon={BellIcon}
          title={update.title}
          badge={isRecent(update.publishedAt)}
          meta={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-body/80">
              <CalendarIcon size={12} />
              <time dateTime={update.publishedAt}>{formatShortDate(update.publishedAt)}</time>
            </span>
          }
          description={update.description}
          actions={
            <ContentLink href={update.readMoreUrl || '/updates'} className={primaryAction}>
              Read More <ChevronRightIcon size={13} />
            </ContentLink>
          }
        />
      )}
    </div>
  )
}

/** The hero's right-hand white card: three compact tabs fed from /api/homepage. */
export function HeroInfoCard({ content, isPending, isError, onRetry }: HeroInfoCardProps) {
  const [active, setActive] = useState<TabKey>(TABS[0].key)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const nextIndex = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    setActive(TABS[nextIndex].key)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-tc-lg">
      <div role="tablist" aria-label="Homepage information" className="grid grid-cols-3 gap-1 border-b border-line bg-mint/50 p-1.5">
        {TABS.map((tab, i) => {
          const selected = tab.key === active
          return (
            <button
              key={tab.key}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`hero-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`hero-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.key)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center text-[11px] font-bold leading-tight transition sm:flex-row sm:gap-1.5 sm:text-xs',
                selected ? 'bg-teal text-white shadow-tc' : 'text-navy hover:bg-white',
              )}
            >
              <tab.icon size={15} className="shrink-0" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Fixed height from sm up so switching tabs never changes the box size;
          each panel's content is sized/clamped to fit, so nothing scrolls. */}
      <div
        role="tabpanel"
        id={`hero-panel-${active}`}
        aria-labelledby={`hero-tab-${active}`}
        className="flex h-[456px] flex-col overflow-hidden p-4 sm:h-[340px] sm:p-5"
      >
        {isPending ? (
          <LoadingPanel />
        ) : isError || !content ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center" role="alert">
            <p className="text-sm text-body">This information couldn&rsquo;t be loaded right now.</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full border-2 border-teal px-5 py-2 text-sm font-bold text-teal transition hover:bg-mint"
            >
              Try Again
            </button>
          </div>
        ) : active === 'requirements' ? (
          <RequirementsPanel content={content} />
        ) : active === 'services' ? (
          <ServicesPanel content={content} />
        ) : (
          <UpdatesPanel content={content} />
        )}
      </div>
    </div>
  )
}
