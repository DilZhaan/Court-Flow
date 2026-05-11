import { useMemo } from 'react'

import type { Role } from '../types/domain'

export const useRoleAccess = (role?: Role) =>
  useMemo(
    () => ({
      canManageUsers: role === 'ADMIN',
      canChangeRoles: role === 'ADMIN' || role === 'MANAGER',
      canManageFacilities: role === 'MANAGER',
      canManageBookings: role === 'MANAGER' || role === 'STAFF',
      canViewOperations: role === 'MANAGER' || role === 'STAFF',
    }),
    [role],
  )
