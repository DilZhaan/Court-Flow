import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useGetMeQuery } from '../features/api/courtflowApi'
import type { Role } from '../types/domain'

interface RoleRouteProps {
  allowed: Role[]
  children: ReactNode
}

export function RoleRoute({ allowed, children }: RoleRouteProps) {
  const { data: me } = useGetMeQuery()

  if (!me) return null
  if (!allowed.includes(me.role)) return <Navigate to="/" replace />

  return children
}
