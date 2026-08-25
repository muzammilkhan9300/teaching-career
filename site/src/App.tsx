import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { RootLayout } from '@/layouts/RootLayout'
import { ToastProvider } from '@/components/ui/Toast'

const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Services = lazy(() => import('@/pages/Services'))
const Contact = lazy(() => import('@/pages/Contact'))
const HomeTutor = lazy(() => import('@/pages/HomeTutor'))
const CandidateRegistration = lazy(() => import('@/pages/CandidateRegistration'))
const SchoolRegistration = lazy(() => import('@/pages/SchoolRegistration'))
const CandidateProfiles = lazy(() => import('@/pages/CandidateProfiles'))
const CandidateProfileDetail = lazy(() => import('@/pages/CandidateProfileDetail'))
const SchoolProfiles = lazy(() => import('@/pages/SchoolProfiles'))
const SchoolProfileDetail = lazy(() => import('@/pages/SchoolProfileDetail'))
const VacancyDetail = lazy(() => import('@/pages/VacancyDetail'))
const Blog = lazy(() => import('@/pages/Blog'))
const BlogSingle = lazy(() => import('@/pages/BlogSingle'))
const RegistrationSuccess = lazy(() => import('@/pages/RegistrationSuccess'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<RootLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="services" element={<Services />} />
                <Route path="contact" element={<Contact />} />
                <Route path="home-tutor" element={<HomeTutor />} />
                <Route path="candidate-registration" element={<CandidateRegistration />} />
                <Route path="school-registration" element={<SchoolRegistration />} />
                <Route path="candidate-profiles" element={<CandidateProfiles />} />
                <Route path="candidate-profiles/:id" element={<CandidateProfileDetail />} />
                <Route path="school-profiles" element={<SchoolProfiles />} />
                <Route path="school-profiles/:id" element={<SchoolProfileDetail />} />
                <Route path="vacancy/:id" element={<VacancyDetail />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogSingle />} />
                <Route path="registration-success" element={<RegistrationSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </HelmetProvider>
  )
}
