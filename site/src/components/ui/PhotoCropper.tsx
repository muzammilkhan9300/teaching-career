import { lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'

// The crop editor (and its face detector) only downloads when someone picks a photo.
const PhotoCropDialog = lazy(() => import('./PhotoCropDialog').then((m) => ({ default: m.PhotoCropDialog })))

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PHOTO_EXTS = /\.(jpe?g|png|webp)$/i
/** The original may be big (phone photos); the saved crop is a small 600×800 JPEG. */
const MAX_ORIGINAL_MB = 20

export const PHOTO_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'

/** Returns an error message if the picked file can't be opened in the crop editor. */
export function checkPhotoFile(file: File): string | null {
  if (!PHOTO_TYPES.includes(file.type) || !PHOTO_EXTS.test(file.name)) {
    return 'Unsupported file type. Please choose a JPG, JPEG, PNG or WEBP image.'
  }
  if (file.size > MAX_ORIGINAL_MB * 1024 * 1024) {
    return `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). The maximum size is ${MAX_ORIGINAL_MB}MB.`
  }
  return null
}

/** Wraps a single file in a FileList, for forms that hold a file input's value. */
export function fileListOf(file: File): FileList {
  const transfer = new DataTransfer()
  transfer.items.add(file)
  return transfer.files
}

interface PhotoCropperProps {
  /** The picked file; the editor is open while this is set. */
  file: File | null
  onCancel: () => void
  onConfirm: (cropped: File) => void
}

export function PhotoCropper({ file, onCancel, onConfirm }: PhotoCropperProps) {
  if (!file) return null
  return createPortal(
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/60">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" aria-label="Loading photo editor" />
        </div>
      }
    >
      <PhotoCropDialog key={`${file.name}-${file.size}-${file.lastModified}`} file={file} onCancel={onCancel} onConfirm={onConfirm} />
    </Suspense>,
    document.body,
  )
}
