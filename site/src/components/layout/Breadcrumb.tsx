import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@/components/icons'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="border-b border-line bg-mint/40" aria-label="Breadcrumb">
      <div className="tc-container flex items-center gap-2 py-3 text-sm text-body">
        <Link to="/" className="font-medium text-navy hover:text-teal">
          Home
        </Link>
        {items.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            <ChevronRightIcon size={13} className="text-body/60" />
            {item.to ? (
              <Link to={item.to} className="font-medium text-navy hover:text-teal">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-teal-deep">{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </nav>
  )
}
