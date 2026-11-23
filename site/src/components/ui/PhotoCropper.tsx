import { lazy, Suspense, useState } from 'react'
import { createPortal } from 'react-dom'

// The crop editor (and its face detector) only downloads when someone picks a photo.
const PhotoCropDialog = lazy(() => import('./PhotoCropDialog').then((m) => ({ default: m.PhotoCropDialog })))

export { PHOTO_ACCEPT, checkPhotoFile } from '@/lib/photoFile'

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
  // "Replace image" inside the editor swaps the photo without closing it.
  const [picked, setPicked] = useState(file)
  const [replacement, setReplacement] = useState<File | null>(null)
  const fileChanged = picked !== file
  if (fileChanged) {
    setPicked(file)
    setReplacement(null)
  }
  const current = fileChanged ? file : (replacement ?? file)
  if (!current) return null
  return createPortal(
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/60">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" aria-label="Loading photo editor" />
        </div>
      }
    >
      <PhotoCropDialog
        key={`${current.name}-${current.size}-${current.lastModified}`}
        file={current}
        onCancel={onCancel}
        onConfirm={onConfirm}
        onReplace={setReplacement}
      />
    </Suspense>,
    document.body,
  )
}
