import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'

import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { SelectField } from '../components/SelectField'
import { StatusBadge } from '../components/StatusBadge'
import { useCreateUserMutation, useGetMeQuery, useGetUsersQuery, useUpdateUserRoleMutation, useUpdateUserStatusMutation } from '../features/api/courtflowApi'
import { useApiError } from '../hooks/useApiError'
import { useRoleAccess } from '../hooks/useRoleAccess'
import type { Role, User } from '../types/domain'

interface UserFormValues {
  firebaseUid: string
  email: string
  displayName: string
  role: Role
  isActive: string
}

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Staff', value: 'STAFF' },
]

export function UsersPage() {
  const getApiError = useApiError()
  const { data: me } = useGetMeQuery()
  const access = useRoleAccess(me?.role)
  const { data: users = [], isLoading } = useGetUsersQuery()
  const [createUser] = useCreateUserMutation()
  const [updateUserRole] = useUpdateUserRoleMutation()
  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')
  const form = useForm<UserFormValues>({ defaultValues: { firebaseUid: '', email: '', displayName: '', role: 'STAFF', isActive: 'true' } })

  const submitUser = async (values: UserFormValues) => {
    setError('')
    try {
      await createUser({ ...values, isActive: values.isActive === 'true' }).unwrap()
      setModalOpen(false)
      form.reset()
    } catch (requestError) {
      setError(getApiError(requestError))
    }
  }

  const columns = useMemo(
    () => [
      { header: 'User', render: (user: User) => <div><strong>{user.displayName || user.email}</strong><span className="muted block">{user.email}</span></div> },
      {
        header: 'Role',
        render: (user: User) => {
          const isSelf = user._id === me?._id
          const managerBlockedAdmin = me?.role === 'MANAGER' && user.role === 'ADMIN'
          const options = me?.role === 'MANAGER'
            ? roleOptions.filter((role) => role.value !== 'ADMIN')
            : roleOptions

          if (!access.canChangeRoles || isSelf || managerBlockedAdmin) {
            return user.role
          }

          return (
            <select
              className="inline-select"
              value={user.role}
              onChange={(event) => updateUserRole({ id: user._id, role: event.target.value })}
            >
              {options.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          )
        },
      },
      { header: 'Status', render: (user: User) => <StatusBadge value={user.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      { header: 'Active', render: (user: User) => access.canManageUsers ? <input type="checkbox" checked={user.isActive} onChange={(event) => updateUserStatus({ id: user._id, isActive: event.target.checked })} /> : user.isActive ? 'Yes' : 'No' },
    ],
    [access.canChangeRoles, access.canManageUsers, me?._id, me?.role, updateUserRole, updateUserStatus],
  )

  return (
    <section className="page-stack">
      <PageHeader title="Users" description="Manage accounts, role assignments, and account activation." actions={access.canManageUsers ? <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add user</Button> : null} />
      {users.length ? <DataTable rows={users} getKey={(user) => user._id} columns={columns} /> : <EmptyState title="No users found" message={isLoading ? 'Loading users.' : 'Users will appear after Firebase login or admin creation.'} />}
      <Modal title="Create user profile" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid" onSubmit={form.handleSubmit(submitUser)}>
          <Alert message={error} tone="error" />
          <Field label="Firebase UID" error={form.formState.errors.firebaseUid} {...form.register('firebaseUid', { required: 'Firebase UID is required' })} />
          <Field label="Email" type="email" error={form.formState.errors.email} {...form.register('email', { required: 'Email is required' })} />
          <Field label="Display name" {...form.register('displayName')} />
          <SelectField label="Role" options={roleOptions} {...form.register('role')} />
          <SelectField label="Active" options={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]} {...form.register('isActive')} />
          <div className="form-actions"><Button type="submit">Create user</Button></div>
        </form>
      </Modal>
    </section>
  )
}
