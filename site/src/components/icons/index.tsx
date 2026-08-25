import type { SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function base({ size = 18, className, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const PhoneIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1.1L6.6 10.8z"
        fill="currentColor"
      />
    ),
  })

export const MailIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  })

export const PinIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <path
          d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  })

export const PersonIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 20c0-3.6 3.4-6.2 7.5-6.2s7.5 2.6 7.5 6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  })

export const CapIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <path d="M12 4L2 8.5 12 13l10-4.5L12 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path
          d="M6 10.8V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  })

export const ClockIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  })

export const CheckCircleIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  })

export const ShieldIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <path
          d="M12 2l7 3v6c0 4.9-3 8.4-7 10-4-1.6-7-5.1-7-10V5l7-3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  })

export const DocUploadIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </>
    ),
  })

export const ChevronRightIcon = (props: IconProps) =>
  base({
    ...props,
    children: <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  })

export const BookIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <path
          d="M4 5.5C6 4.5 9 4.5 11 5.5v13c-2-1-5-1-7 0v-13z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M20 5.5c-2-1-5-1-7 0v13c2-1 5-1 7 0v-13z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </>
    ),
  })

export const InfoIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      </>
    ),
  })

export const LockIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  })

export const SendIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <path
        d="M3 11l18-7-7 18-3-7-8-4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="currentColor"
      />
    ),
  })

export const WhatsappIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <path d="M20 12a8 8 0 1 1-3.6-6.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path
          d="M9 10c.3 1.8 1.9 3.4 3.7 3.7l1-1.2 2 .8v1.4c0 .6-.5 1.1-1.1 1.1C10.9 15.8 8.2 13.1 8 9.4c0-.6.5-1.1 1.1-1.1h1.4l.8 2-1.3 1.7"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),
  })

export const MenuIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  })

export const CloseIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  })

export const SearchIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  })

export const InstagramIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </>
    ),
  })

export const FacebookIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <path
        d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H8v4h2v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z"
        fill="currentColor"
      />
    ),
  })

export const LinkedinIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
        <path
          d="M7.5 10v7M7.5 7.2v.1M11 17v-4c0-1.4 1-2.5 2.3-2.5S16 11.6 16 13v4"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </>
    ),
  })

export const YoutubeIcon = (props: IconProps) =>
  base({
    ...props,
    children: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3" fill="currentColor" />
        <path d="M11 9.5l4.5 2.5-4.5 2.5v-5z" fill="#ffffff" />
      </>
    ),
  })
