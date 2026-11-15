import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** True when an admin-entered link points outside the site. */
function isExternalLink(href: string) {
  return /^https?:\/\//i.test(href)
}

/** Renders a router <Link> for site paths and a new-tab <a> for external URLs. */
export function ContentLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (isExternalLink(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}
