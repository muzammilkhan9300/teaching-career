import { useState } from 'react'
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { TextField } from '@/components/ui/FormFields'
import { api } from '@/lib/api'
import { loginSchema, type LoginInput } from '@/lib/validation'
import { useUserAuth } from '@/auth/UserAuthContext'
import { GoogleIcon, MailIcon, ChevronRightIcon } from '@/components/icons'

interface AuthLocationState {
  from?: string
  backgroundLocation?: Location
}

/**
 * The actual login form — used both as the content of the full /login page
 * and inside AuthModal when opened from the header over whatever page you
 * were already on. Identical either way; only the outer chrome differs.
 */
export function LoginFormCard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoggingIn } = useUserAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const state = location.state as AuthLocationState | null
  const params = new URLSearchParams(location.search)
  const googleError = params.get('error') === 'google'
  const suspendedError = params.get('error') === 'suspended'

  // Google failing (or not having been tried) should land you straight on
  // the email form, not a chooser screen that just offers Google again.
  const [showEmailForm, setShowEmailForm] = useState(googleError)

  const { data: googleStatus } = useQuery({
    queryKey: ['auth', 'google-status'],
    queryFn: () => api.get<{ configured: boolean }>('/auth/google/status'),
    staleTime: 60 * 60 * 1000,
  })
  const googleConfigured = !!googleStatus?.configured
  const showChooser = googleConfigured && !showEmailForm

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    setFormError(null)
    try {
      await login(data)
      // A visitor bounced here by AdminRoute (not authenticated at all) gets
      // returned to the admin page they originally wanted; opened as a modal
      // over some page, closes back onto that same page; otherwise home.
      const from = state?.from ?? state?.backgroundLocation?.pathname ?? '/'
      navigate(from, { replace: true })
    } catch {
      setFormError('Invalid email or password.')
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-tc">
      {suspendedError ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          This account has been suspended.
        </p>
      ) : null}
      {googleError ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          Google Sign-In failed. Please try again or use your email and password.
        </p>
      ) : null}

      {showChooser ? (
        <div className="flex flex-col gap-3">
          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 rounded-full border border-line px-6 py-3.5 text-sm font-semibold text-navy transition hover:bg-mint/40"
          >
            <GoogleIcon size={18} />
            Log in with Google
          </a>
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="flex items-center justify-center gap-3 rounded-full border border-line px-6 py-3.5 text-sm font-semibold text-navy transition hover:bg-mint/40"
          >
            <MailIcon size={18} />
            Continue with Email
          </button>
        </div>
      ) : (
        <>
          {googleConfigured ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              className="mb-5 flex items-center gap-1 text-sm font-semibold text-body transition hover:text-navy"
            >
              <ChevronRightIcon size={14} className="rotate-180" />
              Other sign-in options
            </button>
          ) : null}

          {formError ? (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <TextField
              id="login-email"
              type="email"
              label="Email"
              required
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <TextField
              id="login-password"
              type="password"
              label="Password"
              required
              placeholder="Your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-semibold text-teal-deep hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
            >
              {isLoggingIn ? 'Signing in…' : 'Log In'}
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-body">
        Don&rsquo;t have an account?{' '}
        <Link
          to="/signup"
          state={state?.backgroundLocation ? { backgroundLocation: state.backgroundLocation } : undefined}
          className="font-semibold text-teal-deep hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  )
}
