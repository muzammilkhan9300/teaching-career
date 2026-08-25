import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { CheckCircleIcon, ChevronRightIcon } from '@/components/icons'
import type { SuccessType } from '@/types'

interface SuccessContent {
  heading: string
  text: string
  primary: { label: string; to: string }
  secondary: { label: string; to: string }
}

const CONTENT: Record<SuccessType, SuccessContent> = {
  candidate: {
    heading: 'Thank You!',
    text: 'Thank you for registering with TeachingCareer. Our team will review your profile and reach out once a suitable opportunity is available.',
    primary: { label: 'Back to Home', to: '/' },
    secondary: { label: 'Browse Candidates', to: '/candidate-profiles' },
  },
  school: {
    heading: 'Thank You!',
    text: 'Thank you for registering your school. Our team will review your details and get in touch to help you find the right candidates.',
    primary: { label: 'Back to Home', to: '/' },
    secondary: { label: 'Browse Candidates', to: '/candidate-profiles' },
  },
  'home-tutor': {
    heading: 'Thank You!',
    text: 'Thank you for your request. Our team will review your requirements and reach out with suitable home tutor matches.',
    primary: { label: 'Back to Home', to: '/' },
    secondary: { label: 'Browse Candidates', to: '/candidate-profiles' },
  },
  application: {
    heading: 'Application Sent!',
    text: 'Your application has been submitted. The school will review your profile and TeachingCareer will follow up if you are shortlisted.',
    primary: { label: 'Browse More Vacancies', to: '/school-profiles' },
    secondary: { label: 'Back to Home', to: '/' },
  },
}

const DEFAULT_CONTENT: SuccessContent = {
  heading: 'Thank You!',
  text: 'Your submission has been received. Our team will be in touch shortly.',
  primary: { label: 'Back to Home', to: '/' },
  secondary: { label: 'Browse Candidates', to: '/candidate-profiles' },
}

export default function RegistrationSuccess() {
  const [params] = useSearchParams()
  const type = params.get('type') as SuccessType | null
  const content = (type && CONTENT[type]) || DEFAULT_CONTENT

  return (
    <>
      <Helmet>
        <title>{content.heading} — TeachingCareer</title>
      </Helmet>

      <section className="relative overflow-hidden bg-mint/40 py-24">
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-badge blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-mint-2 blur-3xl" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="tc-container relative flex flex-col items-center gap-4 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal text-white shadow-tc-lg">
            <CheckCircleIcon size={32} />
          </span>
          <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">{content.heading}</h1>
          <p className="max-w-lg text-base leading-relaxed text-body">{content.text}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button to={content.primary.to} icon={<ChevronRightIcon size={15} />}>
              {content.primary.label}
            </Button>
            <Button to={content.secondary.to} variant="outline">
              {content.secondary.label}
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  )
}
