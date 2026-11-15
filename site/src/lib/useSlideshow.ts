import { useCallback, useEffect, useState } from 'react'

/**
 * Index state for an auto-advancing slideshow. Auto-advance is skipped for
 * visitors who prefer reduced motion, and the timer restarts after every
 * manual change so a click is never immediately followed by a jump.
 */
export function useSlideshow(count: number, intervalMs = 6000) {
  const [index, setIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(mediaQuery.matches)
    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  // Keep the index valid if the slide list shrinks (e.g. fallback -> fewer DB slides).
  const safeIndex = count > 0 ? index % count : 0

  useEffect(() => {
    if (reduceMotion || count < 2) return undefined
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => window.clearTimeout(timer)
  }, [safeIndex, count, intervalMs, reduceMotion])

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])
  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(1, count)), [count])
  const prev = useCallback(() => setIndex((i) => (i - 1 + Math.max(1, count)) % Math.max(1, count)), [count])

  return { index: safeIndex, goTo, next, prev }
}
