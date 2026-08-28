import { Helmet } from 'react-helmet-async'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { RequireLogin } from '@/components/auth/RequireLogin'
import { Button } from '@/components/ui/Button'
import { useMySchoolRegistration } from '@/lib/queries'
import { VacancyManager } from '@/components/school-owner/VacancyManager'
import { ChevronRightIcon, ShieldIcon } from '@/components/icons'

function ManageVacanciesContent() {
  const { data: myRegistration, isLoading: isLoadingRegistration } = useMySchoolRegistration()
  const hasPublishedSchool = Boolean(myRegistration?.publishedSchoolId)

  if (isLoadingRegistration) {
    return (
      <div className="flex justify-center py-10">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
      </div>
    )
  }

  if (!hasPublishedSchool) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white p-8 text-center shadow-tc">
        <ShieldIcon size={28} className="mx-auto text-teal-deep" />
        <h2 className="mt-3 text-lg font-extrabold text-navy">You don&rsquo;t have an approved school yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-body">
          Vacancy management unlocks once your school registration is approved by our team. Register your school, or
          check its status if you&rsquo;ve already applied.
        </p>
        <Button to="/school-registration" className="mx-auto mt-5" icon={<ChevronRightIcon size={15} />}>
          Go to School Registration
        </Button>
      </div>
    )
  }

  return <VacancyManager />
}

export default function ManageVacancies() {
  return (
    <>
      <Helmet>
        <title>Manage Vacancies — TeachingCareer</title>
      </Helmet>

      <Breadcrumb items={[{ label: 'My Profile', to: '/profile' }, { label: 'Manage Vacancies' }]} />
      <PageHero
        eyebrow="School Owner"
        title="Manage Vacancies"
        text="Post, edit, and remove the teaching vacancies shown on your school's public profile."
      />

      <section className="py-16">
        <div className="tc-container">
          <RequireLogin activity="manage your school's vacancies">
            <ManageVacanciesContent />
          </RequireLogin>
        </div>
      </section>
    </>
  )
}
