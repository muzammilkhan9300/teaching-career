import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { FormCard, FormSectionTitle } from '@/components/ui/FormCard'
import { RequireLogin } from '@/components/auth/RequireLogin'
import { ChoiceChip, ChoiceChipGroup, FileField, SelectField, TextField, TextareaField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { useMyCandidateApplication, useMyCandidateApplicationMutations } from '@/lib/queries'
import { candidateRegistrationSchema, type CandidateRegistrationInput } from '@/lib/validation'
import { AlertIcon, CapIcon, CheckCircleIcon, ClockIcon, InfoIcon, LockIcon, PersonIcon } from '@/components/icons'
import type { MyCandidateApplication } from '@/types'

const CITIES = ['Islamabad', 'Lahore', 'Karachi']
const QUALIFICATIONS = ["Bachelor's", "Master's", 'M.Phil', 'PhD']
const SUBJECTS = [
  { label: 'Mathematics', value: 'mathematics' },
  { label: 'Physics', value: 'physics' },
  { label: 'Chemistry', value: 'chemistry' },
  { label: 'Biology', value: 'biology' },
  { label: 'English', value: 'english' },
  { label: 'Computer Science', value: 'computer_science' },
  { label: 'Urdu', value: 'urdu' },
  { label: 'Islamiat', value: 'islamiat' },
  { label: 'Pakistan Studies', value: 'pakistan_studies' },
  { label: 'Other', value: 'other' },
]
const CLASSES = [
  { label: 'Primary', value: 'primary' },
  { label: 'Middle', value: 'middle' },
  { label: 'Matric', value: 'matric' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'O Level', value: 'o_level' },
  { label: 'A Level', value: 'a_level' },
  { label: 'Other', value: 'other' },
]

const STATUS_COPY: Record<MyCandidateApplication['applicationStatus'], { icon: typeof PersonIcon; classes: string; title: string; text: string }> = {
  New: {
    icon: ClockIcon,
    classes: 'bg-amber-50 text-amber-700',
    title: 'Your application is under review',
    text: "We're reviewing your profile and documents. You'll be able to edit them once a decision is made.",
  },
  Reviewed: {
    icon: ClockIcon,
    classes: 'bg-amber-50 text-amber-700',
    title: 'Your application is under review',
    text: "We're reviewing your profile and documents. You'll be able to edit them once a decision is made.",
  },
  Resubmitted: {
    icon: ClockIcon,
    classes: 'bg-amber-50 text-amber-700',
    title: 'Your update is under review',
    text: "We're reviewing your latest changes. You'll be able to edit again once a decision is made.",
  },
  Verified: {
    icon: CheckCircleIcon,
    classes: 'bg-mint text-teal-deep',
    title: 'Your profile is verified and published',
    text: 'Your candidate profile is live. You can update your details below — since your documents were reviewed and removed, you\'ll need to re-upload them, and changes go through a quick review before going live.',
  },
  Rejected: {
    icon: AlertIcon,
    classes: 'bg-red-50 text-red-600',
    title: 'Your application needs changes',
    text: 'An admin rejected this submission. Review the reason below, make the needed changes (including re-uploading your documents), and resubmit.',
  },
}

function fillForm(data: CandidateRegistrationInput, app: MyCandidateApplication): CandidateRegistrationInput {
  return {
    ...data,
    fullName: app.fullName,
    email: app.email,
    whatsapp: app.whatsapp,
    city: app.city,
    area: app.area,
    gender: app.gender ?? '',
    qualification: app.qualification,
    degreeName: app.degreeName,
    major: app.major,
    institute: app.institute,
    completionYear: app.completionYear ?? '',
    isFresher: app.isFresher,
    experienceYears: app.experienceYears ?? '',
    experienceOrg: app.experienceOrg ?? '',
    experienceDetails: app.experienceDetails ?? '',
    teachWhere: app.teachWhere,
    subjects: app.subjects,
    subjectOther: app.subjectOther ?? '',
    classes: app.classes,
    classOther: app.classOther ?? '',
    availability: app.availability ?? '',
    preferredTime: app.preferredTime ?? '',
    declaration: app.declaration,
  }
}

function buildFormData(data: CandidateRegistrationInput) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue
    if (key === 'declaration') {
      formData.set(key, String(value))
    } else if (Array.isArray(value)) {
      formData.set(key, JSON.stringify(value))
    } else if (value instanceof FileList) {
      if (value[0]) formData.set(key, value[0])
    } else {
      formData.set(key, String(value))
    }
  }
  return formData
}

export default function CandidateRegistration() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: myApplication, isLoading } = useMyCandidateApplication()
  const { create, resubmit } = useMyCandidateApplicationMutations()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CandidateRegistrationInput>({
    resolver: zodResolver(candidateRegistrationSchema),
    defaultValues: { isFresher: 'yes', teachWhere: [], subjects: [], classes: [] },
  })

  useEffect(() => {
    if (myApplication) reset((current) => fillForm(current, myApplication))
  }, [myApplication, reset])

  const isFresher = watch('isFresher')
  const teachWhere = watch('teachWhere') ?? []
  const subjects = watch('subjects') ?? []
  const classes = watch('classes') ?? []
  const profilePhoto = watch('profilePhoto')
  const degreeDocument = watch('degreeDocument')
  const experienceDocument = watch('experienceDocument')
  const policeVerification = watch('policeVerification')

  const isEditable = !myApplication || myApplication.applicationStatus === 'Verified' || myApplication.applicationStatus === 'Rejected'
  const mutation = myApplication ? resubmit : create

  function onSubmit(data: CandidateRegistrationInput) {
    if (myApplication) {
      if (!window.confirm('Resubmit your updated application for admin review?')) return
    }
    const wasFirstSubmission = !myApplication
    mutation.mutate(buildFormData(data), {
      onSuccess: () => {
        if (wasFirstSubmission) {
          showToast({ variant: 'success', title: 'Registration submitted', description: 'Thank you for registering as a candidate.' })
          navigate('/registration-success?type=candidate')
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
        <title>Register as a Candidate — TeachingCareer</title>
        <meta name="description" content="Join TeachingCareer as a teaching candidate and explore suitable teaching opportunities in Pakistan." />
        <link rel="canonical" href="https://www.teachingcareer.pk/candidate-registration" />
      </Helmet>

      <Breadcrumb items={[{ label: 'Registrations', to: '/school-registration' }, { label: 'Register as a Candidate' }]} />
      <PageHero
        eyebrow="Candidate Registration"
        title="Register as a Candidate"
        text="Join TeachingCareer and share your teaching qualifications and experience to explore suitable teaching opportunities."
      />

      <section className="py-16">
        <div className="tc-container">
          <RequireLogin activity="register as a candidate">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
            </div>
          ) : (
          <FormCard>
            {myApplication ? (
              <div className={`mb-8 flex flex-col gap-2 rounded-2xl p-5 ${STATUS_COPY[myApplication.applicationStatus].classes}`}>
                <div className="flex items-center gap-2 font-extrabold">
                  {(() => {
                    const Icon = STATUS_COPY[myApplication.applicationStatus].icon
                    return <Icon size={18} />
                  })()}
                  {STATUS_COPY[myApplication.applicationStatus].title}
                </div>
                <p className="text-sm">{STATUS_COPY[myApplication.applicationStatus].text}</p>
                {myApplication.applicationStatus === 'Rejected' && myApplication.rejectionReason ? (
                  <p className="mt-1 rounded-xl bg-white/60 p-3 text-sm font-medium">
                    <span className="font-extrabold">Admin feedback: </span>
                    {myApplication.rejectionReason}
                  </p>
                ) : null}
              </div>
            ) : null}

            {isEditable ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy">
                    <PersonIcon size={20} className="text-teal-deep" />
                    {myApplication ? 'Edit Your Application' : 'Candidate Registration Form'}
                  </h2>
                  <p className="mt-1 text-sm text-body">Please fill in the details below so we can review your profile.</p>
                  <p className="text-sm text-body">Profile photo is optional — a passport-size, professional-looking photo is preferred.</p>
                </div>
                <FileField
                  id="profilePhoto"
                  placeholder="Upload Image"
                  accept="image/png, image/jpeg"
                  fileName={profilePhoto?.[0]?.name}
                  error={errors.profilePhoto?.message as string | undefined}
                  {...register('profilePhoto')}
                />
              </div>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>Personal Information</FormSectionTitle>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField label="Full Name" required placeholder="Enter your full name" error={errors.fullName?.message} {...register('fullName')} />
                  <TextField label="Email Address" type="email" required placeholder="Enter your email address" error={errors.email?.message} {...register('email')} />
                  <TextField label="WhatsApp Number" type="tel" required placeholder="0312 8423576" error={errors.whatsapp?.message} {...register('whatsapp')} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField label="City" required placeholder="Select your city" options={CITIES.map((c) => ({ label: c, value: c }))} error={errors.city?.message} {...register('city')} />
                  <TextField label="Area" required placeholder="Enter your area / locality" error={errors.area?.message} {...register('area')} />
                  <SelectField label="Gender" placeholder="Select gender" options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]} {...register('gender')} />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>Education / Qualification</FormSectionTitle>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectField label="Highest Qualification" required placeholder="Select qualification" options={QUALIFICATIONS.map((q) => ({ label: q, value: q }))} error={errors.qualification?.message} {...register('qualification')} />
                  <TextField label="Degree / Qualification Name" required placeholder="e.g. B.Ed, M.Sc Physics" error={errors.degreeName?.message} {...register('degreeName')} />
                  <TextField label="Field / Major" required placeholder="e.g. Mathematics" error={errors.major?.message} {...register('major')} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField label="University / Institute" required placeholder="Enter university / institute name" error={errors.institute?.message} {...register('institute')} />
                  <TextField label="Completion Year" placeholder="e.g. 2022" {...register('completionYear')} />
                  <FileField
                    id="degreeDocument"
                    label="Degree / Qualification Document"
                    required
                    hint={myApplication ? 'Your previous document was removed after review — please re-upload it. PDF, JPG, PNG (Max 5MB)' : 'PDF, JPG, PNG (Max 5MB)'}
                    accept=".pdf,image/png,image/jpeg"
                    fileName={degreeDocument?.[0]?.name}
                    error={errors.degreeDocument?.message as string | undefined}
                    {...register('degreeDocument')}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>Teaching Experience</FormSectionTitle>
                <ChoiceChipGroup legend="Are you a Fresher?" required error={errors.isFresher?.message}>
                  <ChoiceChip type="radio" id="fresher-yes" value="yes" label="Yes" {...register('isFresher')} />
                  <ChoiceChip type="radio" id="fresher-no" value="no" label="No" {...register('isFresher')} />
                </ChoiceChipGroup>

                {isFresher === 'no' ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <TextField label="Total Teaching Experience" placeholder="e.g. 3 Years" {...register('experienceYears')} />
                    <TextField label="Previous School / Organization / Academy" placeholder="Enter previous institution name" {...register('experienceOrg')} />
                    <FileField
                      id="experienceDocument"
                      label="Experience Letter / Proof of Experience"
                      required
                      hint={myApplication ? 'Your previous document was removed after review — please re-upload it. PDF, JPG, PNG (Max 5MB)' : 'PDF, JPG, PNG (Max 5MB)'}
                      accept=".pdf,image/png,image/jpeg"
                      fileName={experienceDocument?.[0]?.name}
                      error={errors.experienceDocument?.message as string | undefined}
                      {...register('experienceDocument')}
                    />
                    <TextareaField
                      label="Experience Details"
                      wrapperClassName="sm:col-span-2 lg:col-span-3"
                      placeholder="Briefly describe your teaching experience..."
                      {...register('experienceDetails')}
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-4">
                <FormSectionTitle>Where would you like to teach?</FormSectionTitle>
                <ChoiceChipGroup legend="Select all that apply" required error={errors.teachWhere?.message}>
                  <ChoiceChip id="teach-school" value="school" label="School" {...register('teachWhere')} />
                  <ChoiceChip id="teach-academy" value="academy" label="Academy" {...register('teachWhere')} />
                  <ChoiceChip id="teach-home" value="home_tuition" label="Home Tuition" {...register('teachWhere')} />
                </ChoiceChipGroup>

                {teachWhere.includes('home_tuition') ? (
                  <div className="flex flex-col gap-4 rounded-2xl bg-mint/60 p-5">
                    <div className="flex gap-3">
                      <InfoIcon size={18} className="mt-0.5 shrink-0 text-teal-deep" />
                      <div>
                        <p className="text-sm font-extrabold text-navy">IMPORTANT NOTE:</p>
                        <p className="mt-1 text-sm text-body">
                          If you select Home Tuition, you must provide a Police Verification Certificate to
                          TeachCareer before receiving any Home Tuition opportunity.
                        </p>
                        <p className="mt-1 text-sm text-body">
                          You may skip submitting the certificate while completing this registration form.
                          However, Home Tuition opportunities will NOT be provided until your Police Verification
                          Certificate is submitted to TeachCareer through WhatsApp.
                        </p>
                      </div>
                    </div>
                    <FileField
                      id="policeVerification"
                      label="Police Verification Certificate"
                      optional
                      hint="PDF, JPG, PNG (Max 5MB) — or skip and send via WhatsApp later"
                      accept=".pdf,image/png,image/jpeg"
                      fileName={policeVerification?.[0]?.name}
                      error={errors.policeVerification?.message as string | undefined}
                      {...register('policeVerification')}
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-4">
                <FormSectionTitle>Which subject(s) would you like to teach?</FormSectionTitle>
                <ChoiceChipGroup legend="Select all that apply" required error={errors.subjects?.message}>
                  {SUBJECTS.map((s) => (
                    <ChoiceChip key={s.value} id={`subj-${s.value}`} value={s.value} label={s.label} {...register('subjects')} />
                  ))}
                </ChoiceChipGroup>
                {subjects.includes('other') ? (
                  <TextField label="Please specify the subject" placeholder="Enter subject name" {...register('subjectOther')} />
                ) : null}
              </div>

              <div className="flex flex-col gap-4">
                <FormSectionTitle>Which classes / grades can you teach?</FormSectionTitle>
                <ChoiceChipGroup legend="Select all that apply">
                  {CLASSES.map((c) => (
                    <ChoiceChip key={c.value} id={`cls-${c.value}`} value={c.value} label={c.label} {...register('classes')} />
                  ))}
                </ChoiceChipGroup>
                {classes.includes('other') ? (
                  <TextField label="Please specify the class / grade" placeholder="Enter class / grade" {...register('classOther')} />
                ) : null}
              </div>

              <div className="flex flex-col gap-5">
                <FormSectionTitle>Teaching Availability</FormSectionTitle>
                <ChoiceChipGroup legend="Availability">
                  <ChoiceChip type="radio" id="avail-full" value="full_time" label="Full Time" {...register('availability')} />
                  <ChoiceChip type="radio" id="avail-part" value="part_time" label="Part Time" {...register('availability')} />
                  <ChoiceChip type="radio" id="avail-both" value="both" label="Both" {...register('availability')} />
                </ChoiceChipGroup>
                <SelectField
                  label="Preferred Teaching Time"
                  placeholder="Select preferred time"
                  options={['Morning', 'Afternoon', 'Evening', 'Flexible'].map((v) => ({ label: v, value: v }))}
                  wrapperClassName="max-w-sm"
                  {...register('preferredTime')}
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-line bg-mint/30 p-4 text-sm leading-relaxed text-body">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-teal" {...register('declaration')} />
                <span>
                  I confirm that the information provided by me is accurate and complete. I understand that
                  TeachCareer may verify my qualifications and teaching experience before presenting my profile
                  for suitable opportunities.
                </span>
              </label>
              {errors.declaration ? <p className="text-xs font-medium text-red-500">{errors.declaration.message}</p> : null}

              <div className="flex flex-col items-start gap-3">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
                >
                  <CapIcon size={16} />
                  {mutation.isPending ? 'Submitting…' : myApplication ? 'Update & Resubmit for Review' : 'Register as a Candidate'}
                </button>
                <p className="flex items-center gap-1.5 text-xs text-body">
                  <LockIcon size={12} />
                  Your information is kept private and is only used by TeachCareer for verification and matching.
                </p>
              </div>
            </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-body">
                <p className="font-semibold text-navy">{myApplication!.fullName}</p>
                <p className="mt-1">{myApplication!.city}, {myApplication!.area}</p>
                <p className="mt-3">Editing is disabled while this application is awaiting a decision.</p>
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
