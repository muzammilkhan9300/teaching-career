import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import {
  CapIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  PersonIcon,
  PinIcon,
  ShieldIcon,
  type IconProps,
} from '@/components/icons'

const SERVICES: { icon: ComponentType<IconProps>; title: string; text: string }[] = [
  {
    icon: CapIcon,
    title: 'Teacher Placement for Private Schools',
    text: 'End-to-end recruitment support to help private schools find and hire qualified teachers.',
  },
  {
    icon: PersonIcon,
    title: 'Teaching Opportunities for Candidates',
    text: 'Access to genuine, relevant teaching roles matched to your subject and experience.',
  },
  {
    icon: PinIcon,
    title: 'Home Tuition Services',
    text: 'Parents are matched with verified home tutors suited to their child’s subject and schedule.',
  },
  {
    icon: CheckCircleIcon,
    title: 'Candidate Verification',
    text: 'Qualification documents and experience are reviewed before a profile is shared with a school.',
  },
  {
    icon: ShieldIcon,
    title: 'School Recruitment Support',
    text: 'From vacancy posting to shortlisting, we support schools through the entire hiring process.',
  },
  {
    icon: ChevronRightIcon,
    title: 'Trusted Education Connections',
    text: 'A dependable network connecting schools, teachers, and parents across Pakistan.',
  },
]

export default function Services() {
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
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6 shadow-tc transition hover:-translate-y-1 hover:shadow-tc-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-teal-deep">
                <service.icon size={22} />
              </span>
              <h3 className="text-base font-bold text-navy">{service.title}</h3>
              <p className="text-sm leading-relaxed text-body">{service.text}</p>
              <Link
                to="/contact"
                className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-teal-deep hover:gap-2 transition-all"
              >
                Learn More
                <ChevronRightIcon size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
