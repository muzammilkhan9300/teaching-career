import { Helmet } from 'react-helmet-async'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { BlogCard } from '@/components/sections/BlogCard'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useBlogPosts } from '@/lib/queries'

export default function Blog() {
  const { data: blogPosts, isPending } = useBlogPosts()

  return (
    <>
      <Helmet>
        <title>Blog — TeachingCareer</title>
        <meta name="description" content="Tips and guidance for schools, teachers, and parents from the TeachingCareer team." />
        <link rel="canonical" href="https://www.teachingcareer.pk/blog" />
      </Helmet>

      <Breadcrumb items={[{ label: 'Blogs' }]} />
      <PageHero
        eyebrow="Our Blog"
        title="Insights for Schools, Teachers & Parents"
        text="Practical guidance on hiring, teaching careers, home tuition, and how TeachingCareer verifies every candidate."
      />

      <section className="py-16">
        <div className="tc-container grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : blogPosts?.map((post) => <BlogCard key={post.slug} post={post} />)}
        </div>
      </section>
    </>
  )
}
