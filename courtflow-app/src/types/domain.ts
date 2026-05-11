export type Role = 'ADMIN' | 'MANAGER' | 'STAFF'
export type FacilityStatus = 'AVAILABLE' | 'MAINTENANCE' | 'INACTIVE'
export type BookingStatus = 'ACTIVE' | 'CANCELLED'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: unknown
}

export interface ApiErrorResponse {
  success: false
  message: string
  details?: Record<string, string>
}

export interface User {
  _id: string
  firebaseUid: string
  email: string
  displayName: string
  role: Role
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Facility {
  _id: string
  code: string
  name: string
  location: string
  sportType: string
  capacity: number
  pricePerHour: number
  status: FacilityStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Booking {
  _id: string
  facility: Facility
  bookedBy: User
  clientName: string
  sessionType: string
  startAt: string
  endAt: string
  status: BookingStatus
  cancelledBy?: User | null
  cancelledAt?: string | null
  cancellationReason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  _id: string
  actor?: User | null
  action: string
  entityType: string
  entityId?: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface FacilityPayload {
  code: string
  name: string
  location: string
  sportType: string
  capacity: number
  pricePerHour: number
  status: FacilityStatus
  notes?: string
}

export interface BookingPayload {
  facilityId: string
  clientName: string
  sessionType?: string
  startAt: string
  endAt: string
  notes?: string
}
