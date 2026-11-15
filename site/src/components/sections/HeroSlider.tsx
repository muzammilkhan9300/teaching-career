import clsx from 'clsx'

export interface HeroSlideView {
  image: string
  alt: string
  /** CSS object-position, e.g. "12% 50%" — keeps the subject in frame. */
  position: string
}

/**
 * The hero's background: every slide is stacked and cross-faded with CSS
 * opacity (so all images are already loaded when their turn comes). Purely
 * decorative — the hero's text carries the meaning — so it's hidden from
 * assistive tech. It advances automatically (see useSlideshow); there are
 * deliberately no visible slider controls.
 */
export function HeroSliderBackground({ slides, index }: { slides: HeroSlideView[]; index: number }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-mint" aria-hidden="true">
      {slides.map((slide, i) => (
        <img
          key={`${slide.image}-${i}`}
          src={slide.image}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className={clsx(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out motion-reduce:transition-none',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
          style={{ objectPosition: slide.position || '50% 50%' }}
        />
      ))}
      {/* Desktop readability gradient: covers only the left text column and
          fades out before the info box, so the right side of the photo stays
          clear. On smaller screens the text gets its own soft backdrop
          instead (see Home.tsx), since it sits above the stacked box. */}
      <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-[linear-gradient(to_right,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.82)_50%,rgba(255,255,255,0.45)_80%,rgba(255,255,255,0)_100%)] lg:block" />
    </div>
  )
}
