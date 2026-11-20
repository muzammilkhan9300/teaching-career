/**
 * Shrinks a picked image before it's uploaded: caps the longest side and
 * re-encodes it as WebP (keeps transparency, much smaller than PNG/JPEG
 * photos). Returns the original file whenever compressing wouldn't help or
 * the browser can't encode WebP, so it never makes an upload worse.
 */
const SKIP_BELOW_BYTES = 250 * 1024

export async function compressForUpload(file: File, maxSide = 1920, quality = 0.82): Promise<File> {
  if (file.size < SKIP_BELOW_BYTES) return file
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
    const base = file.name.replace(/\.[^.]+$/, '') || 'image'
    return new File([blob], `${base}.webp`, { type: 'image/webp' })
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(url)
  }
}
