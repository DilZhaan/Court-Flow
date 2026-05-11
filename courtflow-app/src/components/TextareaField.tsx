import type { TextareaHTMLAttributes } from 'react'
import type { FieldError } from 'react-hook-form'

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: FieldError
}

export function TextareaField({ label, error, ...props }: TextareaFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea {...props} />
      {error ? <small>{error.message}</small> : null}
    </label>
  )
}
