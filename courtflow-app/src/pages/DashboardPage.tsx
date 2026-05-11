import { useMemo } from 'react'

import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useGetBookingsQuery, useGetFacilitiesQuery, useGetMeQuery } from '../features/api/courtflowApi'
import { formatDateTime } from '../utils/date'

export function DashboardPage() {
  const { data: me } = useGetMeQuery()
  const { data: facilities = [] } = useGetFacilitiesQuery()
  const { data: bookings = [] } = useGetBookingsQuery()

  const activeBookings = useMemo(() => bookings.filter((booking) => booking.status === 'ACTIVE'), [bookings])
  const availableFacilities = useMemo(() => facilities.filter((facility) => facility.status === 'AVAILABLE'), [facilities])
  const nextBookings = useMemo(
    () => activeBookings.slice().sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()).slice(0, 5),
    [activeBookings],
  )

  return (
    <section className="page-stack">
      <PageHeader title="Operations" description={`Welcome back${me?.displayName ? `, ${me.displayName}` : ''}.`} />
      <div className="metric-grid">
        <div className="metric"><span>Total facilities</span><strong>{facilities.length}</strong></div>
        <div className="metric"><span>Available spaces</span><strong>{availableFacilities.length}</strong></div>
        <div className="metric"><span>Active bookings</span><strong>{activeBookings.length}</strong></div>
      </div>
      <section className="panel">
        <header><h2>Upcoming bookings</h2></header>
        <div className="booking-list">
          {nextBookings.map((booking) => (
            <article key={booking._id} className="booking-row">
              <div>
                <strong>{booking.clientName}</strong>
                <span>{booking.facility.name} · {booking.facility.location}</span>
              </div>
              <div>
                <StatusBadge value={booking.status} />
                <span>{formatDateTime(booking.startAt)}</span>
              </div>
            </article>
          ))}
          {nextBookings.length === 0 ? <p className="muted">No upcoming active bookings.</p> : null}
        </div>
      </section>
    </section>
  )
}
