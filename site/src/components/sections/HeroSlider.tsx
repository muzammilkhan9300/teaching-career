import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SLIDES = [
  {
    src: '/assets/images/hero-annual-function.jpg',
    alt: 'Teacher wearing a pink hijab giving a speech at a school annual function while teachers and administrators sit in a row on stage',
    // The speaker stands at the far left, so bias the 4:3 crop left to keep her in frame.
    imageClassName: 'object-[12%_50%]',
  },
  {
    src: '/assets/images/hero-group-study.jpg',
    alt: 'Pakistani teachers discussing study materials and planning together around a table outdoors',
    // Portrait photo: crop low enough to keep the table and flag along with the faces.
    imageClassName: 'object-[50%_60%]',
  },
  {
    src: '/assets/images/hero-graduation.jpg',
    alt: 'University graduates in black gowns and caps celebrating their graduation by throwing caps into the air',
  },
] as const

export function HeroSlider() {
  const [index, setIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateMotionPreference = () => setReduceMotion(mediaQuery.matches)
    updateMotionPreference()

    mediaQuery.addEventListener('change', updateMotionPreference)

    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [reduceMotion])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={SLIDES[index].src}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${SLIDES[index].src})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
          aria-label={SLIDES[index].alt}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/65 to-white/30" />
    </div>
  )
}
