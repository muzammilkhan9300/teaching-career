import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAdminNotifications, useNotificationMutations } from '@/admin/adminQueries'

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const { data } = useAdminNotifications()
  const { markRead, markAllRead } = useNotificationMutations()
  const navigate = useNavigate()

  const unread = data?.unreadCount ?? 0

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy transition hover:bg-mint/40"
        aria-label="Notifications"
      >
        <BellIcon size={18} />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-line bg-white p-2 shadow-tc-lg">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-bold text-navy">Notifications</p>
              {unread > 0 ? (
                <button type="button" onClick={() => markAllRead.mutate()} className="text-xs font-semibold text-teal-deep hover:underline">
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!data || data.items.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-body">No notifications yet.</p>
              ) : (
                data.items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (!n.read) markRead.mutate(n.id)
                      if (n.link) navigate(n.link)
                      setOpen(false)
                    }}
                    className={clsx(
                      'flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-mint/40',
                      !n.read && 'bg-mint/30',
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm text-navy">
                      {!n.read ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal" /> : null}
                      {n.message}
                    </span>
                    <span className="text-xs text-body">{new Date(n.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
