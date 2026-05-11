import type { SelectHTMLAttributes } from 'react'
import type { FieldError } from 'react-hook-form'

interface Option {
  label: string
  value: string
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: FieldError
  options: Option[]
}

export function SelectField({ label, error, options, ...props }: SelectFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <small>{error.message}</small> : null}
    </label>
  )
}
