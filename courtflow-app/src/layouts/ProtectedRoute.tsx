import { Navigate, Outlet } from 'react-router-dom'
import { signOut } from 'firebase/auth'

import { Button } from '../components/Button'
import { firebaseAuth } from '../config/firebase'
import { useGetMeQuery } from '../features/api/courtflowApi'
import { useAppSelector } from '../hooks/useAppSelector'

interface QueryError {
  status?: number
  data?: {
    message?: string
  }
}

const getErrorStatus = (error: unknown) => (error as QueryError | undefined)?.status
const getErrorMessage = (error: unknown) =>
  (error as QueryError | undefined)?.data?.message || 'Your account cannot access CourtFlow.'

function InactiveAccount({ message }: { message: string }) {
  const handleSignOut = async () => {
    await signOut(firebaseAuth)
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div>
          <h1>Account unavailable</h1>
          <p>{message}</p>
        </div>
        <Button onClick={handleSignOut}>Sign out</Button>
      </div>
    </section>
  )
}

export function ProtectedRoute() {
  const { ready, token } = useAppSelector((state) => state.auth)
  const { isLoading, isError, error } = useGetMeQuery(undefined, { skip: !token })

  if (!ready) return <div className="boot-screen">Starting CourtFlow</div>
  if (!token) return <Navigate to="/login" replace />
  if (isLoading) return <div className="boot-screen">Loading your workspace</div>
  if (isError && getErrorStatus(error) === 403) {
    return <InactiveAccount message={getErrorMessage(error)} />
  }
  if (isError) return <Navigate to="/login" replace />

  return <Outlet />
}
