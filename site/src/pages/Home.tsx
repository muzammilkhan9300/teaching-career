import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { HeroSliderBackground, type HeroSlideView } from '@/components/sections/HeroSlider'
import { HeroInfoCard } from '@/components/sections/HeroInfoCard'
import { HomeAbout } from '@/components/sections/HomeAbout'
import { ServicesPreview } from '@/components/sections/ServicesPreview'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { CapIcon, PinIcon } from '@/components/icons'
import { useHomepageContent } from '@/lib/queries'
import { useSlideshow } from '@/lib/useSlideshow'

// Shown until the admin-managed slides load, or if none are active — so the
// hero is never blank and still slides. These are the original three hero
// images; once any slide is active under Admin → Homepage → Hero Slider,
// those slides replace this list entirely.
const FALLBACK_SLIDES: HeroSlideView[] = [
  { image: '/assets/images/hero-annual-function.jpg', alt: 'School annual function', position: '12% 50%' },
  { image: '/assets/images/hero-group-study.jpg', alt: 'Teachers planning together', position: '50% 60%' },
  { image: '/assets/images/hero-graduation.jpg', alt: 'Graduates celebrating', position: '50% 50%' },
]

export default function Home() {
  const homepage = useHomepageContent()
  const dbSlides = homepage.data?.slides ?? []
  const slides: HeroSlideView[] = dbSlides.length > 0 ? dbSlides : FALLBACK_SLIDES
  const slideshow = useSlideshow(slides.length)

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
        <HeroSliderBackground slides={slides} index={slideshow.index} />

        <div className="tc-container relative grid min-h-[540px] items-center gap-10 py-12 lg:min-h-[640px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 lg:py-16 xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative isolate flex max-w-2xl min-w-0 flex-col"
          >
            {/* Mobile/tablet readability: a soft blurred white backdrop behind the
                text only (desktop uses the left-side gradient in HeroSliderBackground). */}
            <div
              className="pointer-events-none absolute -inset-x-5 -inset-y-6 -z-10 rounded-[2.5rem] bg-white/75 blur-2xl md:-inset-x-8 lg:hidden"
              aria-hidden="true"
            />
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
              <Button to="/home-tutor" size="large" variant="outline" icon={<PinIcon size={16} />} className="bg-white/70">
                Find a Home Tutor
              </Button>
            </div>
          </motion.div>

          {/* The card is vertically centred in the hero. The bottom margin equals
              the height the card gained (HeroInfoCard's panel: 268px -> 340px), which
              shifts it up by half that amount — so the extra height grows upward
              while its bottom edge stays where it was. Desktop only; on smaller
              screens the card simply stacks below the text. */}
          <div className="min-w-0 lg:mb-[72px]">
            <HeroInfoCard
              content={homepage.data}
              isPending={homepage.isPending}
              isError={homepage.isError}
              onRetry={() => void homepage.refetch()}
            />
          </div>
        </div>
      </section>
      <HomeAbout />
      <ServicesPreview />
      <HowItWorks />
    </>
  )
}
