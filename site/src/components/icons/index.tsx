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

export const WhatsappIcon = fromReactIcon(FaWhatsapp)
export const InstagramIcon = fromReactIcon(FaInstagram)
export const FacebookIcon = fromReactIcon(FaFacebook)
export const LinkedinIcon = fromReactIcon(FaLinkedin)
export const YoutubeIcon = fromReactIcon(FaYoutube)
