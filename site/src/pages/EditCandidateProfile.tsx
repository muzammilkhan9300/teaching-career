import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { FormCard, FormSectionTitle } from '@/components/ui/FormCard'
import { RequireLogin } from '@/components/auth/RequireLogin'
import { Button } from '@/components/ui/Button'
import { ChoiceChip, ChoiceChipGroup, FileField, SelectField, TextField, TextareaField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { CheckCircleIcon, LockIcon, PersonIcon, ShieldIcon } from '@/components/icons'
import { useUserAuth } from '@/auth/UserAuthContext'
import { useMyCandidateApplication, useUpdateCandidateProfile } from '@/lib/queries'
import { CANDIDATE_CITIES, CLASSES, QUALIFICATIONS, SUBJECTS } from '@/lib/candidateOptions'
import { serverErrors } from '@/lib/formErrors'
import { formatShortDate } from '@/lib/dates'
import { usePreviewUrl } from '@/lib/usePreviewUrl'
import type { MyCandidateApplication } from '@/types'

interface FormValues {
  fullName: string
  city: string
  area: string
  about: string
  skills: string // comma-separated in the form, sent as an array
  qualification: string
  degreeName: string
  major: string
  institute: string
  completionYear: string
  subjects: string[]
  subjectOther: string
  classes: string[]
  classOther: string
  experienceYears: string
  experienceOrg: string
  experienceDetails: string
  whatsapp: string
  email: string
  profilePhoto?: FileList
}

const TEXT_FIELDS = [
  'fullName', 'city', 'area', 'about', 'qualification', 'degreeName', 'major', 'institute', 'completionYear',
  'subjectOther', 'classOther', 'experienceYears', 'experienceOrg', 'experienceDetails', 'whatsapp', 'email',
] as const

function defaultsFrom(app: MyCandidateApplication): FormValues {
  return {
    fullName: app.fullName,
    city: app.city,
    area: app.area,
    about: app.about ?? '',
    skills: (app.skills ?? []).join(', '),
    qualification: app.qualification,
    degreeName: app.degreeName,
    major: app.major,
    institute: app.institute,
    completionYear: app.completionYear ?? '',
    subjects: app.subjects,
    subjectOther: app.subjectOther ?? '',
    classes: app.classes,
    classOther: app.classOther ?? '',
    experienceYears: app.experienceYears ?? '',
    experienceOrg: app.experienceOrg ?? '',
    experienceDetails: app.experienceDetails ?? '',
    whatsapp: app.whatsapp,
    email: app.email,
  }
}

/** Read-only view of the documents behind the verification — no replace/delete controls by design. */
function ProtectedDocuments({ app }: { app: MyCandidateApplication }) {
  const docs = [
    { label: 'Resume / CV', path: app.degreeDocumentPath, required: true },
    { label: 'Experience letter', path: app.experienceDocumentPath, required: app.isFresher === 'no' },
    { label: 'Police verification certificate', path: app.policeVerificationPath, required: app.teachWhere.includes('home_tuition') },
  ]
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-mint/30 p-5">
      <div className="flex items-center gap-2">
        <LockIcon size={16} className="text-teal-deep" />
        <p className="text-sm font-extrabold text-navy">Verification & documents (read-only)</p>
      </div>
      <p className="flex items-center gap-2 text-sm font-semibold text-teal-deep">
        <CheckCircleIcon size={16} />
        Profile verified{app.approvedAt ? ` on ${formatShortDate(app.approvedAt)}` : ''}
      </p>
      <ul className="flex flex-col gap-2 text-sm">
        {docs.map((d) => (
          <li key={d.label} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5">
            <span className="font-semibold text-navy">{d.label}</span>
            <span className="text-xs text-body">
              {d.path ? 'On file — under review' : d.required ? 'Reviewed and securely deleted after verification' : 'Not required'}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-relaxed text-body">
        Documents can&rsquo;t be uploaded, replaced or deleted from this page. To submit new documents — for example to add
        teaching experience or home tuition — use{' '}
        <Link to="/candidate-registration" className="font-semibold text-teal-deep hover:underline">
          Update &amp; Resubmit Registration
        </Link>
        , which goes through review by the TeachingCareer team.
      </p>
    </div>
  )
}

function EditForm({ app }: { app: MyCandidateApplication }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useUserAuth()
  const updateProfile = useUpdateCandidateProfile()
  const [formError, setFormError] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultsFrom(app) })

  const subjects = watch('subjects') ?? []
  const classes = watch('classes') ?? []
  const about = watch('about') ?? ''
  const newPhoto = watch('profilePhoto')?.[0]
  const newPhotoUrl = usePreviewUrl(newPhoto)
  const photoPreview = newPhoto ? newPhotoUrl : removePhoto ? '' : app.profilePhotoPath ?? ''
  const publicUrl = `/candidate-profiles/${app.publishedCandidateId}`

  function onSubmit(values: FormValues) {
    setFormError(null)
    const fd = new FormData()
    for (const key of TEXT_FIELDS) fd.set(key, values[key] ?? '')
    fd.set('subjects', JSON.stringify(values.subjects ?? []))
    fd.set('classes', JSON.stringify(values.classes ?? []))
    fd.set('skills', JSON.stringify(values.skills.split(',').map((s) => s.trim()).filter(Boolean)))
    if (newPhoto) fd.set('profilePhoto', newPhoto)
    else if (removePhoto) fd.set('removeProfilePhoto', 'true')

    updateProfile.mutate(fd, {
      onSuccess: () => {
        showToast({ variant: 'success', title: 'Profile updated', description: 'Your changes are now live on your public profile.' })
        navigate(publicUrl)
      },
      onError: (err) => {
        const { fields, message } = serverErrors(err)
        for (const [name, msg] of Object.entries(fields)) setError(name as keyof FormValues, { message: msg })
        setFormError(message)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
      {formError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{formError}</p> : null}

      <div className="flex flex-col gap-5">
        <FormSectionTitle>Public Profile</FormSectionTitle>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-mint text-teal-deep">
            {photoPreview ? <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover object-top" /> : <PersonIcon size={36} />}
          </span>
          <div className="flex flex-col gap-2">
            <FileField
              id="profilePhoto"
              label="Profile Picture"
              optional
              placeholder={newPhoto ? undefined : 'Choose a new photo'}
              hint="JPG, PNG or WEBP (Max 2MB)"
              accept="image/png,image/jpeg,image/webp"
              fileName={newPhoto?.name}
              {...register('profilePhoto', { onChange: () => setRemovePhoto(false) })}
            />
            {app.profilePhotoPath && !newPhoto ? (
              <label className="flex items-center gap-2 text-xs font-semibold text-body">
                <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} className="h-4 w-4 accent-teal" />
                Remove current photo
              </label>
            ) : null}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField id="fullName" label="Full Name" required error={errors.fullName?.message} {...register('fullName')} />
          <SelectField id="city" label="City" required options={CANDIDATE_CITIES.map((c) => ({ label: c, value: c }))} error={errors.city?.message} {...register('city')} />
          <TextField id="area" label="Area / Address" required error={errors.area?.message} {...register('area')} />
        </div>
        <TextareaField
          id="about"
          label="About Me"
          optional
          rows={4}
          maxLength={1000}
          placeholder="A short introduction schools and parents will see on your profile…"
          error={errors.about?.message}
          {...register('about')}
        />
        <p className="-mt-3 text-right text-xs text-body">{about.length}/1000</p>
        <TextField
          id="skills"
          label="Skills"
          optional
          placeholder="e.g. Classroom management, Lesson planning, MS Office"
          error={errors.skills?.message}
          {...register('skills')}
        />
        <p className="-mt-3 text-xs text-body">Separate skills with commas (up to 20).</p>
      </div>

      <div className="flex flex-col gap-5">
        <FormSectionTitle>Education</FormSectionTitle>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField id="qualification" label="Highest Qualification" required options={QUALIFICATIONS.map((q) => ({ label: q, value: q }))} error={errors.qualification?.message} {...register('qualification')} />
          <TextField id="degreeName" label="Degree / Qualification Name" required error={errors.degreeName?.message} {...register('degreeName')} />
          <TextField id="major" label="Field / Major" required error={errors.major?.message} {...register('major')} />
          <TextField id="institute" label="University / Institute" required error={errors.institute?.message} {...register('institute')} />
          <TextField id="completionYear" label="Completion Year" optional placeholder="e.g. 2022" error={errors.completionYear?.message} {...register('completionYear')} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <FormSectionTitle>Teaching</FormSectionTitle>
        <ChoiceChipGroup legend="Subjects you teach" required error={errors.subjects?.message}>
          {SUBJECTS.map((s) => (
            <ChoiceChip key={s.value} id={`subj-${s.value}`} value={s.value} label={s.label} {...register('subjects')} />
          ))}
        </ChoiceChipGroup>
        {subjects.includes('other') ? <TextField id="subjectOther" label="Other subject" error={errors.subjectOther?.message} {...register('subjectOther')} /> : null}
        <ChoiceChipGroup legend="Classes / grades you teach">
          {CLASSES.map((c) => (
            <ChoiceChip key={c.value} id={`cls-${c.value}`} value={c.value} label={c.label} {...register('classes')} />
          ))}
        </ChoiceChipGroup>
        {classes.includes('other') ? <TextField id="classOther" label="Other class / grade" error={errors.classOther?.message} {...register('classOther')} /> : null}

        {app.isFresher === 'no' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="experienceYears" label="Total Teaching Experience" placeholder="e.g. 3 Years" error={errors.experienceYears?.message} {...register('experienceYears')} />
            <TextField id="experienceOrg" label="Previous School / Organization" error={errors.experienceOrg?.message} {...register('experienceOrg')} />
            <TextareaField id="experienceDetails" label="Experience Details" wrapperClassName="sm:col-span-2" error={errors.experienceDetails?.message} {...register('experienceDetails')} />
          </div>
        ) : (
          <p className="rounded-xl bg-mint/50 px-4 py-3 text-sm text-body">
            Your profile is listed as <strong className="text-navy">Fresher</strong>. Adding teaching experience requires an experience
            letter, so it&rsquo;s done by resubmitting your registration for review.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <FormSectionTitle>Private Contact Details</FormSectionTitle>
        <p className="-mt-2 flex items-center gap-2 text-xs text-body">
          <ShieldIcon size={13} className="text-teal-deep" />
          Never shown publicly — only TeachingCareer uses these to contact you.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField id="whatsapp" label="Phone / WhatsApp" type="tel" required error={errors.whatsapp?.message} {...register('whatsapp')} />
          <TextField id="email" label="Contact Email" type="email" required error={errors.email?.message} {...register('email')} />
          <TextField id="loginEmail" label="Login Email" value={user?.email ?? ''} disabled readOnly />
        </div>
      </div>

      <ProtectedDocuments app={app} />

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
        >
          {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
        </button>
        <Link to={publicUrl} className="rounded-full border-2 border-line px-6 py-3 text-sm font-bold text-navy transition hover:bg-mint/40">
          Cancel
        </Link>
      </div>
    </form>
  )
}

function EditCandidateProfileContent() {
  const { data: app, isPending } = useMyCandidateApplication()

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </div>
    )
  }

  if (!app || !app.publishedCandidateId || app.applicationStatus !== 'Verified') {
    const underReview = app && ['New', 'Reviewed', 'Resubmitted'].includes(app.applicationStatus)
    return (
      <FormCard>
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldIcon size={28} className="text-teal-deep" />
          <h2 className="text-lg font-extrabold text-navy">
            {underReview ? 'Your registration is under review' : 'Your profile isn’t published yet'}
          </h2>
          <p className="max-w-md text-sm text-body">
            {underReview
              ? 'You can edit your public profile again once the TeachingCareer team has verified your latest changes.'
              : 'Profile editing becomes available once your candidate registration has been verified.'}
          </p>
          <Button to="/candidate-registration">Go to Candidate Registration</Button>
        </div>
      </FormCard>
    )
  }

  return (
    <FormCard>
      <EditForm key={app.id} app={app} />
    </FormCard>
  )
}

export default function EditCandidateProfile() {
  return (
    <>
      <Helmet>
        <title>Edit Candidate Profile — TeachingCareer</title>
      </Helmet>
      <Breadcrumb items={[{ label: 'My Profile', to: '/profile' }, { label: 'Edit Candidate Profile' }]} />
      <PageHero eyebrow="Candidate Profile" title="Edit Your Profile" text="Update the information schools and parents see on your public profile." />
      <section className="py-16">
        <div className="tc-container">
          <RequireLogin activity="edit your candidate profile">
            <EditCandidateProfileContent />
          </RequireLogin>
        </div>
      </section>
    </>
  )
}
