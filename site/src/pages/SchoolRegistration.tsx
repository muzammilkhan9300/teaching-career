import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { FormCard, FormSectionTitle } from '@/components/ui/FormCard'
import { RequireLogin } from '@/components/auth/RequireLogin'
import { FileField, SelectField, TextField, TextareaField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { useMySchoolRegistration, useMySchoolRegistrationMutations } from '@/lib/queries'
import { schoolRegistrationSchema, type SchoolRegistrationInput } from '@/lib/validation'
import { AlertIcon, CheckCircleIcon, ClockIcon, ShieldIcon } from '@/components/icons'
import type { MySchoolRegistration } from '@/types'

const CITIES = ['Islamabad', 'Lahore', 'Karachi']

const STATUS_COPY: Record<MySchoolRegistration['registrationStatus'], { icon: typeof ShieldIcon; classes: string; title: string; text: string }> = {
  Pending: {
    icon: ClockIcon,
    classes: 'bg-amber-50 text-amber-700',
    title: 'Your registration is under review',
    text: "We're reviewing your school's details. You'll be able to edit them once a decision is made.",
  },
  Resubmitted: {
    icon: ClockIcon,
    classes: 'bg-amber-50 text-amber-700',
    title: 'Your update is under review',
    text: "We're reviewing your latest changes. You'll be able to edit again once a decision is made.",
  },
  Approved: {
    icon: CheckCircleIcon,
    classes: 'bg-mint text-teal-deep',
    title: 'Your school is approved and live',
    text: 'Your listing is public. You can update your details below — changes go through a quick review before going live.',
  },
  Rejected: {
    icon: AlertIcon,
    classes: 'bg-red-50 text-red-600',
    title: 'Your registration needs changes',
    text: 'An admin rejected this submission. Review the reason below, make the needed changes, and resubmit.',
  },
}

function fillForm(data: SchoolRegistrationInput, reg: MySchoolRegistration) {
  return {
    ...data,
    schoolName: reg.schoolName,
    schoolCity: reg.schoolCity,
    schoolArea: reg.schoolArea,
    schoolYear: reg.schoolYear,
    schoolBranches: reg.schoolBranches ?? '',
    schoolWebsite: reg.schoolWebsite ?? '',
    schoolWhatsapp: reg.schoolWhatsapp,
    schoolPhone: reg.schoolPhone,
    schoolType: reg.schoolType ?? '',
    schoolBoard: reg.schoolBoard ?? '',
    schoolGrades: reg.schoolGrades ?? '',
    schoolDesc: reg.schoolDesc ?? '',
  }
}

export default function SchoolRegistration() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: myRegistration, isLoading } = useMySchoolRegistration()
  const { create, resubmit } = useMySchoolRegistrationMutations()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SchoolRegistrationInput>({ resolver: zodResolver(schoolRegistrationSchema) })

  useEffect(() => {
    if (myRegistration) reset((current) => fillForm(current, myRegistration))
  }, [myRegistration, reset])

  const schoolLogo = watch('schoolLogo')
  const isEditable = !myRegistration || myRegistration.registrationStatus === 'Approved' || myRegistration.registrationStatus === 'Rejected'
  const mutation = myRegistration ? resubmit : create

  function buildFormData(data: SchoolRegistrationInput) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue
      if (value instanceof FileList) {
        if (value[0]) formData.set(key, value[0])
      } else {
        formData.set(key, String(value))
      }
    }
    return formData
  }

  function onSubmit(data: SchoolRegistrationInput) {
    if (myRegistration) {
      if (!window.confirm('Resubmit your updated school details for admin review?')) return
    }
    const wasFirstSubmission = !myRegistration
    mutation.mutate(buildFormData(data), {
      onSuccess: () => {
        if (wasFirstSubmission) {
          showToast({ variant: 'success', title: 'Registration submitted', description: 'Thank you for registering your school.' })
          navigate('/registration-success?type=school')
          return
        }
        showToast({ variant: 'success', title: 'Resubmitted for review', description: "We'll notify you once it's reviewed." })
      },
      onError: (error) => {
        const message = error instanceof ApiError ? error.message : 'Please check your details and try again.'
        showToast({ variant: 'error', title: 'Something went wrong', description: message })
      },
    })
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
          <RequireLogin activity="register your school">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
            </div>
          ) : (
          <FormCard>
            {myRegistration ? (
              <div className={`mb-8 flex flex-col gap-2 rounded-2xl p-5 ${STATUS_COPY[myRegistration.registrationStatus].classes}`}>
                <div className="flex items-center gap-2 font-extrabold">
                  {(() => {
                    const Icon = STATUS_COPY[myRegistration.registrationStatus].icon
                    return <Icon size={18} />
                  })()}
                  {STATUS_COPY[myRegistration.registrationStatus].title}
                </div>
                <p className="text-sm">{STATUS_COPY[myRegistration.registrationStatus].text}</p>
                {myRegistration.registrationStatus === 'Rejected' && myRegistration.rejectionReason ? (
                  <p className="mt-1 rounded-xl bg-white/60 p-3 text-sm font-medium">
                    <span className="font-extrabold">Admin feedback: </span>
                    {myRegistration.rejectionReason}
                  </p>
                ) : null}
              </div>
            ) : null}

            {isEditable ? (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy">
                  <ShieldIcon size={20} className="text-teal-deep" />
                  {myRegistration ? 'Edit Your School Details' : 'School Registration Form'}
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
                      hint={myRegistration?.schoolLogoPath ? 'Leave blank to keep your current logo' : 'JPG, PNG (Max 2MB)'}
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
                  disabled={mutation.isPending}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
                >
                  <ShieldIcon size={16} />
                  {mutation.isPending ? 'Submitting…' : myRegistration ? 'Update & Resubmit for Review' : 'Register School'}
                </button>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-body">
                <p className="font-semibold text-navy">{myRegistration!.schoolName}</p>
                <p className="mt-1">{myRegistration!.schoolCity}, {myRegistration!.schoolArea}</p>
                <p className="mt-3">Editing is disabled while this submission is awaiting a decision.</p>
              </div>
            )}
          </FormCard>
          )}
          </RequireLogin>
        </div>
      </section>
    </>
  )
}
