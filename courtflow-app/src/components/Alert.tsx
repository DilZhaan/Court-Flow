interface AlertProps {
  message?: string
  tone?: 'error' | 'info' | 'success'
}

export function Alert({ message, tone = 'info' }: AlertProps) {
  if (!message) return null
  return <div className={`alert alert-${tone}`}>{message}</div>
}
