import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { HeroSlider } from '@/components/sections/HeroSlider'
import { HomeAbout } from '@/components/sections/HomeAbout'
import { ServicesPreview } from '@/components/sections/ServicesPreview'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { CapIcon, PinIcon } from '@/components/icons'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>TeachingCareer | Connect Great Teachers with the Right Schools</title>
        <meta
          name="description"
          content="TeachingCareer connects schools with qualified teachers and helps candidates find teaching opportunities and home tutors."
        />
        <link rel="canonical" href="https://www.teachingcareer.pk/" />
      </Helmet>

      <section className="relative isolate overflow-hidden" aria-label="Introduction">
        <HeroSlider />

        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-mint/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-badge/25 blur-3xl" aria-hidden="true" />

        <div className="tc-container relative grid min-h-[540px] items-center py-16 lg:min-h-[640px] lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl min-w-0"
          >
            <span className="w-fit rounded-full border border-[#002A5D]/15 bg-white/50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#263746] backdrop-blur-sm">
              Connecting Potential to Opportunities
            </span>
            <h1 className="mt-6 text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-[1.08] text-[#002A5D]">
              Connecting Teachers With <span className="text-teal">Schools</span> Academies and Home Tutoring
            </h1>
            <p className="mt-5 max-w-xl text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-[#263746]">
              TeachingCareer helps schools find qualified teachers, helps candidates discover the right teaching
              opportunities, and helps parents connect with trusted, verified home tutors.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/candidate-registration" size="large" icon={<CapIcon size={16} />}>
                Register as a Candidate
              </Button>
              <Button to="/home-tutor" size="large" variant="outline" icon={<PinIcon size={16} />}>
                Find a Home Tutor
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      <HomeAbout />
      <ServicesPreview />
      <HowItWorks />
    </>
  )
}
