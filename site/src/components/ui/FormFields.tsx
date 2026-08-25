import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'
import { DocUploadIcon } from '@/components/icons'

const controlBase =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy placeholder:text-body/60 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/15 disabled:cursor-not-allowed disabled:bg-mint/40'

interface LabelProps {
  label?: string
  required?: boolean
  optional?: boolean
  htmlFor?: string
}

function FieldLabel({ label, required, optional, htmlFor }: LabelProps) {
  if (!label) return null
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-navy">
      {label} {required && <span className="text-teal-dark">*</span>}
      {optional && <span className="ml-1 text-xs font-normal text-body">(Optional)</span>}
    </label>
  )
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null
  return <p className="text-xs font-medium text-red-500">{error}</p>
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement>, LabelProps {
  error?: string
  wrapperClassName?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, required, optional, error, wrapperClassName, className, id, ...rest },
  ref,
) {
  return (
    <div className={clsx('flex flex-col gap-1.5', wrapperClassName)}>
      <FieldLabel label={label} required={required} optional={optional} htmlFor={id} />
      <input
        ref={ref}
        id={id}
        className={clsx(controlBase, error && 'border-red-400 focus:border-red-400 focus:ring-red-100', className)}
        {...rest}
      />
      <FieldError error={error} />
    </div>
  )
})

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, LabelProps {
  error?: string
  wrapperClassName?: string
  placeholder?: string
  options: { label: string; value: string }[]
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, required, optional, error, wrapperClassName, className, id, placeholder, options, ...rest },
  ref,
) {
  return (
    <div className={clsx('flex flex-col gap-1.5', wrapperClassName)}>
      <FieldLabel label={label} required={required} optional={optional} htmlFor={id} />
      <select
        ref={ref}
        id={id}
        defaultValue=""
        className={clsx(controlBase, 'appearance-none bg-no-repeat pr-10', error && 'border-red-400 focus:border-red-400 focus:ring-red-100', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2355606d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: 'right 14px center',
        }}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldError error={error} />
    </div>
  )
})

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, LabelProps {
  error?: string
  wrapperClassName?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  { label, required, optional, error, wrapperClassName, className, id, rows = 4, ...rest },
  ref,
) {
  return (
    <div className={clsx('flex flex-col gap-1.5', wrapperClassName)}>
      <FieldLabel label={label} required={required} optional={optional} htmlFor={id} />
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={clsx(controlBase, 'resize-none', error && 'border-red-400 focus:border-red-400 focus:ring-red-100', className)}
        {...rest}
      />
      <FieldError error={error} />
    </div>
  )
})

interface FileFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, LabelProps {
  error?: string
  hint?: string
  fileName?: string
  placeholder?: string
}

export const FileField = forwardRef<HTMLInputElement, FileFieldProps>(function FileField(
  { label, required, optional, error, hint, fileName, placeholder = 'Upload Document', id, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel label={label} required={required} optional={optional} htmlFor={id} />
      <label
        htmlFor={id}
        className={clsx(
          'flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-sm transition hover:border-teal hover:bg-mint/40',
          error ? 'border-red-400' : 'border-line',
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint text-teal-deep">
          <DocUploadIcon size={18} />
        </span>
        <span className="flex flex-col">
          <span className="font-semibold text-navy">{fileName || placeholder}</span>
          {hint ? <span className="text-xs text-body">{hint}</span> : null}
        </span>
      </label>
      <input ref={ref} id={id} type="file" className="screen-reader-text" {...rest} />
      <FieldError error={error} />
    </div>
  )
})

interface ChoiceChipGroupProps {
  legend: string
  required?: boolean
  error?: string
  children: ReactNode
}

export function ChoiceChipGroup({ legend, required, error, children }: ChoiceChipGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-navy">
        {legend} {required && <span className="text-teal-dark">*</span>}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
      <FieldError error={error} />
    </div>
  )
}

interface ChoiceChipProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const ChoiceChip = forwardRef<HTMLInputElement, ChoiceChipProps>(function ChoiceChip(
  { label, id, type = 'checkbox', ...rest },
  ref,
) {
  return (
    <span className="relative">
      <input ref={ref} id={id} type={type} className="peer sr-only" {...rest} />
      <label
        htmlFor={id}
        className="block cursor-pointer select-none rounded-full border border-line px-4 py-2 text-sm font-semibold text-body transition peer-checked:border-teal peer-checked:bg-teal peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-teal peer-focus-visible:outline-offset-2 hover:border-teal"
      >
        {label}
      </label>
    </span>
  )
})
