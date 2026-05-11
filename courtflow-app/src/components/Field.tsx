import type { InputHTMLAttributes } from 'react'
import type { FieldError } from 'react-hook-form'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: FieldError
}

export function Field({ label, error, ...props }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {error ? <small>{error.message}</small> : null}
    </label>
  )
}
