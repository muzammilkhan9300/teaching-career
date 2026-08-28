import { useEffect, useState } from 'react'
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
import { useMySchoolRegistration, useMyVacancies } from '@/lib/queries'

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

  const { data: myRegistration } = useMySchoolRegistration()
  const hasPublishedSchool = Boolean(myRegistration?.publishedSchoolId)
  const { data: myVacancies } = useMyVacancies(hasPublishedSchool)

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
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-tc">
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

            {hasPublishedSchool ? (
              <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-mint/50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-deep shadow-tc">
                    <BriefcaseIcon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-navy">{myRegistration?.schoolName}</p>
                    <p className="text-xs text-body">
                      {myVacancies?.length ?? 0} {(myVacancies?.length ?? 0) === 1 ? 'vacancy' : 'vacancies'} posted
                    </p>
                  </div>
                </div>
                <Button to="/manage-vacancies" variant="outline" className="shrink-0 px-4 py-2 text-xs">
                  Manage Vacancies
                </Button>
              </div>
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
