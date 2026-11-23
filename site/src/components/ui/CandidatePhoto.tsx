import { useState } from 'react'
import clsx from 'clsx'
import { PersonIcon } from '@/components/icons'
import { getCandidatePhoto } from '@/lib/candidatePhoto'

// Horizontally centred, slightly above the vertical middle: portrait and
// passport-style photos keep the face in frame inside wide or square boxes
// (plain "center" crops through the chest on tall photos), while landscape
// and square photos look the same as centred.
const FACE_POSITION = '50% 25%'

interface CandidatePhotoProps {
  /** Stored photo value (upload path, /assets path, legacy file name) or a preview blob: URL. */
  src: string | null | undefined
  alt: string
  /** Size of the fallback person icon. */
  iconSize?: number
  /** Lazy-load (use for lists/cards; not for the main image above the fold). */
  lazy?: boolean
  /** `contain` shows the whole photo (no cropping) — for frames that already match the 3:4 portrait. */
  fit?: 'cover' | 'contain'
}

/**
 * The one way the app renders a candidate's profile photo. Always fills its
 * parent (give the parent a fixed size, `overflow-hidden` and the rounding),
 * crops with object-fit: cover so nothing is stretched, and falls back to the
 * default person placeholder when there is no photo or it fails to load.
 */
export function CandidatePhoto({ src, alt, iconSize = 32, lazy = false, fit = 'cover' }: CandidatePhotoProps) {
  const resolved = src ? getCandidatePhoto(src) : ''
  // Remember which URL failed, so a new photo (e.g. after re-upload) is tried again.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!resolved || failedSrc === resolved) {
    return (
      <span className="flex h-full w-full items-center justify-center bg-mint text-teal-deep" role="img" aria-label={alt}>
        <PersonIcon size={iconSize} />
      </span>
    )
  }

  return (
    <img
      src={resolved}
      alt={alt}
      loading={lazy ? 'lazy' : undefined}
      decoding="async"
      onError={() => setFailedSrc(resolved)}
      className={clsx('block h-full w-full max-w-none', fit === 'contain' ? 'object-contain' : 'object-cover')}
      style={{ objectPosition: fit === 'contain' ? 'center' : FACE_POSITION }}
    />
  )
}
