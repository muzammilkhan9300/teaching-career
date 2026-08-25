import { CapIcon, PersonIcon, ShieldIcon } from '@/components/icons'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { ComponentType } from 'react'
import type { IconProps } from '@/components/icons'

interface Persona {
  title: string
  icon: ComponentType<IconProps>
  intro: string
  steps: { title: string; text: string }[]
}

const PERSONAS: Persona[] = [
  {
    title: 'For Schools',
    icon: ShieldIcon,
    intro: 'Register your school and get matched with verified, qualified teachers in days, not weeks.',
    steps: [
      { title: 'Register Your School', text: 'Create a free school profile with your curriculum and contact details.' },
      { title: 'Post a Vacancy', text: 'Share the subject, qualification, and experience level you need.' },
      { title: 'Get Matched', text: 'We review and shortlist verified candidates who fit your requirements.' },
      { title: 'Hire with Confidence', text: 'Interview shortlisted teachers and hire directly through TeachingCareer.' },
    ],
  },
  {
    title: 'For Candidates',
    icon: CapIcon,
    intro: 'Register once and get discovered by schools and academies looking for your subject expertise.',
    steps: [
      { title: 'Create Your Profile', text: 'Register with your qualification, experience, and teaching preferences.' },
      { title: 'Get Verified', text: 'We review your documents to confirm your qualifications and experience.' },
      { title: 'Browse Opportunities', text: 'Explore open vacancies that match your subject and location.' },
      { title: 'Start Teaching', text: 'Connect with schools directly and begin your next teaching role.' },
    ],
  },
  {
    title: 'For Parents',
    icon: PersonIcon,
    intro: 'Find a trusted, verified home tutor for your child in just a few simple steps.',
    steps: [
      { title: 'Share Requirements', text: 'Tell us the subject, class level, and schedule you need.' },
      { title: 'Review Matches', text: 'We suggest suitable tutors based on your requirements and location.' },
      { title: 'Verify & Connect', text: 'Tutors offering home tuition provide police verification for your safety.' },
      { title: 'Begin Lessons', text: 'Confirm the schedule and start lessons with your matched tutor.' },
    ],
  },
]

export function HowItWorks() {
  return (
    <section className="bg-mint/40 py-20" aria-label="How TeachingCareer Works">
      <div className="tc-container flex flex-col gap-14">
        <SectionHeading eyebrow="The Process" title="How TeachingCareer Works" align="center" className="mx-auto" />

        <div className="flex flex-col gap-14">
          {PERSONAS.map((persona) => (
            <div key={persona.title} className="flex flex-col gap-6 lg:flex-row lg:gap-10">
              <div className="flex shrink-0 items-start gap-4 lg:w-64 lg:flex-col">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal text-white shadow-tc">
                  <persona.icon size={26} />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-navy">{persona.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-body">{persona.intro}</p>
                </div>
              </div>

              <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {persona.steps.map((step, i) => (
                  <div key={step.title} className="relative rounded-2xl border border-line bg-white p-5 shadow-tc">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-sm font-extrabold text-teal-deep">
                      {i + 1}
                    </span>
                    <h4 className="mt-3 text-sm font-bold text-navy">{step.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-body">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
