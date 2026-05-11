import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, CalendarClock, ClipboardList, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { signOut } from 'firebase/auth'

import { Button } from '../components/Button'
import { firebaseAuth } from '../config/firebase'
import { useGetMeQuery } from '../features/api/courtflowApi'
import { useRoleAccess } from '../hooks/useRoleAccess'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['MANAGER', 'STAFF'] },
  { to: '/facilities', label: 'Facilities', icon: Building2, roles: ['MANAGER', 'STAFF'] },
  { to: '/bookings', label: 'Bookings', icon: CalendarClock, roles: ['MANAGER', 'STAFF'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { to: '/audit', label: 'History', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
]

export function AppLayout() {
  const navigate = useNavigate()
  const { data: me } = useGetMeQuery()
  const access = useRoleAccess(me?.role)

  const visibleItems = navItems.filter((item) => me?.role && item.roles.includes(me.role))

  const handleSignOut = async () => {
    await signOut(firebaseAuth)
    navigate('/login')
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span>CF</span>
          <div>
            <strong>CourtFlow</strong>
            <small>{me?.role ?? 'Loading'}</small>
          </div>
        </div>
        <nav>
          {visibleItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <p>{me?.email}</p>
          <Button variant="secondary" icon={<LogOut size={16} />} onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </aside>
      <main>
        {!access.canViewOperations && me?.role === 'ADMIN' ? (
          <div className="admin-note">
            <h1>Admin Console</h1>
            <p>Admins manage account access. Facility and booking operations are available to managers and staff.</p>
          </div>
        ) : null}
        <Outlet />
      </main>
    </div>
  )
}
