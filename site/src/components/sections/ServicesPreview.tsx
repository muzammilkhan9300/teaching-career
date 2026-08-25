import type { ComponentType } from 'react'
import { CapIcon, CheckCircleIcon, ClockIcon, PersonIcon, PinIcon, ShieldIcon, type IconProps } from '@/components/icons'
import { SectionHeading } from '@/components/ui/SectionHeading'

const SERVICES: { icon: ComponentType<IconProps>; title: string; text: string }[] = [
  {
    icon: CapIcon,
    title: 'Teacher Recruitment for Schools',
    text: 'We help schools find qualified, verified teachers matched to their curriculum and requirements.',
  },
  {
    icon: PersonIcon,
    title: 'Teaching Opportunities for Candidates',
    text: 'Candidates get access to relevant teaching roles at schools and academies across Pakistan.',
  },
  {
    icon: CheckCircleIcon,
    title: 'Verified Teacher Profiles',
    text: 'Every candidate profile is reviewed so schools can hire with confidence.',
  },
  {
    icon: PinIcon,
    title: 'Home Tuition Services',
    text: 'Parents can request verified home tutors matched to their child’s subject and schedule.',
  },
  {
    icon: ClockIcon,
    title: 'Teacher & Candidate Matching',
    text: 'Our team matches the right candidates to the right opportunities, quickly and accurately.',
  },
  {
    icon: ShieldIcon,
    title: 'Teacher Verification & Screening',
    text: 'Qualification documents and experience are reviewed before a candidate is presented to a school.',
  },
]

export function ServicesPreview() {
  return (
    <section className="py-20" aria-label="Our Services">
      <div className="tc-container flex flex-col gap-12">
        <SectionHeading eyebrow="What We Offer" title="Services Built for Every Side of Education" align="center" className="mx-auto" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div key={service.title} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6 shadow-tc transition hover:-translate-y-1 hover:shadow-tc-lg">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-teal-deep">
                <service.icon size={22} />
              </span>
              <h3 className="text-base font-bold text-navy">{service.title}</h3>
              <p className="text-sm leading-relaxed text-body">{service.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
