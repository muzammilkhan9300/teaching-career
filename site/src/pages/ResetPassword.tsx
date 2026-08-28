import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { TextField } from '@/components/ui/FormFields'
import { api, ApiError } from '@/lib/api'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => api.postJson('/auth/reset-password', { token, password: data.password }),
    onSuccess: () => navigate('/login'),
    onError: (error) => setFormError(error instanceof ApiError ? error.message : 'Something went wrong.'),
  })

  function onSubmit(data: ResetPasswordInput) {
    setFormError(null)
    mutation.mutate(data)
  }

  return (
    <>
      <Helmet>
        <title>Reset Password — TeachingCareer</title>
      </Helmet>

      <Breadcrumb items={[{ label: 'Log In', to: '/login' }, { label: 'Reset Password' }]} />
      <PageHero eyebrow="Account Recovery" title="Reset Your Password" text="Choose a new password for your account." />

      <section className="py-16">
        <div className="tc-container flex justify-center">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-tc">
            {!token ? (
              <p className="text-center text-sm text-body">
                This reset link is missing its token.{' '}
                <Link to="/forgot-password" className="font-semibold text-teal-deep hover:underline">
                  Request a new one
                </Link>
                .
              </p>
            ) : (
              <>
                {formError ? (
                  <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>
                ) : null}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                  <TextField
                    id="reset-password"
                    type="password"
                    label="New Password"
                    required
                    placeholder="At least 8 characters"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <TextField
                    id="reset-confirm-password"
                    type="password"
                    label="Confirm New Password"
                    required
                    placeholder="Repeat your new password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
                  >
                    {mutation.isPending ? 'Resetting…' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
