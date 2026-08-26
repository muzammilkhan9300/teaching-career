import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useServices } from '@/lib/queries'
import {
  CapIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  BookIcon,
  PersonIcon,
  PinIcon,
  ShieldIcon,
  ClockIcon,
  type IconProps,
} from '@/components/icons'
import type { Service } from '@/types'

const SERVICE_ICONS: Record<Service['icon'], ComponentType<IconProps>> = {
  cap: CapIcon,
  person: PersonIcon,
  pin: PinIcon,
  check: CheckCircleIcon,
  shield: ShieldIcon,
  clock: ClockIcon,
  book: BookIcon,
}

export default function Services() {
  const { data: services, isPending } = useServices()

  return (
    <>
      <Helmet>
        <title>Services — TeachingCareer</title>
        <meta
          name="description"
          content="Explore TeachingCareer's services for schools, teaching candidates, and parents looking for home tutors."
        />
        <link rel="canonical" href="https://www.teachingcareer.pk/services" />
      </Helmet>

      <Breadcrumb items={[{ label: 'Services' }]} />
      <PageHero
        eyebrow="Our Services"
        title="Everything You Need, in One Place"
        text="From school recruitment to candidate verification and home tuition matching — TeachingCareer supports every side of education."
      />

      <section className="py-16">
        <div className="tc-container grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : services?.map((service) => {
                const Icon = SERVICE_ICONS[service.icon] ?? ShieldIcon
                return (
                  <div
                    key={service.id}
                    className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6 shadow-tc transition hover:-translate-y-1 hover:shadow-tc-lg"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-teal-deep">
                      <Icon size={22} />
                    </span>
                    <h3 className="text-base font-bold text-navy">{service.title}</h3>
                    <p className="text-sm leading-relaxed text-body">{service.description}</p>
                    <Link
                      to="/contact"
                      className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-teal-deep hover:gap-2 transition-all"
                    >
                      Learn More
                      <ChevronRightIcon size={14} />
                    </Link>
                  </div>
                )
              })}
        </div>
      </section>
    </>
  )
}
