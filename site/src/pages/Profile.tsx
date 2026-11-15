import { useEffect, useState, type ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { TextField } from '@/components/ui/FormFields'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { PersonIcon, LogOutIcon, ShieldIcon, BriefcaseIcon } from '@/components/icons'
import { useUserAuth } from '@/auth/UserAuthContext'
import { useMyCandidateApplication, useMySchoolRegistration, useMyVacancies } from '@/lib/queries'
import { EditIcon } from '@/components/icons/admin'
import type { MyCandidateApplication, MySchoolRegistration } from '@/types'

type Tone = 'live' | 'review' | 'changes' | 'none'

const TONE_CLASSES: Record<Tone, string> = {
  live: 'bg-mint text-teal-deep',
  review: 'bg-amber-50 text-amber-700',
  changes: 'bg-red-50 text-red-600',
  none: 'bg-slate-100 text-slate-600',
}

/** One "where do I stand" card on the account page: status + the next action. */
function StatusCard({
  icon: Icon,
  title,
  status,
  tone,
  text,
  children,
}: {
  icon: typeof PersonIcon
  title: string
  status: string
  tone: Tone
  text: string
  children: ReactNode
}) {
  return (
    <div className="mb-4 rounded-2xl border border-line bg-mint/30 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-deep shadow-tc">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-extrabold text-navy">{title}</p>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TONE_CLASSES[tone]}`}>{status}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-body">{text}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 pl-[52px]">{children}</div>
    </div>
  )
}

const smallButton = 'px-4 py-2 text-xs'

function CandidateCard({ app, loading }: { app: MyCandidateApplication | null | undefined; loading: boolean }) {
  if (loading) return null
  if (!app) {
    return (
      <StatusCard icon={PersonIcon} title="Candidate profile" status="Not registered" tone="none" text="Register as a teaching candidate to get a public profile you can edit any time after verification.">
        <Button to="/candidate-registration" className={smallButton}>Register as a Candidate</Button>
      </StatusCard>
    )
  }
  if (app.applicationStatus === 'Verified' && app.publishedCandidateId) {
    return (
      <StatusCard icon={PersonIcon} title="Candidate profile" status="Verified" tone="live" text="Your profile is live. Edit your photo, about me, skills, education and contact details at any time.">
        <Button to="/profile/candidate/edit" icon={<EditIcon size={13} />} className={smallButton}>Edit Profile</Button>
        <Button to={`/candidate-profiles/${app.publishedCandidateId}`} variant="outline" className={smallButton}>View Public Profile</Button>
      </StatusCard>
    )
  }
  if (app.applicationStatus === 'Rejected') {
    return (
      <StatusCard icon={PersonIcon} title="Candidate profile" status="Needs changes" tone="changes" text="Your registration needs changes before it can be verified. Review the feedback, update it and resubmit.">
        <Button to="/candidate-registration" className={smallButton}>Update &amp; Resubmit</Button>
      </StatusCard>
    )
  }
  return (
    <StatusCard icon={PersonIcon} title="Candidate profile" status="Under review" tone="review" text="The TeachingCareer team is reviewing your registration. You'll be able to edit your profile once it's verified.">
      <Button to="/candidate-registration" variant="outline" className={smallButton}>View Application</Button>
    </StatusCard>
  )
}

function SchoolCard({ reg, loading, vacancyCount }: { reg: MySchoolRegistration | null | undefined; loading: boolean; vacancyCount: number | null }) {
  if (loading) return null
  if (!reg) {
    return (
      <StatusCard icon={BriefcaseIcon} title="School profile" status="Not registered" tone="none" text="Running a school? Register it to get a public school profile and post vacancies.">
        <Button to="/school-registration" variant="outline" className={smallButton}>Register Your School</Button>
      </StatusCard>
    )
  }
  if (reg.registrationStatus === 'Approved' && reg.publishedSchoolId) {
    return (
      <StatusCard
        icon={BriefcaseIcon}
        title={reg.schoolName}
        status="Approved"
        tone="live"
        text={`Your school profile is live · ${vacancyCount ?? 0} ${(vacancyCount ?? 0) === 1 ? 'vacancy' : 'vacancies'} posted.`}
      >
        <Button to="/profile/school/edit" icon={<EditIcon size={13} />} className={smallButton}>Edit School Profile</Button>
        <Button to={`/school-profiles/${reg.publishedSchoolId}`} variant="outline" className={smallButton}>View Public Profile</Button>
        <Button to="/manage-vacancies" variant="outline" className={smallButton}>Manage Vacancies</Button>
      </StatusCard>
    )
  }
  if (reg.registrationStatus === 'Rejected') {
    return (
      <StatusCard icon={BriefcaseIcon} title={reg.schoolName} status="Needs changes" tone="changes" text="Your school registration needs changes before it can be approved. Review the feedback, update it and resubmit.">
        <Button to="/school-registration" className={smallButton}>Update &amp; Resubmit</Button>
      </StatusCard>
    )
  }
  return (
    <StatusCard icon={BriefcaseIcon} title={reg.schoolName} status="Under review" tone="review" text="The TeachingCareer team is reviewing your school registration. You'll be able to edit your profile once it's approved.">
      <Button to="/school-registration" variant="outline" className={smallButton}>View Registration</Button>
    </StatusCard>
  )
}

const ROLE_LABELS: Record<string, string> = {
  user: 'Normal User',
  moderator: 'Moderator',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

export default function Profile() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user, isLoading, isAuthenticated, logout, updateProfile } = useUserAuth()
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const { data: myRegistration, isLoading: registrationLoading } = useMySchoolRegistration()
  const hasPublishedSchool = Boolean(myRegistration?.publishedSchoolId) && myRegistration?.registrationStatus === 'Approved'
  const { data: myVacancies } = useMyVacancies(hasPublishedSchool)
  const { data: myApplication, isLoading: applicationLoading } = useMyCandidateApplication()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login')
  }, [isLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (user) setName(user.name)
  }, [user])

  if (isLoading || !user) {
    return (
      <section className="tc-container flex min-h-[50vh] items-center justify-center py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </section>
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateProfile({ name })
      showToast({ variant: 'success', title: 'Profile updated' })
    } catch (error) {
      showToast({ variant: 'error', title: 'Update failed', description: error instanceof ApiError ? error.message : undefined })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>My Profile — TeachingCareer</title>
      </Helmet>

      <Breadcrumb items={[{ label: 'My Profile' }]} />
      <PageHero eyebrow="Your Account" title="My Profile" />

      <section className="py-16">
        <div className="tc-container flex justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-line bg-white p-6 shadow-tc sm:p-8">
            <div className="mb-6 flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-mint text-teal-deep">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <PersonIcon size={28} />
                )}
              </span>
              <div>
                <p className="text-lg font-extrabold text-navy">{user.name}</p>
                <p className="text-sm text-body">{user.email}</p>
                <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-badge px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-deep">
                  <ShieldIcon size={12} />
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </div>
            </div>

            {user.role !== 'user' ? (
              <Button to="/admin" className="mb-6 w-full justify-center">
                Go to Admin Dashboard
              </Button>
            ) : null}

            {/* Always shown to regular accounts (and to staff who happen to have a
                registration), so every user can see where they stand and how to
                edit — not only once they're verified. */}
            {user.role === 'user' || myApplication ? (
              <CandidateCard app={myApplication} loading={applicationLoading} />
            ) : null}
            {user.role === 'user' || myRegistration ? (
              <SchoolCard reg={myRegistration} loading={registrationLoading} vacancyCount={hasPublishedSchool ? (myVacancies?.length ?? 0) : null} />
            ) : null}

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <TextField id="profile-name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <TextField id="profile-email" label="Email" value={user.email} disabled />

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => logout()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-line px-8 py-3 text-sm font-semibold text-navy transition hover:bg-mint/40"
            >
              <LogOutIcon size={16} />
              Log Out
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
