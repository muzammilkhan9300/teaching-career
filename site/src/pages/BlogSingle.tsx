import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FormCard } from '@/components/ui/FormCard'
import { Button } from '@/components/ui/Button'
import { blogPosts } from '@/data/blogPosts'
import { ChevronRightIcon } from '@/components/icons'

export default function BlogSingle() {
  const { slug } = useParams<{ slug: string }>()
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <section className="tc-container flex flex-col items-center gap-4 py-24 text-center">
        <Helmet>
          <title>Article Not Found — TeachingCareer</title>
        </Helmet>
        <h1 className="text-2xl font-extrabold text-navy">Article Not Available</h1>
        <p className="max-w-md text-body">This article isn&rsquo;t available, or the link may be incorrect.</p>
        <Button to="/blog" icon={<ChevronRightIcon size={15} />}>
          Back to All Articles
        </Button>
      </section>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.title} — TeachingCareer</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <Breadcrumb items={[{ label: 'Blogs', to: '/blog' }, { label: post.title }]} />

      <section className="py-16">
        <div className="tc-container">
          <FormCard>
            <span className="w-fit rounded-full bg-badge px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-deep">
              {post.category}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-navy">{post.title}</h1>
            <p className="mt-2 text-sm text-body">
              {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {post.body.map((paragraph, i) => (
                <p key={i} className="leading-relaxed text-body">
                  {paragraph}
                </p>
              ))}
            </div>

            <hr className="my-8 border-line" />

            <Button to="/blog" variant="outline" icon={<ChevronRightIcon size={15} className="rotate-180" />}>
              Back to All Articles
            </Button>
          </FormCard>
        </div>
      </section>
    </>
  )
}
