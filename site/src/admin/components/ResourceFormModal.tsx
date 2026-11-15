import { useState } from 'react'
import { CloseIcon } from '@/components/icons'
import { SpinnerIcon, TrashIcon } from '@/components/icons/admin'
import { api, ApiError } from '@/lib/api'
import { parseYouTubeId, youTubeThumbnailUrl } from '@/lib/youtube'

export type FieldType =
  | 'text'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'number'
  | 'tags'
  | 'paragraphs'
  | 'date'
  /** Uploads to /api/admin/uploads/image on pick; the field's value is the returned path. */
  | 'image'
  /** A YouTube link with a live thumbnail preview (the server re-validates it). */
  | 'youtube'

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  options?: string[]
  required?: boolean
  placeholder?: string
  /** Small helper text under the field. */
  hint?: string
}

interface ResourceFormModalProps {
  title: string
  fields: FieldConfig[]
  initialValues: Record<string, unknown>
  isSubmitting?: boolean
  error?: string | null
  onSubmit: (values: Record<string, unknown>) => void
  onClose: () => void
}

const inputClasses = 'w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/15'

function toInputValue(value: unknown, field: FieldConfig) {
  if (field.type === 'tags' && Array.isArray(value)) return value.join(', ')
  if (field.type === 'paragraphs' && Array.isArray(value)) return value.join('\n\n')
  if (field.type === 'date' && typeof value === 'string' && value) return value.slice(0, 10)
  if (value === undefined || value === null || value === '') {
    if (field.type === 'checkbox') return false
    // A <select> with no matching option silently keeps an empty value while
    // visually showing its first option — defaulting to that option here
    // keeps the displayed value and the real form state in sync.
    if (field.type === 'select') return field.options?.[0] ?? ''
    return ''
  }
  return value
}

function ImageField({
  field,
  value,
  onChange,
  onUploadingChange,
}: {
  field: FieldConfig
  value: string
  onChange: (value: string) => void
  onUploadingChange: (uploading: boolean) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Max 5MB.')
      return
    }
    setUploading(true)
    onUploadingChange(true)
    try {
      const form = new FormData()
      form.set('homepageImage', file)
      const { url } = await api.postForm<{ url: string }>('/admin/uploads/image', form)
      onChange(url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      onUploadingChange(false)
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-dashed border-line p-3">
      <span className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-mint text-xs text-body">
        {uploading ? (
          <SpinnerIcon size={18} className="animate-spin text-teal" />
        ) : value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          'No image'
        )}
      </span>
      <div className="flex flex-col gap-2">
        <label className="inline-flex w-fit cursor-pointer items-center rounded-full border-2 border-teal px-4 py-1.5 text-xs font-bold text-teal transition hover:bg-mint">
          {value ? 'Replace image' : 'Upload image'}
          <input
            id={`field-${field.name}`}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              void handleFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>
        {value && !field.required ? (
          <button type="button" onClick={() => onChange('')} className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-red-600 hover:underline">
            <TrashIcon size={12} /> Remove image
          </button>
        ) : null}
        <span className="text-xs text-body">JPG, PNG or WEBP, max 5MB.</span>
        {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
      </div>
    </div>
  )
}

function YouTubeField({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (value: string) => void }) {
  const videoId = value.trim() ? parseYouTubeId(value) : null
  return (
    <div className="flex flex-col gap-2">
      <input
        id={`field-${field.name}`}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        placeholder={field.placeholder ?? 'https://www.youtube.com/watch?v=… or https://youtu.be/…'}
        className={inputClasses}
      />
      {videoId ? (
        <div className="flex items-center gap-3 rounded-xl bg-mint/50 p-2.5">
          <img src={youTubeThumbnailUrl(videoId)} alt="Video thumbnail preview" className="h-16 w-28 rounded-lg object-cover" />
          <div className="text-xs text-body">
            <p className="font-bold text-teal-deep">Valid YouTube link</p>
            <p>
              Video ID: <span className="font-mono text-navy">{videoId}</span>
            </p>
          </div>
        </div>
      ) : value.trim() ? (
        <p className="text-xs font-medium text-red-600">Not a valid YouTube link. Use a youtube.com/watch?v=… or youtu.be/… link.</p>
      ) : null}
    </div>
  )
}

export function ResourceFormModal({ title, fields, initialValues, isSubmitting, error, onSubmit, onClose }: ResourceFormModalProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    for (const field of fields) {
      initial[field.name] = toInputValue(initialValues[field.name], field)
    }
    return initial
  })
  const [uploadingCount, setUploadingCount] = useState(0)
  const [localError, setLocalError] = useState<string | null>(null)

  function setField(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    const output: Record<string, unknown> = { ...values }
    for (const field of fields) {
      if (field.type === 'tags' && typeof output[field.name] === 'string') {
        output[field.name] = (output[field.name] as string)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      if (field.type === 'paragraphs' && typeof output[field.name] === 'string') {
        output[field.name] = (output[field.name] as string)
          .split(/\n\s*\n/)
          .map((s) => s.trim())
          .filter(Boolean)
      }
      if (field.type === 'number') {
        output[field.name] = Number(output[field.name])
      }
      if (field.type === 'image' && field.required && !output[field.name]) {
        setLocalError(`${field.label} is required — upload an image first.`)
        return
      }
    }
    onSubmit(output)
  }

  const shownError = localError ?? error

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-tc-lg sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-navy">{title}</h2>
          <button type="button" onClick={onClose} className="text-body hover:text-navy" aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const wide = ['textarea', 'tags', 'paragraphs', 'image', 'youtube'].includes(field.type)
              return (
                <div key={field.name} className={wide ? 'sm:col-span-2' : undefined}>
                  {field.type === 'checkbox' ? null : (
                    <label htmlFor={`field-${field.name}`} className="mb-1.5 block text-sm font-semibold text-navy">
                      {field.label} {field.required && <span className="text-teal-dark">*</span>}
                    </label>
                  )}
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`field-${field.name}`}
                      value={values[field.name] as string}
                      onChange={(e) => setField(field.name, e.target.value)}
                      required={field.required}
                      rows={3}
                      placeholder={field.placeholder}
                      className={inputClasses}
                    />
                  ) : field.type === 'paragraphs' ? (
                    <textarea
                      id={`field-${field.name}`}
                      value={values[field.name] as string}
                      onChange={(e) => setField(field.name, e.target.value)}
                      required={field.required}
                      rows={8}
                      placeholder={field.placeholder ?? 'One paragraph per line, separated by a blank line.'}
                      className={inputClasses}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`field-${field.name}`}
                      value={values[field.name] as string}
                      onChange={(e) => setField(field.name, e.target.value)}
                      required={field.required}
                      className={inputClasses}
                    >
                      {(field.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label htmlFor={`field-${field.name}`} className="flex items-center gap-2 pt-2">
                      <input
                        id={`field-${field.name}`}
                        type="checkbox"
                        checked={Boolean(values[field.name])}
                        onChange={(e) => setField(field.name, e.target.checked)}
                        className="h-4 w-4 accent-teal"
                      />
                      <span className="text-sm font-semibold text-navy">{field.label}</span>
                    </label>
                  ) : field.type === 'image' ? (
                    <ImageField
                      field={field}
                      value={values[field.name] as string}
                      onChange={(v) => setField(field.name, v)}
                      onUploadingChange={(uploading) => setUploadingCount((c) => c + (uploading ? 1 : -1))}
                    />
                  ) : field.type === 'youtube' ? (
                    <YouTubeField field={field} value={values[field.name] as string} onChange={(v) => setField(field.name, v)} />
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      type={field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : field.type === 'date' ? 'date' : 'text'}
                      autoComplete={field.type === 'password' ? 'new-password' : undefined}
                      value={values[field.name] as string | number}
                      onChange={(e) => setField(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className={inputClasses}
                    />
                  )}
                  {field.hint ? <p className="mt-1 text-xs text-body">{field.hint}</p> : null}
                </div>
              )
            })}
          </div>

          {shownError ? <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{shownError}</p> : null}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border-2 border-line px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-mint/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingCount > 0}
              className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
            >
              {isSubmitting ? <SpinnerIcon size={15} className="animate-spin" /> : null}
              {isSubmitting ? 'Saving…' : uploadingCount > 0 ? 'Uploading…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
