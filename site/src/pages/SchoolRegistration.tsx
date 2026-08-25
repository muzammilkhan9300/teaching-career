import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { FormCard, FormSectionTitle } from '@/components/ui/FormCard'
import { FileField, SelectField, TextField, TextareaField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { api, ApiError } from '@/lib/api'
import { schoolRegistrationSchema, type SchoolRegistrationInput } from '@/lib/validation'
import { ShieldIcon } from '@/components/icons'

const CITIES = ['Islamabad', 'Lahore', 'Karachi']

export default function SchoolRegistration() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SchoolRegistrationInput>({ resolver: zodResolver(schoolRegistrationSchema) })

  const schoolLogo = watch('schoolLogo')

  const registerMutation = useMutation({
    mutationFn: (data: SchoolRegistrationInput) => {
      const formData = new FormData()
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue
        if (value instanceof FileList) {
          if (value[0]) formData.set(key, value[0])
        } else {
          formData.set(key, String(value))
        }
      }
      return api.postForm('/school-registrations', formData)
    },
    onSuccess: () => {
      showToast({ variant: 'success', title: 'Registration submitted', description: 'Thank you for registering your school.' })
      navigate('/registration-success?type=school')
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Please check your details and try again.'
      showToast({ variant: 'error', title: 'Registration failed', description: message })
    },
  })

  function onSubmit(data: SchoolRegistrationInput) {
    registerMutation.mutate(data)
  }

  return (
    <>
      <Helmet>
        <title>Register Your School — TeachingCareer</title>
        <meta name="description" content="Register your school with TeachingCareer to find qualified, verified teachers." />
        <link rel="canonical" href="https://www.teachingcareer.pk/school-registration" />
      </Helmet>

      <Breadcrumb items={[{ label: 'Registrations' }, { label: 'Register Your School' }]} />
      <PageHero
        eyebrow="School Registration"
        title="Register Your School"
        text="Register your school with TeachingCareer to reach verified, qualified teaching candidates."
      >
        <img
          src="/assets/images/School.jpg"
          alt="A registered TeachingCareer partner school"
          loading="lazy"
          decoding="async"
          className="mt-4 h-40 w-full max-w-xl rounded-2xl object-cover shadow-tc-lg"
        />
      </PageHero>

      <section className="py-16">
        <div className="tc-container">
          <FormCard>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy">
                <ShieldIcon size={20} className="text-teal-deep" />
                School Registration Form
              </h2>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>School Information</FormSectionTitle>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField label="School Name" required placeholder="Enter school name" error={errors.schoolName?.message} {...register('schoolName')} />
                  <SelectField label="City" required placeholder="Select city" options={CITIES.map((c) => ({ label: c, value: c }))} error={errors.schoolCity?.message} {...register('schoolCity')} />
                  <TextField label="Area" required placeholder="Enter area / locality" error={errors.schoolArea?.message} {...register('schoolArea')} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <FileField
                    id="schoolLogo"
                    label="School Logo"
                    optional
                    hint="JPG, PNG (Max 2MB)"
                    accept="image/png, image/jpeg"
                    fileName={schoolLogo?.[0]?.name}
                    error={errors.schoolLogo?.message as string | undefined}
                    {...register('schoolLogo')}
                  />
                  <TextField label="Year Established" required placeholder="e.g. 2010" error={errors.schoolYear?.message} {...register('schoolYear')} />
                  <TextField label="Number of Branches" placeholder="e.g. 2" {...register('schoolBranches')} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField label="Website" placeholder="https://yourschool.edu.pk" error={errors.schoolWebsite?.message} {...register('schoolWebsite')} />
                  <TextField label="WhatsApp Number" type="tel" required placeholder="0312 8423676" error={errors.schoolWhatsapp?.message} {...register('schoolWhatsapp')} />
                  <TextField label="Phone Number" type="tel" required placeholder="042 1234567" error={errors.schoolPhone?.message} {...register('schoolPhone')} />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>Additional Information</FormSectionTitle>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField label="School Type" optional placeholder="Select type" options={['Private', 'Public', 'International'].map((v) => ({ label: v, value: v }))} {...register('schoolType')} />
                  <SelectField label="Curriculum / Board" optional placeholder="Select board" options={['Cambridge', 'Federal Board', 'Matric'].map((v) => ({ label: v, value: v }))} {...register('schoolBoard')} />
                  <SelectField label="Grade Levels" optional placeholder="Select grade levels" options={['Primary', 'Secondary', 'Higher Secondary'].map((v) => ({ label: v, value: v }))} {...register('schoolGrades')} />
                </div>
                <TextareaField label="School Description" optional placeholder="Tell candidates a little about your school..." {...register('schoolDesc')} />
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
              >
                <ShieldIcon size={16} />
                {registerMutation.isPending ? 'Submitting…' : 'Register School'}
              </button>
            </form>
          </FormCard>
        </div>
      </section>
    </>
  )
}
