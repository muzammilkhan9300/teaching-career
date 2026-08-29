/**
 * The site's icon set — real, professionally designed icons from Lucide
 * (https://lucide.dev), re-exported under the semantic names used across
 * the app so call sites never import from 'lucide-react' directly.
 */
import {
  Phone,
  Mail,
  MapPin,
  User,
  GraduationCap,
  Clock,
  CheckCircle2,
  ShieldCheck,
  FileUp,
  ChevronRight,
  BookOpen,
  Info,
  Lock,
  Send,
  Menu,
  X,
  Search,
  LogOut,
  AlertTriangle,
  Briefcase,
  Video,
  type LucideProps,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaWhatsapp } from 'react-icons/fa6'
import type { IconType } from 'react-icons'

export type IconProps = LucideProps

function fromReactIcon(Icon: IconType) {
  return function BrandIcon({ size = 24, className }: { size?: number | string; className?: string }) {
    return <Icon size={size} className={className} />
  }
}

export const PhoneIcon = Phone
export const MailIcon = Mail
export const PinIcon = MapPin
export const PersonIcon = User
export const CapIcon = GraduationCap
export const ClockIcon = Clock
export const CheckCircleIcon = CheckCircle2
export const ShieldIcon = ShieldCheck
export const DocUploadIcon = FileUp
export const ChevronRightIcon = ChevronRight
export const BookIcon = BookOpen
export const InfoIcon = Info
export const LockIcon = Lock
export const SendIcon = Send
export const MenuIcon = Menu
export const CloseIcon = X
export const SearchIcon = Search
export const LogOutIcon = LogOut
export const AlertIcon = AlertTriangle
export const BriefcaseIcon = Briefcase
export const VideoIcon = Video

export const WhatsappIcon = fromReactIcon(FaWhatsapp)
export const InstagramIcon = fromReactIcon(FaInstagram)
export const FacebookIcon = fromReactIcon(FaFacebook)
export const LinkedinIcon = fromReactIcon(FaLinkedin)
export const YoutubeIcon = fromReactIcon(FaYoutube)

/** Google's official multi-color "G" mark — used only on the Google Sign-In button. */
export function GoogleIcon({ size = 18 }: { size?: number | string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}
