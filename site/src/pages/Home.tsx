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

      <section className="relative overflow-hidden" aria-label="Introduction">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-mint blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-badge blur-3xl" aria-hidden="true" />

        <div className="tc-container relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <span className="w-fit rounded-full bg-badge px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-deep">
              Connecting Potential to Opportunities
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-navy sm:text-5xl">
              Connecting Great <span className="text-teal">Teachers</span> with the Right Schools
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-body">
              TeachingCareer helps schools find qualified teachers, helps candidates discover the right teaching
              opportunities, and helps parents connect with trusted, verified home tutors.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button to="/candidate-registration" icon={<CapIcon size={16} />}>
                Register as a Candidate
              </Button>
              <Button to="/home-tutor" variant="outline" icon={<PinIcon size={16} />}>
                Find a Home Tutor
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <HeroSlider />
          </motion.div>
        </div>
      </section>

      <HomeAbout />
      <ServicesPreview />
      <HowItWorks />
    </>
  )
}
