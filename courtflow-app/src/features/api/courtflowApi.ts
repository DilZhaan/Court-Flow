import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type { RootState } from '../../app/store'
import type { AuditLog, Booking, BookingPayload, Facility, FacilityPayload, User } from '../../types/domain'

interface FacilitySearchParams {
  location?: string
  capacity?: string
  search?: string
  startAt?: string
  endAt?: string
}

interface BookingQueryParams {
  facilityId?: string
  status?: string
  from?: string
  to?: string
}

const unwrap = <T>(response: { data: T }) => response.data

export const courtflowApi = createApi({
  reducerPath: 'courtflowApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Me', 'Users', 'Facilities', 'Bookings', 'AuditLogs'],
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      transformResponse: unwrap<User>,
      providesTags: ['Me'],
    }),
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      transformResponse: unwrap<User[]>,
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<User, Partial<User> & { firebaseUid: string; email: string; role: string }>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      transformResponse: unwrap<User>,
      invalidatesTags: ['Users'],
    }),
    updateUserRole: builder.mutation<User, { id: string; role: string }>({
      query: ({ id, role }) => ({ url: `/users/${id}/role`, method: 'PATCH', body: { role } }),
      transformResponse: unwrap<User>,
      invalidatesTags: ['Users', 'Me'],
    }),
    updateUserStatus: builder.mutation<User, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/users/${id}/status`, method: 'PATCH', body: { isActive } }),
      transformResponse: unwrap<User>,
      invalidatesTags: ['Users'],
    }),
    getFacilities: builder.query<Facility[], FacilitySearchParams | void>({
      query: (params) => ({ url: '/facilities', params: params ?? undefined }),
      transformResponse: unwrap<Facility[]>,
      providesTags: ['Facilities'],
    }),
    createFacility: builder.mutation<Facility, FacilityPayload>({
      query: (body) => ({ url: '/facilities', method: 'POST', body }),
      transformResponse: unwrap<Facility>,
      invalidatesTags: ['Facilities', 'AuditLogs'],
    }),
    updateFacility: builder.mutation<Facility, { id: string; body: Partial<FacilityPayload> }>({
      query: ({ id, body }) => ({ url: `/facilities/${id}`, method: 'PATCH', body }),
      transformResponse: unwrap<Facility>,
      invalidatesTags: ['Facilities', 'AuditLogs'],
    }),
    deleteFacility: builder.mutation<void, string>({
      query: (id) => ({ url: `/facilities/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Facilities', 'AuditLogs'],
    }),
    getBookings: builder.query<Booking[], BookingQueryParams | void>({
      query: (params) => ({ url: '/bookings', params: params ?? undefined }),
      transformResponse: unwrap<Booking[]>,
      providesTags: ['Bookings'],
    }),
    createBooking: builder.mutation<Booking, BookingPayload>({
      query: (body) => ({ url: '/bookings', method: 'POST', body }),
      transformResponse: unwrap<Booking>,
      invalidatesTags: ['Bookings', 'Facilities', 'AuditLogs'],
    }),
    cancelBooking: builder.mutation<Booking, { id: string; cancellationReason: string }>({
      query: ({ id, cancellationReason }) => ({
        url: `/bookings/${id}/cancel`,
        method: 'PATCH',
        body: { cancellationReason },
      }),
      transformResponse: unwrap<Booking>,
      invalidatesTags: ['Bookings', 'Facilities', 'AuditLogs'],
    }),
    getAuditLogs: builder.query<AuditLog[], { entityType?: string; entityId?: string } | void>({
      query: (params) => ({ url: '/audit-logs', params: params ?? undefined }),
      transformResponse: unwrap<AuditLog[]>,
      providesTags: ['AuditLogs'],
    }),
  }),
})

export const {
  useCancelBookingMutation,
  useCreateBookingMutation,
  useCreateFacilityMutation,
  useCreateUserMutation,
  useDeleteFacilityMutation,
  useGetAuditLogsQuery,
  useGetBookingsQuery,
  useGetFacilitiesQuery,
  useGetMeQuery,
  useGetUsersQuery,
  useUpdateFacilityMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} = courtflowApi
