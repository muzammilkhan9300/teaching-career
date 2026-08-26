// Mirrors server/src/lib/permissions.ts — used only to decide what the UI
// shows (hide a button, hide a nav link). The server enforces every one of
// these independently; a client that lies about its role still gets a 403
// from the API, this just avoids showing controls that would only 403.
export type AdminRole = 'super_admin' | 'admin' | 'moderator'

export type Capability =
  | 'manageStaff'
  | 'manageSettings'
  | 'viewAuditLogs'
  | 'viewReports'
  | 'manageContent'
  | 'reviewSubmissions'
  | 'hardDelete'

const ROLE_CAPABILITIES: Record<AdminRole, Capability[]> = {
  super_admin: ['manageStaff', 'manageSettings', 'viewAuditLogs', 'viewReports', 'manageContent', 'reviewSubmissions', 'hardDelete'],
  admin: ['viewReports', 'manageContent', 'reviewSubmissions', 'hardDelete'],
  moderator: ['reviewSubmissions'],
}

export function roleHasCapability(role: AdminRole | undefined, capability: Capability): boolean {
  if (!role) return false
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false
}
