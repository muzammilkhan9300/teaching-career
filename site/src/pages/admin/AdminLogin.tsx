import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@/admin/AdminAuthContext'
import { TextField } from '@/components/ui/FormFields'
import { LockIcon, ShieldIcon } from '@/components/icons'
import { EyeIcon, EyeOffIcon, SpinnerIcon } from '@/components/icons/admin'

const adminLoginSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

type AdminLoginInput = z.infer<typeof adminLoginSchema>

export default function AdminLogin() {
  const { isAuthenticated, isLoading, login, isLoggingIn } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) })

  if (!isLoading && isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? '/admin'
    return <Navigate to={from} replace />
  }

  async function onSubmit(data: AdminLoginInput) {
    setFormError(null)
    try {
      await login(data)
      const from = (location.state as { from?: string } | null)?.from ?? '/admin'
      navigate(from, { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <Helmet>
        <title>Admin Login — TeachingCareer</title>
      </Helmet>

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-tc-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-teal-deep">
            <ShieldIcon size={24} />
          </span>
          <h1 className="text-xl font-extrabold text-navy">Admin Login</h1>
          <p className="text-sm text-body">Sign in to manage TeachingCareer content and submissions.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <TextField
            label="Email Address"
            type="email"
            required
            placeholder="admin@teachingcareer.pk"
            autoComplete="username"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              className="pr-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-[38px] text-body hover:text-navy"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
          </div>

          {formError ? (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{formError}</p>
          ) : null}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
          >
            {isLoggingIn ? <SpinnerIcon size={16} className="animate-spin" /> : <LockIcon size={16} />}
            {isLoggingIn ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
