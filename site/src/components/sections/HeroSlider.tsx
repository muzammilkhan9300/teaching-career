import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'

const SLIDES = [
  { src: '/assets/images/candidate-hero-teacher.jpg', alt: 'A qualified teacher ready for the classroom' },
  { src: '/assets/images/about-us-teacher.png', alt: 'A teacher connecting with students' },
  { src: '/assets/images/about-us-family.png', alt: 'A family supported by TeachingCareer' },
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
          className="h-full w-full object-cover"
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
