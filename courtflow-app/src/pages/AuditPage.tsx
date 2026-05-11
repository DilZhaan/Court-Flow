import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Search } from 'lucide-react'

import { Button } from '../components/Button'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { Field } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import { SelectField } from '../components/SelectField'
import { useGetAuditLogsQuery } from '../features/api/courtflowApi'
import type { AuditLog } from '../types/domain'
import { formatDateTime } from '../utils/date'

interface AuditFilters {
  entityType: string
  entityId: string
}

const asText = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined)
const shortId = (value?: string | null) => (value ? `${value.slice(0, 8)}...${value.slice(-4)}` : undefined)

const formatEntityLabel = (log: AuditLog) => {
  const email = asText(log.metadata.email)
  const code = asText(log.metadata.code)
  const name = asText(log.metadata.name)
  const clientName = asText(log.metadata.clientName)
  const startAt = asText(log.metadata.startAt)

  if (log.entityType === 'User' && email) return `User · ${email}`
  if (log.entityType === 'Facility' && code) return `Facility · ${code}${name ? ` · ${name}` : ''}`
  if (log.entityType === 'Booking' && clientName) {
    return `Booking · ${clientName}${startAt ? ` · ${formatDateTime(startAt)}` : ''}`
  }

  return `${log.entityType}${log.entityId ? ` · ${shortId(log.entityId)}` : ''}`
}

const formatMetadata = (metadata: Record<string, unknown>) =>
  Object.entries(metadata)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
    .join(' | ')

export function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>({ entityType: '', entityId: '' })
  const { data: logs = [], isLoading } = useGetAuditLogsQuery(filters)
  const form = useForm<AuditFilters>({ defaultValues: filters })

  const columns = useMemo(
    () => [
      { header: 'When', render: (log: AuditLog) => formatDateTime(log.createdAt) },
      { header: 'Action', render: (log: AuditLog) => <strong>{log.action.replaceAll('_', ' ')}</strong> },
      { header: 'Entity', render: (log: AuditLog) => formatEntityLabel(log) },
      { header: 'Actor', render: (log: AuditLog) => log.actor?.email || 'System' },
      { header: 'Details', render: (log: AuditLog) => <code className="inline-code">{formatMetadata(log.metadata) || '-'}</code> },
    ],
    [],
  )

  return (
    <section className="page-stack">
      <PageHeader title="History" description="Review booking, facility, and user account changes." />
      <form className="filter-bar" onSubmit={form.handleSubmit(setFilters)}>
        <SelectField label="Entity" options={[{ label: 'All', value: '' }, { label: 'Booking', value: 'Booking' }, { label: 'Facility', value: 'Facility' }, { label: 'User', value: 'User' }]} {...form.register('entityType')} />
        <Field label="Entity ID" {...form.register('entityId')} />
        <Button type="submit" icon={<Search size={16} />}>Filter</Button>
      </form>
      {logs.length ? <DataTable rows={logs} getKey={(log) => log._id} columns={columns} /> : <EmptyState title="No history found" message={isLoading ? 'Loading history.' : 'Audit events appear after system actions.'} />}
    </section>
  )
}
