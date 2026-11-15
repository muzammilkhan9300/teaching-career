import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from '@/components/icons'
import { youTubeEmbedUrl, youTubeWatchUrl } from '@/lib/youtube'

/** Plays a TeachingCareer YouTube video in an on-page modal (privacy-enhanced embed). */
export function VideoModal({ videoId, title, onClose }: { videoId: string; title: string; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  // Portaled to <body>: the hero section is its own stacking context
  // (`isolate`), which would otherwise trap the modal beneath the sticky header.
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-navy/75 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-4 text-white">
          <p className="truncate text-sm font-bold">{title}</p>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={youTubeWatchUrl(videoId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline"
            >
              Watch on YouTube
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close video"
              autoFocus
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-tc-lg">
          <iframe
            src={youTubeEmbedUrl(videoId)}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
