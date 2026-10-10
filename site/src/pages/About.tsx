import { Helmet } from 'react-helmet-async'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { Button } from '@/components/ui/Button'
import { ChevronRightIcon } from '@/components/icons'

export default function About() {
  return (
    <>
      <Helmet>
        <title>About TeachingCareer | Teacher Recruitment & Home Tutors</title>
        <meta
          name="description"
          content="Learn about TeachingCareer, a platform connecting private schools and academies with qualified teachers and helping families find suitable home tutors across Pakistan."
        />
        <link rel="canonical" href="https://www.teachingcareer.site/about" />
      </Helmet>

      <Breadcrumb items={[{ label: 'About' }]} />
      <PageHero eyebrow="About Us" title="Connecting Schools, Teachers, and Families Across Pakistan" />

      <section className="py-16">
        <div className="tc-container grid items-start gap-12 lg:grid-cols-2">
          <div className="relative grid grid-cols-2 gap-4">
            <img
              src="/assets/images/teachingcareer-modern-classroom.png"
              alt="Teacher teaching students in a modern classroom in Pakistan"
              loading="lazy"
              decoding="async"
              className="col-span-2 h-64 w-full rounded-3xl object-cover shadow-tc-lg"
            />
            <img
              src="/assets/images/search-teachingcareer-site-google.png"
              alt="Google search for TeachingCareer.site on a laptop"
              loading="lazy"
              decoding="async"
              className="h-40 w-full rounded-2xl object-cover shadow-tc"
            />
            <img
              src="/assets/images/teacher-career-opportunity-pakistan.png"
              alt="TeachingCareer platform connecting schools with teachers"
              loading="lazy"
              decoding="async"
              className="h-40 w-full rounded-2xl object-cover shadow-tc"
            />
            <img
              src="/assets/images/private-school-teacher-interview-candidates.png"
              alt="Teaching candidates waiting for interviews at a private school"
              loading="lazy"
              decoding="async"
              className="h-40 w-full rounded-2xl object-cover shadow-tc"
            />
            <img
              src="/assets/images/teachingcareer-teacher-job-interview.png"
              alt="Teacher candidate attending a job interview with school interviewers in Pakistan"
              loading="lazy"
              decoding="async"
              className="h-40 w-full rounded-2xl object-cover shadow-tc"
            />
             <img
              src="/assets/images/teacher-selection-celebration-private-school.png"
              alt="Teaching candidate celebrating her selection as a teacher at a private school"
              loading="lazy"
              decoding="async"
              className="h-40 w-full rounded-2xl object-cover shadow-tc"
            />
             <img
              src="/assets/images/teacher-teaching-student-classroom.png"
              alt="Teacher in a cream hijab teaching English to a student in a school classroom"
              loading="lazy"
              decoding="async"
              className="h-40 w-full rounded-2xl object-cover shadow-tc"
            />
          </div>

          <div className="flex flex-col gap-4">
            <p className="leading-relaxed text-body">
              TeachingCareer is a teacher recruitment and education platform in Pakistan that connects private
              schools and academies with qualified teachers and teaching candidates. We also help parents find
              suitable home tutors for their children. Our goal is to make it easier for schools, teachers, and
              families to find the right educational match.
            </p>
            <p className="leading-relaxed text-body">
              TeachingCareer reviews the qualifications and teaching experience of registered candidates before
              presenting suitable profiles to schools. This verification process helps schools identify qualified
              teaching candidates and gives candidates a fair opportunity to be considered for relevant teaching
              positions.
            </p>
            <p className="leading-relaxed text-body">
              We support private schools and academies throughout the teacher recruitment process, from receiving
              hiring requirements and identifying suitable candidates to shortlisting verified teachers for
              interviews. Schools can find candidates based on factors such as location, subject, teaching
              experience, qualification, and other requirements.
            </p>
            <p className="leading-relaxed text-body">
              TeachingCareer also helps parents find suitable home tutors in Pakistan. Parents can share
              requirements such as the subject, location, class level, and other preferences, and we help them
              find a suitable teaching candidate. Home-tutor candidates are also required to provide police
              verification as an additional safety step.
            </p>
            <p className="leading-relaxed text-body">
              Based in Islamabad, TeachingCareer works with schools, academies, teachers, teaching candidates,
              and families across Pakistan, including Islamabad, Lahore, Karachi, and other cities.
            </p>
            <p className="leading-relaxed text-body">
              Whether you are a school or academy looking to hire a qualified teacher, a teacher seeking a
              teaching opportunity, or a parent looking for a suitable home tutor, TeachingCareer helps connect
              you with the right educational opportunities and candidates.
            </p>
            <div>
              <Button to="/candidate-registration" icon={<ChevronRightIcon size={15} />} className="mt-2">
                Join TeachingCareer Today
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}