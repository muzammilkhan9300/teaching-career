import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'

const SLIDES: Array<{ src: string; alt: string; imageClassName?: string }> = [
  {
    src: '/assets/images/school-annual-function-teacher-giving-speech.png',
    alt: 'Teacher wearing a pink hijab giving a speech at a school annual function while teachers and administrators sit in a row on stage',
  },
  {
    src: '/assets/images/teachers-group-discussion-study-planning.png',
    alt: 'Pakistani teachers discussing study materials and planning together around a table outdoors',
  },
  {
    src: '/assets/images/graduates-celebrating-graduation-ceremony.png',
    alt: 'University graduates in black gowns and caps celebrating their graduation by throwing caps into the air',
  },
]

export function HeroSlider() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-tc-lg">
      <AnimatePresence mode="wait">
        <motion.img
          key={SLIDES[index].src}
          src={SLIDES[index].src}
          alt={SLIDES[index].alt}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className={clsx('h-full w-full object-cover object-center', SLIDES[index].imageClassName)}
        />
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
            className={clsx(
              'h-2.5 rounded-full transition-all',
              i === index ? 'w-7 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80',
            )}
          />
        ))}
      </div>
    </div>
  )
}
