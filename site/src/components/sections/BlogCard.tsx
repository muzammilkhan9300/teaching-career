import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@/components/icons'
import type { BlogPost } from '@/types'

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6 shadow-tc transition hover:-translate-y-1 hover:shadow-tc-lg">
      <span className="w-fit rounded-full bg-badge px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-deep">
        {post.category}
      </span>
      <h3 className="text-lg font-bold leading-snug text-navy">
        <Link to={`/blog/${post.slug}`} className="hover:text-teal-deep">
          {post.title}
        </Link>
      </h3>
      <p className="text-sm leading-relaxed text-body">{post.excerpt}</p>
      <Link
        to={`/blog/${post.slug}`}
        className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-teal-deep hover:gap-2 transition-all"
      >
        Read More
        <ChevronRightIcon size={14} />
      </Link>
    </article>
  )
}
