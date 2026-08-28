import { Helmet } from 'react-helmet-async'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { SignupFormCard } from '@/components/auth/SignupFormCard'

export default function Signup() {
  return (
    <>
      <Helmet>
        <title>Sign Up — TeachingCareer</title>
      </Helmet>

      <Breadcrumb items={[{ label: 'Sign Up' }]} />
      <PageHero eyebrow="Join TeachingCareer" title="Create Your Account" text="Set up your free TeachingCareer account." />

      <section className="py-16">
        <div className="tc-container flex justify-center">
          <SignupFormCard />
        </div>
      </section>
    </>
  )
}
