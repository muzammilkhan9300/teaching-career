import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation, type Location } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RootLayout } from '@/layouts/RootLayout'
import { ToastProvider } from '@/components/ui/Toast'
import { AdminRoute } from '@/admin/AdminRoute'
import { AdminLayout } from '@/admin/AdminLayout'
import { UserAuthProvider } from '@/auth/UserAuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { LoginFormCard } from '@/components/auth/LoginFormCard'
import { SignupFormCard } from '@/components/auth/SignupFormCard'
import type { SubmissionResource } from '@/pages/admin/AdminSubmissions'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
})

const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Services = lazy(() => import('@/pages/Services'))
const Contact = lazy(() => import('@/pages/Contact'))
const HomeTutor = lazy(() => import('@/pages/HomeTutor'))
const CandidateRegistration = lazy(() => import('@/pages/CandidateRegistration'))
const SchoolRegistration = lazy(() => import('@/pages/SchoolRegistration'))
const ManageVacancies = lazy(() => import('@/pages/ManageVacancies'))
const CandidateProfiles = lazy(() => import('@/pages/CandidateProfiles'))
const CandidateProfileDetail = lazy(() => import('@/pages/CandidateProfileDetail'))
const SchoolProfiles = lazy(() => import('@/pages/SchoolProfiles'))
const SchoolProfileDetail = lazy(() => import('@/pages/SchoolProfileDetail'))
const VacancyDetail = lazy(() => import('@/pages/VacancyDetail'))
const Blog = lazy(() => import('@/pages/Blog'))
const BlogSingle = lazy(() => import('@/pages/BlogSingle'))
const RegistrationSuccess = lazy(() => import('@/pages/RegistrationSuccess'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const Profile = lazy(() => import('@/pages/Profile'))

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminVacancies = lazy(() => import('@/pages/admin/AdminVacancies'))
const AdminSchools = lazy(() => import('@/pages/admin/AdminSchools'))
const AdminCandidates = lazy(() => import('@/pages/admin/AdminCandidates'))
const AdminBlogs = lazy(() => import('@/pages/admin/AdminBlogs'))
const AdminServices = lazy(() => import('@/pages/admin/AdminServices'))
const AdminDocuments = lazy(() => import('@/pages/admin/AdminDocuments'))
const AdminCandidateApplications = lazy(() => import('@/pages/admin/AdminCandidateApplications'))
const AdminSchoolRegistrations = lazy(() => import('@/pages/admin/AdminSchoolRegistrations'))
const AdminStaff = lazy(() => import('@/pages/admin/AdminStaff'))
const AdminAuditLogs = lazy(() => import('@/pages/admin/AdminAuditLogs'))
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))
const AdminSubmissions = lazy(() => import('@/pages/admin/AdminSubmissions'))

// Home Tutor Requests / Contact Messages / Vacancy Applications use the
// generic status+delete inbox; Candidate Applications and School
// Registrations have their own dedicated verify/approve pages instead.
const SUBMISSION_ROUTES: { path: string; resource: SubmissionResource }[] = [
  { path: 'home-tutor-requests', resource: 'home-tutor-requests' },
  { path: 'contact-messages', resource: 'contact-messages' },
  { path: 'vacancy-applications', resource: 'vacancy-applications' },
]

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-teal" aria-label="Loading" />
    </div>
  )
}

interface NavState {
  backgroundLocation?: Location
}

function AppRoutes() {
  const location = useLocation()
  // Set only when Login/Signup was opened via a Header click (see
  // Header.tsx) — clicking "Log In"/"Sign Up" there navigates with this
  // state so the form renders as a modal on top of the current page instead
  // of replacing it. A direct URL visit (no state) renders the full page
  // instead, since there's nothing to show behind it.
  const backgroundLocation = (location.state as NavState | null)?.backgroundLocation

  return (
    <UserAuthProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes location={backgroundLocation ?? location}>
          <Route path="admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="vacancies" element={<AdminVacancies />} />
              <Route path="schools" element={<AdminSchools />} />
              <Route path="candidates" element={<AdminCandidates />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="documents" element={<AdminDocuments />} />
              <Route path="candidate-applications" element={<AdminCandidateApplications />} />
              <Route path="school-registrations" element={<AdminSchoolRegistrations />} />
              {SUBMISSION_ROUTES.map((r) => (
                <Route key={r.path} path={r.path} element={<AdminSubmissions resource={r.resource} />} />
              ))}
              <Route path="reports" element={<AdminReports />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
            <Route path="home-tutor" element={<HomeTutor />} />
            <Route path="candidate-registration" element={<CandidateRegistration />} />
            <Route path="school-registration" element={<SchoolRegistration />} />
            <Route path="manage-vacancies" element={<ManageVacancies />} />
            <Route path="candidate-profiles" element={<CandidateProfiles />} />
            <Route path="candidate-profiles/:id" element={<CandidateProfileDetail />} />
            <Route path="school-profiles" element={<SchoolProfiles />} />
            <Route path="school-profiles/:id" element={<SchoolProfileDetail />} />
            <Route path="vacancy/:id" element={<VacancyDetail />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogSingle />} />
            <Route path="registration-success" element={<RegistrationSuccess />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>

      {backgroundLocation ? (
        <Routes>
          <Route
            path="/login"
            element={
              <AuthModal>
                <LoginFormCard />
              </AuthModal>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthModal>
                <SignupFormCard />
              </AuthModal>
            }
          />
        </Routes>
      ) : null}
    </UserAuthProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </HelmetProvider>
    </QueryClientProvider>
  )
}
