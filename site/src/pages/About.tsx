import { Helmet } from 'react-helmet-async'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { Button } from '@/components/ui/Button'
import { ChevronRightIcon } from '@/components/icons'

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us — TeachingCareer</title>
        <meta
          name="description"
          content="Learn about TeachingCareer's mission to connect schools, teachers, and parents across Pakistan."
        />
        <link rel="canonical" href="https://www.teachingcareer.pk/about" />
      </Helmet>

      <Breadcrumb items={[{ label: 'About' }]} />
      <PageHero eyebrow="About Us" title="Building the Future of Education, Together" />

      <section className="py-16">
        <div className="tc-container grid items-start gap-12 lg:grid-cols-2">
          <div className="relative grid grid-cols-2 gap-4">
            <img
              src="/assets/images/about-us-teacher.png"
              alt="A TeachingCareer verified teacher"
              loading="lazy"
              decoding="async"
              className="col-span-2 h-64 w-full rounded-3xl object-cover shadow-tc-lg"
            />
            <img
              src="/assets/images/about-us-handshake.png"
              alt="A school and TeachingCareer partnership"
              loading="lazy"
              decoding="async"
              className="h-40 w-full rounded-2xl object-cover shadow-tc"
            />
            <img
              src="/assets/images/about-us-laptop.png"
              alt="Managing a TeachingCareer profile online"
              loading="lazy"
              decoding="async"
              className="h-40 w-full rounded-2xl object-cover shadow-tc"
            />
          </div>

          <div className="flex flex-col gap-4">
            <p className="leading-relaxed text-body">
              TeachingCareer was founded to solve a simple but persistent problem: schools struggle to find
              qualified teachers, and qualified teachers struggle to find the right schools. We built a platform
              that brings both sides together, quickly and with confidence.
            </p>
            <p className="leading-relaxed text-body">
              Every candidate who registers with TeachingCareer has their qualifications and experience reviewed
              before their profile is presented to a school — so schools can trust who they&rsquo;re hiring, and
              candidates are represented fairly.
            </p>
            <p className="leading-relaxed text-body">
              We also support schools with recruitment from start to finish — from receiving applications to
              shortlisting verified candidates for interview — so hiring takes days, not months.
            </p>
            <p className="leading-relaxed text-body">
              Beyond classrooms, we help families find trusted home tutors for their children, with additional
              safety steps like police verification for anyone offering home tuition.
            </p>
            <p className="leading-relaxed text-body">
              Our team is based in Islamabad and works with schools, academies, and candidates across Pakistan,
              from Lahore and Karachi to Islamabad and beyond.
            </p>
            <p className="leading-relaxed text-body">
              Whether you&rsquo;re a school looking to hire, a teacher looking for your next opportunity, or a
              parent looking for a home tutor — TeachingCareer is built to help you find the right match.
            </p>
            <div>
              <Button to="/candidate-registration" icon={<ChevronRightIcon size={15} />} className="mt-2">
                Join Us in Our Mission
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
