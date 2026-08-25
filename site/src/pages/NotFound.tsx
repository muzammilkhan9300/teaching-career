import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/Button'
import { ChevronRightIcon } from '@/components/icons'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — TeachingCareer</title>
      </Helmet>

      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-sm font-extrabold uppercase tracking-widest text-teal-deep">404</span>
        <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">Page Not Found</h1>
        <p className="max-w-md text-base leading-relaxed text-body">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved. Let&rsquo;s get you back on
          track.
        </p>
        <Button to="/" icon={<ChevronRightIcon size={15} />} className="mt-2">
          Back to Home
        </Button>
      </section>
    </>
  )
}
