import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { CandidateCard } from '@/components/sections/CandidateCard'
import { Pagination } from '@/components/ui/Pagination'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useCandidateFilterOptions, useCandidates } from '@/lib/queries'
import { SearchIcon } from '@/components/icons'

const PER_PAGE = 4

export default function CandidateProfiles() {
  const [city, setCity] = useState('All Cities')
  const [teachingType, setTeachingType] = useState('All Teaching Types')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [city, teachingType, debouncedSearch])

  const filterOptions = useCandidateFilterOptions()
  const candidatesQuery = useCandidates({ city, teachingType, search: debouncedSearch, page })

  const cities = filterOptions.data?.cities ?? ['All Cities']
  const teachingTypes = filterOptions.data?.teachingTypes ?? ['All Teaching Types']
  const data = candidatesQuery.data
  const isLoading = candidatesQuery.isPending

  return (
    <>
      <Helmet>
        <title>Candidate Profiles — TeachingCareer</title>
        <meta name="description" content="Browse verified teaching candidate profiles on TeachingCareer." />
        <link rel="canonical" href="https://www.teachingcareer.pk/candidate-profiles" />
      </Helmet>

      <Breadcrumb items={[{ label: 'Profiles', to: '/candidate-profiles' }, { label: 'Candidate Profiles' }]} />
      <PageHero
        eyebrow="Candidate Profiles"
        title="Meet Our Verified Teaching Candidates"
        text="Browse candidates by city and teaching preference, or search by name, role, or qualification."
      />

      <section className="py-16">
        <div className="tc-container flex flex-col gap-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-tc sm:flex-row sm:items-center sm:p-5">
            <div className="relative flex-1">
              <SearchIcon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-body" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates by name, role, or qualification…"
                className="w-full rounded-xl border border-line py-2.5 pl-11 pr-4 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
              />
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={teachingType}
              onChange={(e) => setTeachingType(e.target.value)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
            >
              {teachingTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.items.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-body">
              No candidates match your filters. Try adjusting your search.
            </p>
          )}

          <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
        </div>
      </section>
    </>
  )
}
