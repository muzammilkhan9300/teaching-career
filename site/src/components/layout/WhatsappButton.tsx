import { WhatsappIcon } from '@/components/icons'

// 0312 8423576 in WhatsApp's required international format (no leading 0,
// prefixed with Pakistan's country code).
const WHATSAPP_NUMBER = '923128423576'
const DEFAULT_MESSAGE = "Hi TeachingCareer, I'd like to know more."

export function WhatsappButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-tc-lg transition hover:scale-105 hover:bg-[#20BD5A]"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/60" aria-hidden="true" />
      <WhatsappIcon size={28} />
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-tc transition group-hover:opacity-100">
        Chat on WhatsApp
      </span>
    </a>
  )
}
