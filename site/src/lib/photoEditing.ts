/**
 * Canvas helpers for the profile photo editor: 90° rotation and flips (baked
 * into a working copy, losslessly), fine "straighten" rotation, and the
 * geometry that keeps the crop frame in place while those change.
 */
import type { Area } from './faceFraming'

export type PhotoSource = HTMLImageElement | HTMLCanvasElement
export type Orientation = 'left' | 'right' | 'flipH' | 'flipV'

/** Working copies are capped at this many pixels on the long side (the saved photo is 600×800). */
const MAX_WORKING_SIDE = 4000

export function sourceSize(source: PhotoSource) {
  return source instanceof HTMLImageElement
    ? { width: source.naturalWidth, height: source.naturalHeight }
    : { width: source.width, height: source.height }
}

/** Size of the box that holds a w×h rectangle rotated by `degrees`. */
export function rotateSize(width: number, height: number, degrees: number) {
  const r = (degrees * Math.PI) / 180
  const cos = Math.abs(Math.cos(r))
  const sin = Math.abs(Math.sin(r))
  return { width: cos * width + sin * height, height: sin * width + cos * height }
}

function whiteCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const ctx = canvas.getContext('2d')!
  // Transparent PNG areas become white, like everywhere else the photo is drawn.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  return { canvas, ctx }
}

/** A copy of the photo rotated 90° left/right or mirrored. */
export function orientedCopy(source: PhotoSource, op: Orientation): HTMLCanvasElement {
  const size = sourceSize(source)
  const k = Math.min(1, MAX_WORKING_SIDE / Math.max(size.width, size.height))
  const w = Math.round(size.width * k)
  const h = Math.round(size.height * k)
  const quarter = op === 'left' || op === 'right'
  const { canvas, ctx } = whiteCanvas(quarter ? h : w, quarter ? w : h)
  ctx.translate(canvas.width / 2, canvas.height / 2)
  if (op === 'right') ctx.rotate(Math.PI / 2)
  else if (op === 'left') ctx.rotate(-Math.PI / 2)
  else if (op === 'flipH') ctx.scale(-1, 1)
  else ctx.scale(1, -1)
  ctx.drawImage(source, -w / 2, -h / 2, w, h)
  return canvas
}

/**
 * The photo rotated by `degrees` (clockwise, like the editor) inside its
 * bounding box — the coordinate space the cropper reports areas in.
 */
export function straightened(source: PhotoSource, degrees: number): PhotoSource {
  if (!degrees) return source
  const size = sourceSize(source)
  const box = rotateSize(size.width, size.height, degrees)
  const { canvas, ctx } = whiteCanvas(box.width, box.height)
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((degrees * Math.PI) / 180)
  ctx.drawImage(source, -size.width / 2, -size.height / 2)
  return canvas
}

/** A small copy for fast live previews; returns the scale it was made at. */
export function previewCopy(source: PhotoSource, maxSide = 1200): { source: PhotoSource; scale: number } {
  const size = sourceSize(source)
  const scale = Math.min(1, maxSide / Math.max(size.width, size.height))
  if (scale === 1) return { source, scale }
  const { canvas, ctx } = whiteCanvas(size.width * scale, size.height * scale)
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return { source: canvas, scale: canvas.width / size.width }
}

export function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(new File([blob], name, { type: 'image/jpeg' })) : reject(new Error('Could not process the image.'))),
      'image/jpeg',
      0.95,
    ),
  )
}

/** Shrinks `area` to fit a `bounds` box if needed and keeps it inside, preserving its aspect. */
export function fitInside(area: Area, bounds: { width: number; height: number }): Area {
  const k = Math.min(1, bounds.width / area.width, bounds.height / area.height)
  const width = area.width * k
  const height = area.height * k
  const cx = area.x + area.width / 2
  const cy = area.y + area.height / 2
  return {
    x: Math.min(Math.max(cx - width / 2, 0), bounds.width - width),
    y: Math.min(Math.max(cy - height / 2, 0), bounds.height - height),
    width,
    height,
  }
}

/**
 * Where the crop frame lands after an orientation change, so the part of
 * the photo the user framed stays framed. `box` is the (rotated) photo's
 * bounding box before the change.
 */
export function reorientArea(area: Area, box: { width: number; height: number }, op: Orientation): Area {
  if (op === 'flipH') return { ...area, x: box.width - area.x - area.width }
  if (op === 'flipV') return { ...area, y: box.height - area.y - area.height }
  const cx = area.x + area.width / 2
  const cy = area.y + area.height / 2
  // Rotating the picture moves the frame's centre; the frame itself stays upright.
  const [ncx, ncy] = op === 'right' ? [box.height - cy, cx] : [cy, box.width - cx]
  const next = { x: ncx - area.width / 2, y: ncy - area.height / 2, width: area.width, height: area.height }
  return fitInside(next, { width: box.height, height: box.width })
}
