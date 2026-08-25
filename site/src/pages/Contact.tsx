import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { FormCard } from '@/components/ui/FormCard'
import { TextField, TextareaField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { DEMO_STORAGE_KEYS, saveDemoRecord } from '@/lib/demoStorage'
import { contactMessageSchema, type ContactMessageInput } from '@/lib/validation'
import { MailIcon, PhoneIcon, SendIcon, WhatsappIcon } from '@/components/icons'

export default function Contact() {
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({ resolver: zodResolver(contactMessageSchema) })

  function onSubmit(data: ContactMessageInput) {
    saveDemoRecord(DEMO_STORAGE_KEYS.contactMessages, data)
    showToast({
      variant: 'success',
      title: 'Message received',
      description: 'Thank you — we will get back to you soon.',
    })
    reset()
  }

  return (
    <>
      <Helmet>
        <title>Contact Us — TeachingCareer</title>
        <meta name="description" content="Get in touch with the TeachingCareer team for schools, candidates, and parents." />
        <link rel="canonical" href="https://www.teachingcareer.pk/contact" />
      </Helmet>

      <Breadcrumb items={[{ label: 'Contact' }]} />
      <PageHero
        eyebrow="Get in Touch"
        title="We'd Love to Hear From You"
        text="Whether you're a school, a candidate, or a parent — reach out and our team will get back to you."
      >
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-line bg-white px-6 py-4 shadow-tc">
          <a href="tel:03128423676" className="flex items-center gap-2 text-sm font-bold text-navy hover:text-teal">
            <PhoneIcon size={15} className="text-teal-deep" />
            0312 8423676
          </a>
          <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
          <a href="tel:03000243546" className="flex items-center gap-2 text-sm font-bold text-navy hover:text-teal">
            <PhoneIcon size={15} className="text-teal-deep" />
            0300 0243546
          </a>
          <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
          <a
            href="https://wa.me/923128423676"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-teal px-4 py-2 text-sm font-bold text-white hover:bg-teal-dark"
          >
            <WhatsappIcon size={15} />
            Message Us on WhatsApp
          </a>
        </div>
      </PageHero>

      <section className="py-16">
        <div className="tc-container">
          <FormCard>
            <div className="mb-6 flex flex-col gap-2 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-teal-deep">
                <MailIcon size={22} />
              </span>
              <h2 className="text-xl font-extrabold text-navy">Send Us a Message</h2>
              <p className="text-sm text-body">Why reach out to us? Questions, feedback, or partnership ideas — we read every message.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
              <TextField label="Full Name" required placeholder="Enter your full name" error={errors.name?.message} {...register('name')} />
              <TextField
                label="Email Address"
                type="email"
                required
                placeholder="Enter your email address"
                error={errors.email?.message}
                {...register('email')}
              />
              <TextareaField
                label="Message"
                required
                placeholder="How can we help?"
                rows={5}
                error={errors.message?.message}
                {...register('message')}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-teal px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-60"
              >
                <SendIcon size={15} />
                Send Message
              </button>
            </form>
          </FormCard>
        </div>
      </section>
    </>
  )
}
