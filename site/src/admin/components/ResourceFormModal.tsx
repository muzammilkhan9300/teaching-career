import { useState } from 'react'
import { CloseIcon } from '@/components/icons'
import { SpinnerIcon } from '@/components/icons/admin'

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'tags'

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  options?: string[]
  required?: boolean
  placeholder?: string
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

function toInputValue(value: unknown, field: FieldConfig) {
  if (field.type === 'tags' && Array.isArray(value)) return value.join(', ')
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

export function ResourceFormModal({ title, fields, initialValues, isSubmitting, error, onSubmit, onClose }: ResourceFormModalProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    for (const field of fields) {
      initial[field.name] = toInputValue(initialValues[field.name], field)
    }
    return initial
  })

  function setField(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const output: Record<string, unknown> = { ...values }
    for (const field of fields) {
      if (field.type === 'tags' && typeof output[field.name] === 'string') {
        output[field.name] = (output[field.name] as string)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      if (field.type === 'number') {
        output[field.name] = Number(output[field.name])
      }
    }
    onSubmit(output)
  }

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
              const wide = field.type === 'textarea' || field.type === 'tags'
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
                      className="w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`field-${field.name}`}
                      value={values[field.name] as string}
                      onChange={(e) => setField(field.name, e.target.value)}
                      required={field.required}
                      className="w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
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
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={values[field.name] as string | number}
                      onChange={(e) => setField(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/15"
                    />
                  )}
                </div>
              )
            })}
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{error}</p> : null}

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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
            >
              {isSubmitting ? <SpinnerIcon size={15} className="animate-spin" /> : null}
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
