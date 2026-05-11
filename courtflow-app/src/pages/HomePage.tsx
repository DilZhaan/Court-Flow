import { DashboardPage } from './DashboardPage'
import { UsersPage } from './UsersPage'
import { useGetMeQuery } from '../features/api/courtflowApi'

export function HomePage() {
  const { data: me } = useGetMeQuery()

  if (me?.role === 'ADMIN') {
    return <UsersPage />
  }

  return <DashboardPage />
}
