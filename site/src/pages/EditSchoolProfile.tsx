import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { FormCard, FormSectionTitle } from '@/components/ui/FormCard'
import { RequireLogin } from '@/components/auth/RequireLogin'
import { Button } from '@/components/ui/Button'
import { FileField, TextField, TextareaField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { CheckCircleIcon, InfoIcon, LockIcon, ShieldIcon } from '@/components/icons'
import { useAdminSchoolRegistration, useAdminUpdateSchoolProfile, useMySchoolRegistration, useUpdateSchoolProfile } from '@/lib/queries'
import { useUserAuth } from '@/auth/UserAuthContext'
import { ApiError } from '@/lib/api'
import { serverErrors } from '@/lib/formErrors'
import { formatShortDate } from '@/lib/dates'
import { usePreviewUrl } from '@/lib/usePreviewUrl'
import { getSchoolPhoto } from '@/lib/schoolPhoto'
import type { MySchoolRegistration } from '@/types'

interface FormValues {
  schoolName: string
  schoolCity: string
  schoolArea: string
  schoolAddress: string
  schoolWebsite: string
  schoolDesc: string
  schoolFacilities: string // comma-separated in the form, sent as an array
  schoolPhone: string
  schoolWhatsapp: string
  schoolEmail: string
  schoolLogo?: FileList
  schoolCover?: FileList
}

const TEXT_FIELDS = [
  'schoolName', 'schoolCity', 'schoolArea', 'schoolAddress', 'schoolWebsite', 'schoolDesc', 'schoolPhone', 'schoolWhatsapp', 'schoolEmail',
] as const

function defaultsFrom(reg: MySchoolRegistration): FormValues {
  return {
    schoolName: reg.schoolName,
    schoolCity: reg.schoolCity,
    schoolArea: reg.schoolArea,
    schoolAddress: reg.schoolAddress ?? '',
    schoolWebsite: reg.schoolWebsite ?? '',
    schoolDesc: reg.schoolDesc ?? '',
    schoolFacilities: (reg.schoolFacilities ?? []).join(', '),
    schoolPhone: reg.schoolPhone,
    schoolWhatsapp: reg.schoolWhatsapp,
    schoolEmail: reg.schoolEmail ?? '',
  }
}

/** Read-only: the verified registration details and approval status — no document controls by design. */
function ProtectedRegistration({ reg, adminMode }: { reg: MySchoolRegistration; adminMode: boolean }) {
  const rows: [string, string | undefined][] = [
    ['Year established', reg.schoolYear],
    ['Branches', reg.schoolBranches],
    ['School type', reg.schoolType],
    ['Curriculum / board', reg.schoolBoard],
    ['Grade levels', reg.schoolGrades],
  ]
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-mint/30 p-5">
      <div className="flex items-center gap-2">
        <LockIcon size={16} className="text-teal-deep" />
        <p className="text-sm font-extrabold text-navy">Registration & verification (read-only)</p>
      </div>
      <p className="flex items-center gap-2 text-sm font-semibold text-teal-deep">
        <CheckCircleIcon size={16} />
        Registration approved{reg.approvedAt ? ` on ${formatShortDate(reg.approvedAt)}` : ''}
      </p>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5">
            <dt className="text-body">{label}</dt>
            <dd className="font-semibold text-navy">{value || '—'}</dd>
          </div>
        ))}
      </dl>
      {adminMode ? (
        <p className="text-xs leading-relaxed text-body">
          Verified registration details and verification records can&rsquo;t be changed from this page — they&rsquo;re
          reviewed under{' '}
          <Link to="/admin/school-registrations" className="font-semibold text-teal-deep hover:underline">
            Admin → School Registrations
          </Link>
          .
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-body">
          These verified registration details and any verification records can&rsquo;t be changed from this page. To change
          them, use{' '}
          <Link to="/school-registration" className="font-semibold text-teal-deep hover:underline">
            Update &amp; Resubmit Registration
          </Link>
          , which goes through review by the TeachingCareer team.
        </p>
      )}
    </div>
  )
}

function ImagePreview({ src, alt, className }: { src: string; alt: string; className: string }) {
  return src ? <img src={src} alt={alt} className={className} /> : <span className={`${className} flex items-center justify-center text-xs text-body`}>No image</span>
}

function EditForm({ reg, adminMode = false }: { reg: MySchoolRegistration; adminMode?: boolean }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const ownerUpdate = useUpdateSchoolProfile()
  const adminUpdate = useAdminUpdateSchoolProfile(reg.publishedSchoolId ?? '')
  const updateProfile = adminMode ? adminUpdate : ownerUpdate
  const [formError, setFormError] = useState<string | null>(null)
  const [removeCover, setRemoveCover] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultsFrom(reg) })

  const newLogo = watch('schoolLogo')?.[0]
  const newCover = watch('schoolCover')?.[0]
  const logoUrl = usePreviewUrl(newLogo)
  const coverUrl = usePreviewUrl(newCover)
  const nameChanged = watch('schoolName') !== reg.schoolName
  const publicUrl = `/school-profiles/${reg.publishedSchoolId}`

  function onSubmit(values: FormValues) {
    setFormError(null)
    const fd = new FormData()
    for (const key of TEXT_FIELDS) fd.set(key, values[key] ?? '')
    fd.set('schoolFacilities', JSON.stringify(values.schoolFacilities.split(',').map((s) => s.trim()).filter(Boolean)))
    if (newLogo) fd.set('schoolLogo', newLogo)
    if (newCover) fd.set('schoolCover', newCover)
    else if (removeCover) fd.set('removeCoverImage', 'true')

    updateProfile.mutate(fd, {
      onSuccess: () => {
        showToast({
          variant: 'success',
          title: 'School profile updated',
          description: adminMode ? `Changes to ${values.schoolName}'s profile are now live.` : 'Your changes are now live on your public profile.',
        })
        navigate(publicUrl)
      },
      onError: (err) => {
        if (adminMode && err instanceof ApiError && err.status === 401) {
          navigate('/login', { state: { from: `${publicUrl}/edit`, sessionExpired: true } })
          return
        }
        const { fields, message } = serverErrors(err)
        for (const [name, msg] of Object.entries(fields)) setError(name as keyof FormValues, { message: msg })
        setFormError(message)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
      {adminMode ? (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <ShieldIcon size={16} className="mt-0.5 shrink-0" />
          <span>
            You&rsquo;re editing <strong>{reg.schoolName}</strong>&rsquo;s profile as an admin. Changes go live immediately and
            are recorded in the audit log.
          </span>
        </p>
      ) : null}
      {formError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{formError}</p> : null}

      <div className="flex flex-col gap-5">
        <FormSectionTitle>Logo & Cover Image</FormSectionTitle>
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col gap-3">
            <ImagePreview src={newLogo ? logoUrl : getSchoolPhoto(reg.schoolLogoPath || '/assets/images/School.jpg')} alt="Logo preview" className="h-28 w-40 rounded-2xl bg-mint object-cover" />
            <FileField id="schoolLogo" label="School Logo" optional placeholder="Choose a new logo" hint="JPG, PNG or WEBP (Max 5MB)" accept="image/png,image/jpeg,image/webp" fileName={newLogo?.name} {...register('schoolLogo')} />
          </div>
          <div className="flex flex-col gap-3">
            <ImagePreview src={newCover ? coverUrl : removeCover ? '' : reg.schoolCoverPath ?? ''} alt="Cover preview" className="h-28 w-full rounded-2xl bg-mint object-cover" />
            <FileField
              id="schoolCover"
              label="Cover Image"
              optional
              placeholder="Choose a cover image"
              hint="Wide landscape photo of your campus (JPG, PNG or WEBP, max 5MB)"
              accept="image/png,image/jpeg,image/webp"
              fileName={newCover?.name}
              {...register('schoolCover', { onChange: () => setRemoveCover(false) })}
            />
            {reg.schoolCoverPath && !newCover ? (
              <label className="flex items-center gap-2 text-xs font-semibold text-body">
                <input type="checkbox" checked={removeCover} onChange={(e) => setRemoveCover(e.target.checked)} className="h-4 w-4 accent-teal" />
                Remove current cover image
              </label>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <FormSectionTitle>Public Profile</FormSectionTitle>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <TextField id="schoolName" label="School Name" required error={errors.schoolName?.message} {...register('schoolName')} />
            {nameChanged && !adminMode ? (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700">
                <InfoIcon size={13} className="mt-px shrink-0" />
                Name changes are reported to the TeachingCareer team for review.
              </p>
            ) : null}
          </div>
          <TextField id="schoolCity" label="City" required error={errors.schoolCity?.message} {...register('schoolCity')} />
          <TextField id="schoolArea" label="Area" required error={errors.schoolArea?.message} {...register('schoolArea')} />
          <TextField id="schoolAddress" label="School Address" optional wrapperClassName="sm:col-span-2" error={errors.schoolAddress?.message} {...register('schoolAddress')} />
          <TextField id="schoolWebsite" label="Website" optional placeholder="https://yourschool.edu.pk" error={errors.schoolWebsite?.message} {...register('schoolWebsite')} />
        </div>
        <TextareaField
          id="schoolDesc"
          label="About School"
          required
          rows={5}
          maxLength={2000}
          placeholder="Describe your school, its values and what makes it a great place to teach…"
          error={errors.schoolDesc?.message}
          {...register('schoolDesc')}
        />
        <TextField
          id="schoolFacilities"
          label="School Facilities"
          optional
          placeholder="e.g. Science labs, Library, Computer lab, Sports ground"
          error={errors.schoolFacilities?.message}
          {...register('schoolFacilities')}
        />
        <p className="-mt-3 text-xs text-body">Separate facilities with commas (up to 20).</p>
      </div>

      <div className="flex flex-col gap-5">
        <FormSectionTitle>Private Contact Details</FormSectionTitle>
        <p className="-mt-2 flex items-center gap-2 text-xs text-body">
          <ShieldIcon size={13} className="text-teal-deep" />
          Never shown publicly — only TeachingCareer uses these to contact your school.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField id="schoolPhone" label="Contact Number" type="tel" required error={errors.schoolPhone?.message} {...register('schoolPhone')} />
          <TextField id="schoolWhatsapp" label="WhatsApp Number" type="tel" required error={errors.schoolWhatsapp?.message} {...register('schoolWhatsapp')} />
          <TextField id="schoolEmail" label="Email" type="email" optional error={errors.schoolEmail?.message} {...register('schoolEmail')} />
        </div>
      </div>

      <ProtectedRegistration reg={reg} adminMode={adminMode} />

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

function EditSchoolProfileContent() {
  const { data: reg, isPending } = useMySchoolRegistration()

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </div>
    )
  }

  if (!reg || !reg.publishedSchoolId || reg.registrationStatus !== 'Approved') {
    const underReview = reg && ['Pending', 'Resubmitted'].includes(reg.registrationStatus)
    return (
      <FormCard>
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldIcon size={28} className="text-teal-deep" />
          <h2 className="text-lg font-extrabold text-navy">
            {underReview ? 'Your registration is under review' : 'Your school profile isn’t published yet'}
          </h2>
          <p className="max-w-md text-sm text-body">
            {underReview
              ? 'You can edit your school profile again once the TeachingCareer team has approved your latest changes.'
              : 'Profile editing becomes available once your school registration has been approved.'}
          </p>
          <Button to="/school-registration">Go to School Registration</Button>
        </div>
      </FormCard>
    )
  }

  return (
    <FormCard>
      <EditForm key={reg.id} reg={reg} />
    </FormCard>
  )
}

function AdminEditSchoolContent({ schoolId }: { schoolId: string }) {
  const { can, isLoading: authLoading } = useUserAuth()
  const allowed = can('manageContent')
  const { data: reg, isPending, error } = useAdminSchoolRegistration(allowed ? schoolId : undefined)

  if (authLoading || (allowed && isPending)) {
    return (
      <div className="flex justify-center py-10">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </div>
    )
  }
  if (error instanceof ApiError && error.status === 401) {
    return <Navigate to="/login" replace state={{ from: `/school-profiles/${schoolId}/edit`, sessionExpired: true }} />
  }

  const notice = (title: string, text: string, to: string, label: string) => (
    <FormCard>
      <div className="flex flex-col items-center gap-4 text-center" role="alert">
        <ShieldIcon size={28} className="text-teal-deep" />
        <h2 className="text-lg font-extrabold text-navy">{title}</h2>
        <p className="max-w-md text-sm text-body">{text}</p>
        <Button to={to}>{label}</Button>
      </div>
    </FormCard>
  )

  if (!allowed || (error instanceof ApiError && error.status === 403)) {
    return notice(
      'You are not authorized to edit this profile',
      'Only the school that owns this profile, or a TeachingCareer admin, can edit it.',
      `/school-profiles/${schoolId}`,
      'Back to Profile',
    )
  }
  if (error || !reg) {
    const message = error instanceof ApiError ? error.message : 'This profile could not be loaded.'
    return notice('This profile can’t be edited here', message, '/admin/schools', 'Go to Admin → Schools')
  }
  if (reg.registrationStatus !== 'Approved') {
    return notice(
      'Changes are awaiting review',
      'This school has resubmitted its registration. Approve or reject it first, then the profile can be edited.',
      '/admin/school-registrations',
      'Review School Registrations',
    )
  }
  return (
    <FormCard>
      <EditForm key={reg.id} reg={reg} adminMode />
    </FormCard>
  )
}

export default function EditSchoolProfile() {
  // /school-profiles/:id/edit = an admin editing any school; /profile/school/edit = the owner's own.
  const { id: adminSchoolId } = useParams<{ id: string }>()
  if (adminSchoolId) {
    return (
      <>
        <Helmet>
          <title>Edit School Profile (Admin) — TeachingCareer</title>
        </Helmet>
        <Breadcrumb
          items={[
            { label: 'Schools', to: '/school-profiles' },
            { label: 'Profile', to: `/school-profiles/${adminSchoolId}` },
            { label: 'Edit' },
          ]}
        />
        <PageHero eyebrow="Admin" title="Edit School Profile" text="Update the information candidates see on this school's public profile." />
        <section className="py-16">
          <div className="tc-container">
            <RequireLogin activity="edit this school profile">
              <AdminEditSchoolContent schoolId={adminSchoolId} />
            </RequireLogin>
          </div>
        </section>
      </>
    )
  }
  return (
    <>
      <Helmet>
        <title>Edit School Profile — TeachingCareer</title>
      </Helmet>
      <Breadcrumb items={[{ label: 'My Profile', to: '/profile' }, { label: 'Edit School Profile' }]} />
      <PageHero eyebrow="School Profile" title="Edit Your School Profile" text="Update the information candidates see on your school’s public profile." />
      <section className="py-16">
        <div className="tc-container">
          <RequireLogin activity="edit your school profile">
            <EditSchoolProfileContent />
          </RequireLogin>
        </div>
      </section>
    </>
  )
}
