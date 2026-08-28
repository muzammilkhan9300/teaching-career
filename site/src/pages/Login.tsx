import { Helmet } from 'react-helmet-async'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { LoginFormCard } from '@/components/auth/LoginFormCard'

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Log In — TeachingCareer</title>
      </Helmet>

      <Breadcrumb items={[{ label: 'Log In' }]} />
      <PageHero eyebrow="Welcome Back" title="Log In to Your Account" text="Access your TeachingCareer profile." />

      <section className="py-16">
        <div className="tc-container flex justify-center">
          <LoginFormCard />
        </div>
      </section>
    </>
  )
}
