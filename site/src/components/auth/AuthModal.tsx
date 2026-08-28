import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloseIcon } from '@/components/icons'

/**
 * Overlays login/signup on top of whatever page was open, instead of
 * navigating away — the background page stays exactly where it was. Only
 * ever rendered when a backgroundLocation exists (see App.tsx), so there's
 * always a real history entry to close back onto.
 */
export function AuthModal({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  function close() {
    navigate(-1)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/50 p-4"
      onClick={close}
      role="presentation"
    >
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-body shadow-tc transition hover:text-navy"
        >
          <CloseIcon size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
