import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { FormCard, FormSectionTitle } from '@/components/ui/FormCard'
import { SelectField, TextField, TextareaField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { api, ApiError } from '@/lib/api'
import { homeTutorSchema, type HomeTutorInput } from '@/lib/validation'
import { PhoneIcon, PinIcon, ShieldIcon, WhatsappIcon } from '@/components/icons'

const CITIES = ['Islamabad', 'Lahore', 'Karachi']

export default function HomeTutor() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HomeTutorInput>({ resolver: zodResolver(homeTutorSchema) })

  const requestMutation = useMutation({
    mutationFn: (data: HomeTutorInput) => api.postJson('/home-tutor-requests', data),
    onSuccess: () => {
      showToast({ variant: 'success', title: 'Request submitted', description: 'Thank you for your request.' })
      navigate('/registration-success?type=home-tutor')
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Please check your details and try again.'
      showToast({ variant: 'error', title: 'Request failed', description: message })
    },
  })

  function onSubmit(data: HomeTutorInput) {
    requestMutation.mutate(data)
  }

  return (
    <>
      <Helmet>
        <title>Request a Home Tutor — TeachingCareer</title>
        <meta name="description" content="Request a verified home tutor for your child through TeachingCareer." />
        <link rel="canonical" href="https://www.teachingcareer.pk/home-tutor" />
      </Helmet>

      <Breadcrumb items={[{ label: 'Contact Us', to: '/contact' }, { label: 'Request Home Tutor' }]} />
      <PageHero
        eyebrow="Home Tuition"
        title="Request a Home Tutor"
        text="Tell us your requirements and we'll match your child with a verified, suitable home tutor."
      >
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-line bg-white px-6 py-4 shadow-tc">
          <a href="tel:03128423676" className="flex items-center gap-2 text-sm font-bold text-navy hover:text-teal">
            <PhoneIcon size={15} className="text-teal-deep" />
            0312 8423676
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
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy">
                <PinIcon size={20} className="text-teal-deep" />
                Home Tutor Request Form
              </h2>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>Parent / Guardian Information</FormSectionTitle>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField label="Full Name" required placeholder="Enter your full name" error={errors.parentName?.message} {...register('parentName')} />
                  <TextField label="Email Address" type="email" required placeholder="Enter your email address" error={errors.parentEmail?.message} {...register('parentEmail')} />
                  <TextField label="WhatsApp Number" type="tel" required placeholder="0312 8423676" error={errors.parentWhatsapp?.message} {...register('parentWhatsapp')} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField label="City" required placeholder="Select your city" options={CITIES.map((c) => ({ label: c, value: c }))} error={errors.parentCity?.message} {...register('parentCity')} />
                  <TextField label="Area" required placeholder="Enter your area / locality" error={errors.parentArea?.message} {...register('parentArea')} />
                  <SelectField label="Best Time to Contact You" optional placeholder="Select time" options={['Morning', 'Afternoon', 'Evening'].map((v) => ({ label: v, value: v }))} {...register('contactTime')} />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>Student Information</FormSectionTitle>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField label="Student Name" required placeholder="Enter student name" error={errors.studentName?.message} {...register('studentName')} />
                  <SelectField label="Class / Grade" required placeholder="Select class" options={['Primary', 'Middle', 'Matric', 'Intermediate'].map((v) => ({ label: v, value: v }))} error={errors.studentClass?.message} {...register('studentClass')} />
                  <SelectField label="Gender" optional placeholder="Select gender" options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]} {...register('studentGender')} />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>Tutoring Requirements</FormSectionTitle>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField
                    label="Subject(s) Needed"
                    required
                    placeholder="Select subject"
                    options={['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'All Subjects'].map((v) => ({ label: v, value: v }))}
                    error={errors.subjectsNeeded?.message}
                    {...register('subjectsNeeded')}
                  />
                  <SelectField label="Syllabus" optional placeholder="Select syllabus" options={['Cambridge', 'Federal Board', 'Matric'].map((v) => ({ label: v, value: v }))} {...register('syllabus')} />
                  <SelectField label="Purpose" optional placeholder="Select purpose" options={['Exam Prep', 'Concept Building', 'Homework Help'].map((v) => ({ label: v, value: v }))} {...register('purpose')} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField label="Days per Week" optional placeholder="Select days" options={['1-2 Days', '3-4 Days', '5+ Days'].map((v) => ({ label: v, value: v }))} {...register('daysPerWeek')} />
                  <SelectField label="Preferred Time" optional placeholder="Select time" options={['Morning', 'Afternoon', 'Evening', 'Flexible'].map((v) => ({ label: v, value: v }))} {...register('preferredTime')} />
                  <SelectField label="Tuition Location" optional placeholder="Select location" options={['At my home', 'Online'].map((v) => ({ label: v, value: v }))} {...register('tuitionLocation')} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField label="Urgency" optional placeholder="Select urgency" options={['Immediate', 'Within a Week', 'Flexible'].map((v) => ({ label: v, value: v }))} {...register('urgency')} />
                  <TextField label="Additional Requirements" optional placeholder="Anything else we should know?" wrapperClassName="sm:col-span-2" {...register('additionalReq')} />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>Message</FormSectionTitle>
                <TextareaField label="Additional Message" optional placeholder="Any other details you'd like to share..." {...register('parentMessage')} />
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-mint/60 p-4">
                <ShieldIcon size={18} className="mt-0.5 shrink-0 text-teal-deep" />
                <p className="text-sm text-body">
                  For your safety, tutors offering home tuition are asked to provide a Police Verification
                  Certificate before being presented for home tuition opportunities.
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-line bg-mint/30 p-4 text-sm leading-relaxed text-body">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-teal" {...register('agreeTerms')} />
                <span>I agree to be contacted by TeachingCareer regarding this home tutor request.</span>
              </label>
              {errors.agreeTerms ? <p className="text-xs font-medium text-red-500">{errors.agreeTerms.message}</p> : null}

              <button
                type="submit"
                disabled={requestMutation.isPending}
                className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
              >
                <PinIcon size={16} />
                {requestMutation.isPending ? 'Submitting…' : 'Request a Home Tutor'}
              </button>
            </form>
          </FormCard>
        </div>
      </section>
    </>
  )
}
