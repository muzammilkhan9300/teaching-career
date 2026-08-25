import { Button } from '@/components/ui/Button'
import { ChevronRightIcon } from '@/components/icons'

export function HomeAbout() {
  return (
    <section className="bg-mint/40 py-20" id="about" aria-label="About TeachingCareer">
      <div className="tc-container grid items-center gap-12 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <img
            src="/assets/images/About1.jpg"
            alt="TeachingCareer team supporting schools and teachers"
            loading="lazy"
            decoding="async"
            className="col-span-2 h-64 w-full rounded-3xl object-cover shadow-tc-lg"
          />
          <img
            src="/assets/images/school-placeholder-1.jpg"
            alt="A partner school campus"
            loading="lazy"
            decoding="async"
            className="h-40 w-full rounded-2xl object-cover shadow-tc"
          />
          <img
            src="/assets/images/aboutlibraryimage.jpg"
            alt="A school library resource"
            loading="lazy"
            decoding="async"
            className="h-40 w-full rounded-2xl object-cover shadow-tc"
          />
        </div>

        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full bg-badge px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-deep">
            About TeachingCareer
          </span>
          <h2 className="text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
            Connecting Talent. Building Futures.
          </h2>
          <p className="leading-relaxed text-body">
            TeachingCareer was built to close the gap between schools searching for qualified teachers and
            candidates searching for the right opportunity.
          </p>
          <p className="leading-relaxed text-body">
            We verify every candidate&rsquo;s qualifications and experience before presenting their profile, so
            schools can hire with confidence and teachers can be discovered on merit.
          </p>
          <p className="leading-relaxed text-body">
            Beyond schools and academies, we also help parents find trusted, verified home tutors for their
            children — with safety measures like police verification for home tuition roles.
          </p>
          <div>
            <Button to="/about" icon={<ChevronRightIcon size={15} />} className="mt-2">
              More About Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
