import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHero } from '@/components/sections/PageHero'
import { TextField } from '@/components/ui/FormFields'
import { api } from '@/lib/api'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validation'

interface ForgotPasswordResponse {
  message: string
  devResetUrl?: string
}

export default function ForgotPassword() {
  const [result, setResult] = useState<ForgotPasswordResponse | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) })

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) => api.postJson<ForgotPasswordResponse>('/auth/forgot-password', data),
    onSuccess: (data) => setResult(data),
  })

  function onSubmit(data: ForgotPasswordInput) {
    mutation.mutate(data)
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password — TeachingCareer</title>
      </Helmet>

      <Breadcrumb items={[{ label: 'Log In', to: '/login' }, { label: 'Forgot Password' }]} />
      <PageHero eyebrow="Account Recovery" title="Forgot Your Password?" text="Enter your email and we'll generate a reset link." />

      <section className="py-16">
        <div className="tc-container flex justify-center">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-tc">
            {result ? (
              <div className="flex flex-col gap-4 text-center">
                <p className="text-sm text-body">{result.message}</p>
                {result.devResetUrl ? (
                  <div className="rounded-xl border border-dashed border-line bg-mint/30 p-4 text-left text-xs text-body">
                    <p className="mb-2 font-bold uppercase tracking-wide text-teal-deep">Dev mode — no email service configured</p>
                    <Link to={result.devResetUrl.replace(window.location.origin, '')} className="break-all font-mono text-teal-deep hover:underline">
                      {result.devResetUrl}
                    </Link>
                  </div>
                ) : null}
                <Link to="/login" className="font-semibold text-teal-deep hover:underline">
                  Back to Log In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <TextField
                  id="forgot-email"
                  type="email"
                  label="Email"
                  required
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
                >
                  {mutation.isPending ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
