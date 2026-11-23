/**
 * Passport-style framing for candidate profile photos.
 *
 * Face detection (MediaPipe's on-device BlazeFace model, self-hosted under
 * /vendor/face/) only finds the FACE. The head, neck and shoulders are then
 * *estimated* from the face's size and position using typical head-and-
 * shoulders proportions — the detector cannot see shoulders, so the admin
 * always gets the final say in the crop editor.
 */

import { sourceSize, type PhotoSource } from './photoEditing'

/** Final portrait size every candidate photo is saved at (3:4). */
export const PHOTO_WIDTH = 600
export const PHOTO_HEIGHT = 800
export const PHOTO_ASPECT = PHOTO_WIDTH / PHOTO_HEIGHT

export interface Area {
  x: number
  y: number
  width: number
  height: number
}

// --- Framing proportions (fractions of the detected face-box height) -------
// The face should take up a little under a third of the frame height. That leaves room
// for the full head with a little space above it, plus the neck, both
// shoulders and the top of the chest, without the "face only" close-up.
const FRAME_HEIGHT_PER_FACE = 3.5
// BlazeFace's box starts around the eyebrows/forehead; hair sits above it.
const HAIR_ABOVE_FACE_BOX = 0.55
// Empty space above the top of the head, as a share of the frame height.
const SPACE_ABOVE_HEAD = 0.08

/**
 * The largest 3:4 area that fits inside the photo, centred horizontally
 * and starting `topBias` of the way down any spare height (people photos
 * almost always have the head in the upper part of the picture).
 */
function fitPortrait(imageWidth: number, imageHeight: number, topBias: number): Area {
  const width = Math.min(imageWidth, imageHeight * PHOTO_ASPECT)
  const height = width / PHOTO_ASPECT
  return { x: (imageWidth - width) / 2, y: (imageHeight - height) * topBias, width, height }
}

/** Default framing when no face was found: largest 3:4 area, biased to the top. */
export function fallbackFraming(imageWidth: number, imageHeight: number): Area {
  return fitPortrait(imageWidth, imageHeight, 0.12)
}

/**
 * Head-and-shoulders framing around a detected face. When the original photo
 * is cropped too tightly to contain the shoulders, this uses as much of the
 * photo as exists (it never invents image content or stretches it).
 */
export function passportFraming(imageWidth: number, imageHeight: number, face: Area): Area {
  const faceSize = Math.max(face.height, face.width)
  let height = faceSize * FRAME_HEIGHT_PER_FACE
  let width = height * PHOTO_ASPECT
  // Never larger than the photo itself.
  const scale = Math.min(1, imageWidth / width, imageHeight / height)
  width *= scale
  height *= scale

  const headTop = face.y - faceSize * HAIR_ABOVE_FACE_BOX
  const centerX = face.x + face.width / 2
  const x = clamp(centerX - width / 2, 0, imageWidth - width)
  const y = clamp(headTop - height * SPACE_ABOVE_HEAD, 0, imageHeight - height)
  return { x, y, width, height }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

// --- Face detection ----------------------------------------------------------

type Detector = { detect: (image: PhotoSource) => { detections: { boundingBox?: { originX: number; originY: number; width: number; height: number }; categories: { score: number }[] }[] } }
let detectorPromise: Promise<Detector> | null = null

function loadDetector(): Promise<Detector> {
  detectorPromise ??= import('@mediapipe/tasks-vision')
    .then(({ FaceDetector }) =>
      FaceDetector.createFromOptions(
        { wasmLoaderPath: '/vendor/face/vision_wasm_internal.js', wasmBinaryPath: '/vendor/face/vision_wasm_internal.wasm' },
        {
          baseOptions: { modelAssetPath: '/vendor/face/blaze_face_short_range.tflite', delegate: 'CPU' },
          runningMode: 'IMAGE',
          minDetectionConfidence: 0.5,
        },
      ),
    )
    .catch((err: unknown) => {
      detectorPromise = null // allow a retry later
      throw err
    })
  return detectorPromise
}

/**
 * Finds the main face in the photo (the largest confident one), in the
 * image's natural pixel coordinates. Resolves to null when no face is found.
 * Rejects only if the detector itself can't load (e.g. offline).
 */
export async function detectMainFace(image: PhotoSource): Promise<Area | null> {
  const detector = await loadDetector()
  const natural = sourceSize(image)
  // The short-range model expects the face to fill a fair part of a small
  // input, so detect on a downscaled copy and map the box back.
  const maxSide = 640
  const scale = Math.min(1, maxSide / Math.max(natural.width, natural.height))
  let source: PhotoSource = image
  if (scale < 1) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(natural.width * scale)
    canvas.height = Math.round(natural.height * scale)
    canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)
    source = await loadImage(canvas.toDataURL('image/jpeg', 0.9))
  }
  const { detections } = detector.detect(source)
  let best: Area | null = null
  let bestRank = 0
  for (const d of detections) {
    const box = d.boundingBox
    if (!box || box.width <= 0 || box.height <= 0) continue
    const rank = box.width * box.height * (d.categories[0]?.score ?? 0)
    if (rank > bestRank) {
      bestRank = rank
      best = { x: box.originX / scale, y: box.originY / scale, width: box.width / scale, height: box.height / scale }
    }
  }
  return best
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read this image.'))
    img.src = src
  })
}

// --- Output -------------------------------------------------------------------

/**
 * Draws `area` of the image (natural pixels; may extend past the edges when
 * the admin zoomed out) into a canvas of the given size. Parts outside the
 * photo are filled white. Large sources are halved step by step first so the
 * downscale stays sharp in every browser.
 */
export function drawCrop(image: PhotoSource, area: Area, outWidth: number, outHeight: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = outWidth
  canvas.height = outHeight
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outWidth, outHeight)

  // Only the part of the area that overlaps the photo is drawn.
  const natural = sourceSize(image)
  const sx = Math.max(0, area.x)
  const sy = Math.max(0, area.y)
  const sx2 = Math.min(natural.width, area.x + area.width)
  const sy2 = Math.min(natural.height, area.y + area.height)
  if (sx2 <= sx || sy2 <= sy) return canvas
  const k = outWidth / area.width
  const dx = (sx - area.x) * k
  const dy = (sy - area.y) * k
  const dw = (sx2 - sx) * k
  const dh = (sy2 - sy) * k

  let src: CanvasImageSource = image
  let srcX = sx
  let srcY = sy
  let srcW = sx2 - sx
  let srcH = sy2 - sy
  while (srcW / 2 >= dw && srcH / 2 >= dh) {
    const step = document.createElement('canvas')
    step.width = Math.max(1, Math.round(srcW / 2))
    step.height = Math.max(1, Math.round(srcH / 2))
    const sctx = step.getContext('2d')!
    sctx.imageSmoothingQuality = 'high'
    sctx.drawImage(src, srcX, srcY, srcW, srcH, 0, 0, step.width, step.height)
    src = step
    srcX = 0
    srcY = 0
    srcW = step.width
    srcH = step.height
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, srcX, srcY, srcW, srcH, dx, dy, dw, dh)
  return canvas
}

/** The final 600×800 JPEG that gets uploaded and stored. */
export async function cropToPortraitFile(image: PhotoSource, area: Area, originalName: string): Promise<File> {
  const canvas = drawCrop(image, area, PHOTO_WIDTH, PHOTO_HEIGHT)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
  if (!blob) throw new Error('Could not create the cropped image.')
  const base = originalName.replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 60) || 'photo'
  return new File([blob], `${base}-portrait.jpg`, { type: 'image/jpeg' })
}
