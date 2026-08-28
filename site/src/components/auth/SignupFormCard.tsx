import { useState } from 'react'
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { TextField } from '@/components/ui/FormFields'
import { api, ApiError } from '@/lib/api'
import { registerSchema, type RegisterInput } from '@/lib/validation'
import { useUserAuth } from '@/auth/UserAuthContext'
import { GoogleIcon, MailIcon, ChevronRightIcon } from '@/components/icons'

interface AuthLocationState {
  backgroundLocation?: Location
}

/**
 * The actual sign-up form — used both as the content of the full /signup
 * page and inside AuthModal when opened from the header over whatever page
 * you were already on. Identical either way; only the outer chrome differs.
 */
export function SignupFormCard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register: registerUser, isRegistering } = useUserAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)

  const state = location.state as AuthLocationState | null

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
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterInput) {
    setFormError(null)
    try {
      // confirmPassword only exists to validate equality on this form — the
      // account itself only needs name/email/password.
      const { confirmPassword: _confirmPassword, ...accountData } = data
      await registerUser(accountData)
      // Opened as a modal over some page, closes back onto that same page;
      // a direct full-page visit just goes home.
      navigate(state?.backgroundLocation?.pathname ?? '/')
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-tc">
      {showChooser ? (
        <div className="flex flex-col gap-3">
          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 rounded-full border border-line px-6 py-3.5 text-sm font-semibold text-navy transition hover:bg-mint/40"
          >
            <GoogleIcon size={18} />
            Sign up with Google
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
              Other sign-up options
            </button>
          ) : null}

          {formError ? (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <TextField
              id="signup-name"
              label="Full Name"
              required
              placeholder="Your full name"
              error={errors.name?.message}
              {...register('name')}
            />
            <TextField
              id="signup-email"
              type="email"
              label="Email"
              required
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <TextField
              id="signup-password"
              type="password"
              label="Password"
              required
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />
            <TextField
              id="signup-confirm-password"
              type="password"
              label="Confirm Password"
              required
              placeholder="Repeat your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <button
              type="submit"
              disabled={isRegistering}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
            >
              {isRegistering ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-body">
        Already have an account?{' '}
        <Link
          to="/login"
          state={state?.backgroundLocation ? { backgroundLocation: state.backgroundLocation } : undefined}
          className="font-semibold text-teal-deep hover:underline"
        >
          Log In
        </Link>
      </p>
    </div>
  )
}
