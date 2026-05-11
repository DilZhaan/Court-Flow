import { useCallback } from 'react'

interface ErrorLike {
  data?: {
    message?: string
    details?: Record<string, string>
  }
  error?: string
}

export const useApiError = () =>
  useCallback((error: unknown) => {
    const apiError = error as ErrorLike
    const details = apiError.data?.details
    const detailText = details ? Object.values(details).join(', ') : undefined
    return detailText || apiError.data?.message || apiError.error || 'Something went wrong'
  }, [])
