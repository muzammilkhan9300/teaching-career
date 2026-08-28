import type { ReactNode } from 'react'
import { useUserAuth } from '@/auth/UserAuthContext'
import type { Capability } from '@/admin/permissions'
import { AlertIcon } from '@/components/icons/admin'

/**
 * UI-only gate matching what the server actually enforces (see
 * server/src/lib/permissions.ts) — shows a clear message instead of a form
 * that would only fail once submitted. The real authorization check always
 * happens server-side regardless of this component.
 */
export function RequireCapability({ capability, children }: { capability: Capability; children: ReactNode }) {
  const { can } = useUserAuth()

  if (!can(capability)) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white py-16 text-center">
        <AlertIcon size={28} className="text-body" />
        <p className="font-bold text-navy">You don&rsquo;t have permission to view this page.</p>
        <p className="max-w-sm text-sm text-body">Ask a super admin to grant you access if you need it.</p>
      </div>
    )
  }

  return <>{children}</>
}
