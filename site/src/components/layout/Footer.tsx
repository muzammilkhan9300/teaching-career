import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  SendIcon,
  YoutubeIcon,
} from '@/components/icons'
import { TextField, TextareaField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { api, ApiError } from '@/lib/api'
import { useSettings } from '@/lib/queries'
import { contactMessageSchema, type ContactMessageInput } from '@/lib/validation'

// The footer has always shown a separate landline number from the
// phone used in the header/contact/home-tutor pages (settings.phone) — kept
// as-is here rather than merged, so no displayed value changes when
// settings loads.
const FOOTER_PHONE = '+92 314 444 7779'

const FALLBACK_SETTINGS = {
  email: 'info@teachingcareer.pk',
  address: 'Islamabad, Pakistan',
  social: { instagram: '#', facebook: '#', linkedin: '#', youtube: '#' },
}

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Blogs', to: '/blog' },
  { label: 'Registrations', to: '/candidate-registration' },
  { label: 'Profiles', to: '/candidate-profiles' },
  { label: 'Home Tutor', to: '/home-tutor' },
  { label: 'Contact Us', to: '/contact' },
]

const SOCIAL_LINKS = [
  { label: 'Instagram', icon: InstagramIcon, key: 'instagram' as const },
  { label: 'Facebook', icon: FacebookIcon, key: 'facebook' as const },
  { label: 'LinkedIn', icon: LinkedinIcon, key: 'linkedin' as const },
  { label: 'YouTube', icon: YoutubeIcon, key: 'youtube' as const },
]

export function Footer() {
  const { showToast } = useToast()
  const { data: settings } = useSettings()
  const email = settings?.email ?? FALLBACK_SETTINGS.email
  const address = settings?.address ?? FALLBACK_SETTINGS.address
  const social = settings?.social ?? FALLBACK_SETTINGS.social
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactMessageInput>({ resolver: zodResolver(contactMessageSchema) })

  const sendMutation = useMutation({
    mutationFn: (data: ContactMessageInput) => api.postJson('/contact-messages', data),
    onSuccess: () => {
      showToast({
        variant: 'success',
        title: 'Message received',
        description: 'Thank you — we will get back to you soon.',
      })
      reset()
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Please try sending your message again.'
      showToast({ variant: 'error', title: 'Message not sent', description: message })
    },
  })

  function onSubmit(data: ContactMessageInput) {
    sendMutation.mutate(data)
  }

  return (
    <footer className="relative overflow-hidden border-t border-line bg-navy text-white">
      <div className="tc-container relative grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <Link to="/" aria-label="TeachingCareer — Home">
            <img
              src="/assets/images/logo.png"
              alt="TeachingCareer — Connecting Talent. Building Futures."
              className="h-14 w-auto brightness-0 invert"
              width={238}
              height={70}
              loading="lazy"
              decoding="async"
            />
          </Link>
          <span className="h-1 w-12 rounded-full bg-teal" aria-hidden="true" />
          <h3 className="text-lg font-bold">Your Partner in Education &amp; Career Success</h3>
          <p className="text-sm leading-relaxed text-white/70">
            TeachingCareer connects schools, teachers, and parents to build a better future through quality
            education and the right opportunities.
          </p>
          <ul className="mt-2 flex flex-col gap-2.5 text-sm">
            <li className="flex items-center gap-2.5">
              <PhoneIcon size={15} className="text-teal" />
              <a href={`tel:${FOOTER_PHONE.replace(/\s+/g, '')}`} className="hover:text-teal">
                {FOOTER_PHONE}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MailIcon size={15} className="text-teal" />
              <a href={`mailto:${email}`} className="hover:text-teal">
                {email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <PinIcon size={15} className="text-teal" />
              <span>{address}</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-base font-bold">Quick Links</h3>
          <span className="h-1 w-10 rounded-full bg-teal" aria-hidden="true" />
          <ul className="flex flex-col gap-2 text-sm text-white/70">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="inline-flex items-center gap-2 hover:text-teal">
                  <span className="h-1 w-1 rounded-full bg-teal" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-base font-bold">Let&rsquo;s Connect</h3>
          <span className="h-1 w-10 rounded-full bg-teal" aria-hidden="true" />
          <p className="text-sm font-semibold">Let&rsquo;s build a better future together.</p>
          <p className="text-sm leading-relaxed text-white/70">
            Follow us on social media to stay updated with the latest opportunities, tips, and education insights.
          </p>
          <ul className="mt-1 flex gap-3">
            {SOCIAL_LINKS.map(({ label, icon: Icon, key }) => (
              <li key={label}>
                <a
                  href={social[key] || '#'}
                  target={social[key] ? '_blank' : undefined}
                  rel={social[key] ? 'noreferrer' : undefined}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-teal"
                >
                  <Icon size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-base font-bold">Contact Us</h3>
          <span className="h-1 w-10 rounded-full bg-teal" aria-hidden="true" />
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
            <TextField
              placeholder="Your Name"
              className="bg-white/5 text-white placeholder:text-white/50 border-white/15 focus:border-teal"
              error={errors.name?.message}
              {...register('name')}
            />
            <TextField
              type="email"
              placeholder="Your Email"
              className="bg-white/5 text-white placeholder:text-white/50 border-white/15 focus:border-teal"
              error={errors.email?.message}
              {...register('email')}
            />
            <TextareaField
              placeholder="Your Message"
              rows={3}
              className="bg-white/5 text-white placeholder:text-white/50 border-white/15 focus:border-teal"
              error={errors.message?.message}
              {...register('message')}
            />
            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-60"
            >
              <SendIcon size={15} />
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="tc-container text-center text-xs text-white/60">
          © {new Date().getFullYear()} TeachingCareer. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
