import { Helmet } from 'react-helmet-async'
import { useAdminReports } from '@/admin/adminQueries'
import { BarChart } from '@/admin/components/charts/BarChart'
import { LineChart } from '@/admin/components/charts/LineChart'
import { SpinnerIcon } from '@/components/icons/admin'
import { RequireCapability } from '@/admin/components/RequireCapability'

const SUBMISSION_SERIES = [
  { key: 'candidateApplications', label: 'Candidate Applications', colorClass: 'stroke-teal', dotClass: 'bg-teal' },
  { key: 'schoolRegistrations', label: 'School Registrations', colorClass: 'stroke-navy', dotClass: 'bg-navy' },
  { key: 'homeTutorRequests', label: 'Home Tutor Requests', colorClass: 'stroke-teal-dark', dotClass: 'bg-teal-dark' },
  { key: 'contactMessages', label: 'Contact Messages', colorClass: 'stroke-navy-soft', dotClass: 'bg-navy-soft' },
  { key: 'vacancyApplications', label: 'Vacancy Applications', colorClass: 'stroke-body', dotClass: 'bg-body' },
]

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-tc">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-body">{title}</h2>
      {children}
    </div>
  )
}

export default function AdminReports() {
  const { data, isPending } = useAdminReports()

  return (
    <RequireCapability capability="viewReports">
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Reports — Admin — TeachingCareer</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">Reports &amp; Analytics</h1>
        <p className="text-sm text-body">Submission trends and content breakdowns from live data.</p>
      </div>

      {isPending || !data ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading reports…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Submissions — Last 30 Days">
            <LineChart data={data.submissionsByDay} xKey="date" series={SUBMISSION_SERIES} />
          </Card>
          <Card title="Candidate Applications by Status">
            <BarChart data={data.applicationsByStatus} />
          </Card>
          <Card title="Vacancies by City">
            <BarChart data={data.vacanciesByCity} />
          </Card>
          <Card title="Vacancies by Employment Type">
            <BarChart data={data.vacanciesByEmploymentType} />
          </Card>
          <Card title="Schools by Curriculum">
            <BarChart data={data.schoolsByCurriculum} />
          </Card>
          <Card title="Candidates by City">
            <BarChart data={data.candidatesByCity} />
          </Card>
        </div>
      )}
    </div>
    </RequireCapability>
  )
}
