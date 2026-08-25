import { Link, type LinkProps } from 'react-router-dom'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'outline' | 'ghost'

interface CommonProps {
  variant?: Variant
  icon?: ReactNode
  className?: string
  children: ReactNode
}

type AsLink = CommonProps & { to: LinkProps['to']; href?: undefined } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'className' | 'children'
  >
type AsAnchor = CommonProps & { href: string; to?: undefined } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'className' | 'children'
  >
type AsButton = CommonProps & { to?: undefined; href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'children'
  >

type ButtonProps = AsLink | AsAnchor | AsButton

const variantClasses: Record<Variant, string> = {
  primary: 'bg-teal text-white shadow-tc hover:bg-teal-dark hover:shadow-tc-lg',
  outline: 'border-2 border-teal text-teal hover:bg-mint',
  ghost: 'text-navy hover:text-teal',
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', icon, className, children, ...rest } = props

  const classes = clsx(
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98]',
    variantClasses[variant],
    className,
  )

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...anchorRest } = rest as AsLink
    return (
      <Link to={to} className={classes} {...anchorRest}>
        {icon}
        {children}
      </Link>
    )
  }

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as AsAnchor
    return (
      <a href={href} className={classes} {...anchorRest}>
        {icon}
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {icon}
      {children}
    </button>
  )
}
