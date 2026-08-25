import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FormCard } from '@/components/ui/FormCard'
import { Button } from '@/components/ui/Button'
import { candidates } from '@/data/candidates'
import { CapIcon, CheckCircleIcon, ChevronRightIcon, ClockIcon, LockIcon, PersonIcon, PinIcon } from '@/components/icons'

export default function CandidateProfileDetail() {
  const { id } = useParams<{ id: string }>()
  const candidate = candidates.find((c) => c.id === id)

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
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-mint">
                {candidate.photo ? (
                  <img src={candidate.photo} alt={candidate.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-teal-deep">
                    <PersonIcon size={40} />
                  </div>
                )}
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
              </div>
            </div>

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
