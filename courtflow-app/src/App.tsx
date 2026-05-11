import { Route, Routes } from 'react-router-dom'

import { AppLayout } from './layouts/AppLayout'
import { ProtectedRoute } from './layouts/ProtectedRoute'
import { RoleRoute } from './layouts/RoleRoute'
import { AuditPage } from './pages/AuditPage'
import { BookingsPage } from './pages/BookingsPage'
import { FacilitiesPage } from './pages/FacilitiesPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { UsersPage } from './pages/UsersPage'
import { useAuthListener } from './hooks/useAuthListener'

function App() {
  useAuthListener()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="facilities" element={<RoleRoute allowed={['MANAGER', 'STAFF']}><FacilitiesPage /></RoleRoute>} />
          <Route path="bookings" element={<RoleRoute allowed={['MANAGER', 'STAFF']}><BookingsPage /></RoleRoute>} />
          <Route path="users" element={<RoleRoute allowed={['ADMIN', 'MANAGER']}><UsersPage /></RoleRoute>} />
          <Route path="audit" element={<RoleRoute allowed={['ADMIN', 'MANAGER', 'STAFF']}><AuditPage /></RoleRoute>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
