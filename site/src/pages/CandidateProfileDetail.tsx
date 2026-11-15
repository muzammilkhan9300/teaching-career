import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FormCard } from '@/components/ui/FormCard'
import { Button } from '@/components/ui/Button'
import { useCandidate, useMyCandidateApplication } from '@/lib/queries'
import { CandidatePhoto } from '@/components/ui/CandidatePhoto'
import { CapIcon, CheckCircleIcon, ChevronRightIcon, ClockIcon, LockIcon, PinIcon, ShieldIcon } from '@/components/icons'
import { EditIcon } from '@/components/icons/admin'
import { ApiError } from '@/lib/api'
import { useUserAuth } from '@/auth/UserAuthContext'

const NOT_AUTHORIZED = 'You are not authorized to edit this profile. You can only edit the candidate profile linked to your own account.'

export default function CandidateProfileDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: candidate, isPending, isError, error, refetch } = useCandidate(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, isLoading: authLoading, can } = useUserAuth()
  // Admins (manageContent) may edit any candidate's profile; the server re-checks the role on every request.
  const canAdminEdit = isAuthenticated && can('manageContent')
  // Owner check is UI-only (decides where the Edit button leads); the server
  // independently resolves the editable profile from the session on every
  // update and never accepts a candidate id, so this can't be bypassed.
  const { data: myApplication, isPending: myAppPending, error: myAppError } = useMyCandidateApplication()
  const isOwner = Boolean(candidate) && Boolean(id) && myApplication?.publishedCandidateId === id
  const sessionExpired = myAppError instanceof ApiError && myAppError.status === 401
  const checkingOwner = isAuthenticated && myAppPending && !sessionExpired
  const [editNotice, setEditNotice] = useState<string | null>(null)
  const wantsEdit = searchParams.get('edit') === '1'

  function goToLogin(expired: boolean) {
    // Come back to this exact profile, with ?edit=1 so the form opens automatically for its owner.
    if (expired) void queryClient.resetQueries({ queryKey: ['user', 'me'] })
    navigate('/login', { state: { from: `/candidate-profiles/${id}?edit=1`, sessionExpired: expired } })
  }

  function handleEditClick() {
    setEditNotice(null)
    if (!isAuthenticated || sessionExpired) {
      goToLogin(sessionExpired)
      return
    }
    if (checkingOwner) return
    if (isOwner) navigate('/profile/candidate/edit')
    else if (canAdminEdit) navigate(`/candidate-profiles/${id}/edit`)
    else setEditNotice(NOT_AUTHORIZED)
  }

  // Returning from login with ?edit=1: open the form for the owner, explain otherwise.
  useEffect(() => {
    if (!wantsEdit || !candidate || authLoading || checkingOwner) return
    if (isAuthenticated && !sessionExpired && isOwner) {
      // replace, so Back from the form returns to the profile rather than re-triggering this.
      navigate('/profile/candidate/edit', { replace: true })
      return
    }
    if (isAuthenticated && !sessionExpired && canAdminEdit) {
      navigate(`/candidate-profiles/${id}/edit`, { replace: true })
      return
    }
    if (isAuthenticated && !sessionExpired) setEditNotice(NOT_AUTHORIZED)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('edit')
        return next
      },
      { replace: true },
    )
  }, [wantsEdit, candidate, authLoading, checkingOwner, isAuthenticated, sessionExpired, isOwner, canAdminEdit, id, navigate, setSearchParams])

  if (isPending) {
    return (
      <section className="tc-container flex min-h-[50vh] items-center justify-center py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </section>
    )
  }

  if (isError && !(error instanceof ApiError && error.status === 404)) {
    return (
      <section className="tc-container flex flex-col items-center gap-4 py-24 text-center" role="alert">
        <h1 className="text-2xl font-extrabold text-navy">Candidate Profile Could Not Be Loaded</h1>
        <p className="max-w-md text-body">Check your connection and try loading this profile again.</p>
        <Button onClick={() => void refetch()}>Retry</Button>
      </section>
    )
  }

  if (!candidate) {
    return (
      <section className="tc-container flex flex-col items-center gap-4 py-24 text-center">
        <Helmet>
          <title>Candidate Not Found — TeachingCareer</title>
        </Helmet>
        <h1 className="text-2xl font-extrabold text-navy">Candidate Not Available</h1>
        <p className="max-w-md text-body">This candidate profile isn&rsquo;t available in this demo build, or the link may be incorrect.</p>
        <Button to="/candidate-profiles" icon={<ChevronRightIcon size={15} />}>
          Browse Candidate Profiles
        </Button>
      </section>
    )
  }

  return (
    <>
      <Helmet>
        <title>{candidate.name} — Candidate Profile — TeachingCareer</title>
        <meta name="description" content={`${candidate.name}, ${candidate.role}, on TeachingCareer.`} />
      </Helmet>

      <Breadcrumb items={[{ label: 'Profiles', to: '/candidate-profiles' }, { label: candidate.name }]} />

      <section className="py-16">
        <div className="tc-container">
          <FormCard>
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="h-36 w-27 shrink-0 overflow-hidden rounded-2xl bg-mint">
                <CandidatePhoto src={candidate.photo} alt={candidate.name} iconSize={40} />
              </div>
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-extrabold text-navy">{candidate.name}</h1>
                  {candidate.verified ? (
                    <span className="flex items-center gap-1 rounded-full bg-badge px-3 py-1 text-xs font-bold text-teal-deep">
                      <CheckCircleIcon size={13} />
                      Verified
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-teal-deep">{candidate.role}</p>
                {isOwner ? (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-body">
                    <ShieldIcon size={13} className="shrink-0 text-teal-deep" />
                    This is your public profile.
                  </p>
                ) : canAdminEdit ? (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-body">
                    <ShieldIcon size={13} className="shrink-0 text-teal-deep" />
                    You can edit this profile as an admin.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleEditClick}
                disabled={checkingOwner}
                aria-describedby={editNotice ? 'edit-profile-notice' : undefined}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-white shadow-tc transition hover:-translate-y-0.5 hover:bg-teal-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/30 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 sm:ml-auto sm:w-auto"
              >
                <EditIcon size={15} />
                {checkingOwner ? 'Checking…' : 'Edit Profile'}
              </button>
            </div>

            {editNotice ? (
              <div
                id="edit-profile-notice"
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                <LockIcon size={16} className="mt-0.5 shrink-0" />
                <p className="flex-1">{editNotice}</p>
                <button
                  type="button"
                  onClick={() => setEditNotice(null)}
                  className="shrink-0 text-xs font-bold text-red-700 underline-offset-2 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            ) : null}

            {candidate.about ? (
              <>
                <hr className="my-8 border-line" />
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-body">About Me</p>
                  <p className="whitespace-pre-line leading-relaxed text-body">{candidate.about}</p>
                </div>
              </>
            ) : null}

            <hr className="my-8 border-line" />

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <PinIcon size={18} className="mt-0.5 text-teal-deep" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-body">Location</p>
                  <p className="text-sm font-semibold text-navy">
                    {candidate.city}, {candidate.area}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CapIcon size={18} className="mt-0.5 text-teal-deep" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-body">Qualification</p>
                  <p className="text-sm font-semibold text-navy">{candidate.qualification}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClockIcon size={18} className="mt-0.5 text-teal-deep" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-body">Experience</p>
                  <p className="text-sm font-semibold text-navy">{candidate.experience}</p>
                </div>
              </div>
            </div>

            <hr className="my-8 border-line" />

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-body">Teaching Preference</p>
              <div className="flex flex-wrap gap-2">
                {candidate.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-mint px-3 py-1.5 text-xs font-semibold text-teal-deep">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {candidate.skills && candidate.skills.length > 0 ? (
              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-body">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-navy">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <hr className="my-8 border-line" />

            <div className="flex flex-col items-start gap-4 rounded-2xl bg-mint/50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-sm text-body">
                <LockIcon size={16} className="mt-0.5 shrink-0 text-teal-deep" />
                Contact stays with TeachingCareer — phone, WhatsApp, email, and documents are never shown publicly.
              </p>
              <Button to="/home-tutor" icon={<ChevronRightIcon size={15} />} className="w-full sm:w-auto">
                Contact TeachingCareer
              </Button>
            </div>
          </FormCard>
        </div>
      </section>
    </>
  )
}
