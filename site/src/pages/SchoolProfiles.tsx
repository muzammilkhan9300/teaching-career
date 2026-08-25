import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { SchoolCard } from '@/components/sections/SchoolCard'
import { Pagination } from '@/components/ui/Pagination'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useSchools } from '@/lib/queries'

const PER_PAGE = 4

export default function SchoolProfiles() {
  const [page, setPage] = useState(1)
  const { data: schools, isPending } = useSchools()

  useEffect(() => {
    setPage(1)
  }, [schools?.length])

  const totalPages = Math.max(1, Math.ceil((schools?.length ?? 0) / PER_PAGE))
  const pageSchools = (schools ?? []).slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <>
      <Helmet>
        <title>School Profiles — TeachingCareer</title>
        <meta name="description" content="Browse registered school profiles on TeachingCareer." />
        <link rel="canonical" href="https://www.teachingcareer.pk/school-profiles" />
      </Helmet>

      <Breadcrumb items={[{ label: 'Profiles', to: '/candidate-profiles' }, { label: 'School Profiles' }]} />
      <PageHero
        eyebrow="School Profiles"
        title="Our Registered Schools"
        text="Explore registered schools on TeachingCareer and their active teaching vacancies."
      />

      <section className="py-16">
        <div className="tc-container flex flex-col gap-8">
          {isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pageSchools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>
    </>
  )
}
