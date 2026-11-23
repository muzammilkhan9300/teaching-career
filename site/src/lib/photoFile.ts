// Which picked files the profile photo editor accepts.

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
