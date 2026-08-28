import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuditLogs, type AuditLogRecord } from '@/admin/adminQueries'
import { DataTable, type Column } from '@/admin/components/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { SpinnerIcon } from '@/components/icons/admin'
import { RequireCapability } from '@/admin/components/RequireCapability'

const ACTION_STYLES: Record<string, string> = {
  create: 'text-teal-deep',
  update: 'text-blue-700',
  delete: 'text-red-600',
  verify: 'text-teal-deep',
  approve: 'text-teal-deep',
  reject: 'text-red-600',
  login: 'text-body',
  logout: 'text-body',
}

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1)
  const { data, isPending } = useAuditLogs(page)

  const columns: Column<AuditLogRecord>[] = [
    {
      key: 'createdAt',
      label: 'When',
      render: (r) => new Date(r.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
    },
    { key: 'adminEmail', label: 'Admin' },
    {
      key: 'action',
      label: 'Action',
      render: (r) => <span className={`font-bold capitalize ${ACTION_STYLES[r.action] ?? 'text-navy'}`}>{r.action.replace('-', ' ')}</span>,
    },
    { key: 'resource', label: 'Resource' },
    { key: 'resourceId', label: 'Record', className: 'font-mono text-xs', render: (r) => r.resourceId ?? '—' },
    { key: 'details', label: 'Details', render: (r) => r.details ?? '—' },
    { key: 'ip', label: 'IP Address', className: 'font-mono text-xs', render: (r) => r.ip ?? '—' },
  ]

  return (
    <RequireCapability capability="viewAuditLogs">
    <div className="flex flex-col gap-6">
      <Helmet>
        <title>Audit Logs — Admin — TeachingCareer</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">Audit Logs</h1>
        <p className="text-sm text-body">Every admin action recorded, most recent first.</p>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 py-10 text-body">
          <SpinnerIcon size={18} className="animate-spin" />
          Loading audit logs…
        </div>
      ) : (
        <>
          <DataTable columns={columns} rows={data?.items ?? []} rowKey={(row) => row.id} emptyMessage="No activity recorded yet." />
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
        </>
      )}
    </div>
    </RequireCapability>
  )
}
