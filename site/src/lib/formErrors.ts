import { ApiError } from './api'

/**
 * Splits a failed request into per-field messages (from the server's Zod
 * `details.fieldErrors`) and one general message for anything else.
 */
export function serverErrors(err: unknown): { fields: Record<string, string>; message: string } {
  if (!(err instanceof ApiError)) return { fields: {}, message: 'Something went wrong. Please try again.' }
  const details = err.details as { fieldErrors?: Record<string, string[] | undefined>; formErrors?: string[] } | undefined
  const fields: Record<string, string> = {}
  for (const [key, msgs] of Object.entries(details?.fieldErrors ?? {})) if (msgs?.[0]) fields[key] = msgs[0]
  const formError = details?.formErrors?.[0]
  const message = Object.keys(fields).length > 0 ? 'Please fix the highlighted fields.' : formError ?? err.message
  return { fields, message }
}
