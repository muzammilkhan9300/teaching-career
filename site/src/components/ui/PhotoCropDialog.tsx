import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Cropper, { type Area as PixelArea, type Point, type Size } from 'react-easy-crop'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CloseIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  ImageReplaceIcon,
  ResetIcon,
  RotateLeftIcon,
  RotateRightIcon,
  ScanFaceIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@/components/icons'
import {
  PHOTO_ASPECT,
  PHOTO_HEIGHT,
  PHOTO_WIDTH,
  cropToPortraitFile,
  detectMainFace,
  drawCrop,
  fallbackFraming,
  loadImage,
  passportFraming,
  type Area,
} from '@/lib/faceFraming'
import {
  canvasToFile,
  orientedCopy,
  previewCopy,
  reorientArea,
  rotateSize,
  sourceSize,
  straightened,
  type Orientation,
  type PhotoSource,
} from '@/lib/photoEditing'
import { PHOTO_ACCEPT, checkPhotoFile } from '@/lib/photoFile'

const MIN_ZOOM = 0.5 // below 1 = zoom out past the photo's edges (white fill), for photos taken too close
const MAX_ZOOM = 6
const ZOOM_STEP = 0.1
const MAX_STRAIGHTEN = 45
/** One arrow-button press moves the photo by this share of the frame width. */
const NUDGE = 0.04

// How candidate cards show the saved 3:4 photo: a wide frame (about 288×224
// on desktop) with object-fit: cover, anchored 25% from the top — see CandidatePhoto.
const CARD_ASPECT = 288 / 224
const CARD_ANCHOR_Y = 0.25

type Detection = 'detecting' | 'found' | 'none' | 'unavailable'
type VerticalPosition = 'top' | 'center' | 'bottom'

interface PhotoCropDialogProps {
  file: File
  onCancel: () => void
  /** Receives the final 600×800 JPEG. */
  onConfirm: (cropped: File) => void
  /** Swap the photo being edited for another one (the editor starts over with it). */
  onReplace: (file: File) => void
}

/** Skip the automatic ~4MB detector download on data-saver / very slow connections. */
function shouldAutoDetect() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !(connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g')
}

function scaleArea(area: Area, k: number): Area {
  return { x: area.x * k, y: area.y * k, width: area.width * k, height: area.height * k }
}

/** The part of the saved portrait that a candidate card shows. */
function cardArea(area: Area): Area {
  const height = area.width / CARD_ASPECT
  return { x: area.x, y: area.y + (area.height - height) * CARD_ANCHOR_Y, width: area.width, height }
}

function paint(canvas: HTMLCanvasElement | null, source: PhotoSource, area: Area) {
  if (!canvas) return
  canvas.getContext('2d')!.drawImage(drawCrop(source, area, canvas.width, canvas.height), 0, 0)
}

/**
 * Profile photo editor. Opens on the picked file, auto-frames head and
 * shoulders (face detection where possible, a top-weighted crop otherwise)
 * and lets the user zoom, drag, nudge, straighten, rotate 90°, flip, pick a
 * crop position, reset or swap the photo before producing the final 3:4
 * image. 90° turns and flips are baked into a working copy losslessly; the
 * fine rotation is applied once, when saving.
 */
export function PhotoCropDialog({ file, onCancel, onConfirm, onReplace }: PhotoCropDialogProps) {
  const [fileUrl] = useState(() => URL.createObjectURL(file))
  const [original, setOriginal] = useState<HTMLImageElement | null>(null)
  // The photo being edited (the original, or a rotated/flipped copy) and the URL the cropper shows.
  const [source, setSource] = useState<PhotoSource | null>(null)
  const [displayUrl, setDisplayUrl] = useState(fileUrl)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [area, setArea] = useState<PixelArea | null>(null)
  const [cropSize, setCropSize] = useState<Size | null>(null)
  // Changing `framingKey` re-mounts the cropper on `framing`.
  const [framing, setFraming] = useState<Area | null>(null)
  const [framingKey, setFramingKey] = useState(0)
  const [detection, setDetection] = useState<Detection>('detecting')
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const touched = useRef(false)
  /** The automatic framing of the original photo — what "Reset All" returns to. */
  const autoFraming = useRef<Area | null>(null)
  const replaceInput = useRef<HTMLInputElement>(null)
  const portraitRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => () => URL.revokeObjectURL(fileUrl), [fileUrl])
  // Working copies get their own blob URLs; free each one once it's replaced.
  useEffect(() => {
    if (displayUrl === fileUrl) return
    return () => URL.revokeObjectURL(displayUrl)
  }, [displayUrl, fileUrl])

  const applyFraming = useCallback((next: Area) => {
    setFraming(next)
    setFramingKey((k) => k + 1)
  }, [])

  const runDetection = useCallback(
    async (img: PhotoSource, force: boolean, isOriginal: boolean) => {
      setDetection('detecting')
      try {
        const face = await detectMainFace(img)
        if (!face) {
          setDetection('none')
          return
        }
        setDetection('found')
        const size = sourceSize(img)
        const next = passportFraming(size.width, size.height, face)
        if (isOriginal) autoFraming.current = next
        // Don't yank the photo away from someone who already started adjusting it.
        if (force || !touched.current) {
          touched.current = false
          applyFraming(next)
        }
      } catch {
        setDetection('unavailable')
      }
    },
    [applyFraming],
  )

  // Load the photo, show a sensible default straight away, then refine it with face detection.
  useEffect(() => {
    let cancelled = false
    loadImage(fileUrl)
      .then((img) => {
        if (cancelled) return
        setOriginal(img)
        setSource(img)
        autoFraming.current = fallbackFraming(img.naturalWidth, img.naturalHeight)
        applyFraming(autoFraming.current)
        if (shouldAutoDetect()) void runDetection(img, false, true)
        else setDetection('unavailable')
      })
      .catch(() => !cancelled && setLoadError('This image could not be opened. Please choose a different JPG, PNG or WEBP file.'))
    return () => {
      cancelled = true
    }
  }, [fileUrl, applyFraming, runDetection])

  // Live previews of exactly what will be saved, drawn from a small copy so they stay smooth.
  const previewBase = useMemo(() => (source ? previewCopy(source) : null), [source])
  const previewRotated = useMemo(() => (previewBase ? straightened(previewBase.source, rotation) : null), [previewBase, rotation])
  useEffect(() => {
    if (!previewBase || !previewRotated || !area) return
    const frame = requestAnimationFrame(() => {
      const small = scaleArea(area, previewBase.scale)
      paint(portraitRef.current, previewRotated, small)
      paint(cardRef.current, previewRotated, cardArea(small))
    })
    return () => cancelAnimationFrame(frame)
  }, [previewBase, previewRotated, area])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel, saving])

  const ready = Boolean(source && area && framing) && !busy && !saving

  /** How far the photo can move from centre in each direction, in cropper (screen) pixels. */
  function travel() {
    if (!source || !area || !cropSize) return null
    const natural = sourceSize(source)
    const box = rotateSize(natural.width, natural.height, rotation)
    const k = cropSize.width / area.width // screen pixels per photo pixel
    return {
      x: (box.width * k - cropSize.width) / 2,
      y: (box.height * k - cropSize.height) / 2,
    }
  }

  function clampCrop(next: Point): Point {
    const t = travel()
    if (!t) return next
    const limit = (v: number, max: number) => Math.min(Math.abs(max), Math.max(-Math.abs(max), v))
    return { x: limit(next.x, t.x), y: limit(next.y, t.y) }
  }

  function moveBy(dx: number, dy: number) {
    if (!cropSize) return
    touched.current = true
    const step = cropSize.width * NUDGE
    setCrop((c) => clampCrop({ x: c.x + dx * step, y: c.y + dy * step }))
  }

  function placeVertically(position: VerticalPosition) {
    const t = travel()
    if (!t) return
    touched.current = true
    // Positive y moves the photo down, showing its top. When zoomed out the photo is
    // smaller than the frame (negative travel), so the same sign aligns its top edge.
    const y = position === 'center' ? 0 : position === 'top' ? t.y : -t.y
    setCrop((c) => ({ x: c.x, y }))
  }

  const changeZoom = (next: number) => {
    touched.current = true
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next * 100) / 100)))
  }

  const changeRotation = (next: number) => {
    touched.current = true
    setRotation(Math.min(MAX_STRAIGHTEN, Math.max(-MAX_STRAIGHTEN, Math.round(next))))
  }

  async function reorient(op: Orientation) {
    if (!source || !area) return
    touched.current = true
    setBusy(true)
    setNotice(null)
    try {
      const natural = sourceSize(source)
      const box = rotateSize(natural.width, natural.height, rotation)
      const canvas = orientedCopy(source, op)
      // Very large photos are scaled down on the first turn/flip; keep the frame on the same spot.
      const k = (op === 'left' || op === 'right' ? canvas.height : canvas.width) / natural.width
      const next = scaleArea(reorientArea(area, box, op), k)
      const url = URL.createObjectURL(await canvasToFile(canvas, 'working.jpg'))
      setSource(canvas)
      setDisplayUrl(url)
      // Mirroring the photo mirrors its tilt too.
      if (op === 'flipH' || op === 'flipV') setRotation((r) => -r)
      applyFraming(next)
    } catch {
      setNotice('Could not rotate or flip this photo. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function resetAll() {
    if (!original || !autoFraming.current) return
    touched.current = false
    setNotice(null)
    setSource(original)
    setDisplayUrl(fileUrl)
    setRotation(0)
    applyFraming(autoFraming.current)
  }

  function autoFit() {
    if (!source) return
    // Face framing is worked out on the upright photo.
    setRotation(0)
    void runDetection(source, true, source === original)
  }

  function handleReplace(picked: File | undefined) {
    if (!picked) return
    const error = checkPhotoFile(picked)
    if (error) {
      setNotice(error)
      return
    }
    onReplace(picked)
  }

  async function handleSave() {
    if (!source || !area) return
    setSaving(true)
    try {
      onConfirm(await cropToPortraitFile(straightened(source, rotation), area, file.name))
    } catch {
      setNotice('Could not create the edited photo. Please try again.')
      setSaving(false)
    }
  }

  const status: Record<Detection, { text: string; tone: string }> = {
    detecting: { text: 'Finding the face to frame head and shoulders…', tone: 'text-body' },
    found: { text: 'Face found — head and shoulders framed automatically (shoulders are estimated). Adjust if needed.', tone: 'text-teal-deep' },
    none: { text: 'No face found automatically. Drag and zoom to frame the head, neck and shoulders.', tone: 'text-amber-700' },
    unavailable: { text: 'Automatic framing is unavailable. Drag and zoom to frame the head, neck and shoulders.', tone: 'text-amber-700' },
  }

  const toolButton =
    'inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-navy transition hover:border-teal hover:text-teal disabled:pointer-events-none disabled:opacity-50'
  const iconButton = `${toolButton} h-9 w-9 shrink-0 !px-0`

  return (
    <div className="fixed inset-0 z-[200] flex items-stretch justify-center bg-navy/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="photo-crop-title">
      <div className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden bg-white shadow-tc-lg sm:max-h-[95vh] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id="photo-crop-title" className="text-lg font-extrabold text-navy">Edit Profile Photo</h2>
            <p className="text-xs text-body">Show the full head, neck and both shoulders. Saved as a {PHOTO_WIDTH}×{PHOTO_HEIGHT} portrait.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={saving} className="text-body hover:text-navy" aria-label="Close photo editor">
            <CloseIcon size={20} />
          </button>
        </div>

        <input
          ref={replaceInput}
          type="file"
          accept={PHOTO_ACCEPT}
          className="hidden"
          data-testid="replace-photo-input"
          onChange={(e) => {
            handleReplace(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
        {loadError ? (
          <div className="m-6 flex flex-col items-start gap-3">
            <p className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{loadError}</p>
            <button type="button" className={toolButton} onClick={() => replaceInput.current?.click()}>
              <ImageReplaceIcon size={14} /> Choose Another Photo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="relative h-[46vh] max-h-[420px] min-h-[260px] overflow-hidden rounded-2xl bg-navy/90" data-testid="crop-area">
                {source && framing ? (
                  <Cropper
                    key={framingKey}
                    image={displayUrl}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={PHOTO_ASPECT}
                    minZoom={MIN_ZOOM}
                    maxZoom={MAX_ZOOM}
                    zoomSpeed={0.4}
                    restrictPosition={zoom >= 1}
                    initialCroppedAreaPixels={framing}
                    showGrid
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropSizeChange={setCropSize}
                    onCropAreaChange={(_, pixels) => setArea(pixels)}
                    onCropComplete={(_, pixels) => setArea(pixels)}
                    onInteractionStart={() => (touched.current = true)}
                    style={{ cropAreaStyle: { border: '2px solid rgba(255,255,255,0.9)' }, mediaStyle: { backgroundColor: '#fff' } }}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm text-white/80">Loading photo…</span>
                )}
                {busy ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-navy/30">
                    <span className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" aria-label="Updating photo" />
                  </span>
                ) : null}
              </div>

              <Control label="Zoom" value={`${Math.round(zoom * 100)}%`}>
                <button type="button" className={iconButton} disabled={!ready} onClick={() => changeZoom(zoom - ZOOM_STEP)} aria-label="Zoom out" title="Zoom out">
                  <ZoomOutIcon size={16} />
                </button>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.01}
                  value={zoom}
                  disabled={!ready}
                  onChange={(e) => changeZoom(Number(e.target.value))}
                  className="h-1.5 min-w-0 flex-1 cursor-pointer accent-teal"
                  aria-label="Zoom"
                />
                <button type="button" className={iconButton} disabled={!ready} onClick={() => changeZoom(zoom + ZOOM_STEP)} aria-label="Zoom in" title="Zoom in">
                  <ZoomInIcon size={16} />
                </button>
              </Control>

              <Control label="Rotate" value={`${rotation > 0 ? '+' : ''}${rotation}°`}>
                <button type="button" className={iconButton} disabled={!ready} onClick={() => void reorient('left')} aria-label="Rotate 90° left" title="Rotate 90° left">
                  <RotateLeftIcon size={16} />
                </button>
                <input
                  type="range"
                  min={-MAX_STRAIGHTEN}
                  max={MAX_STRAIGHTEN}
                  step={1}
                  value={rotation}
                  disabled={!ready}
                  onChange={(e) => changeRotation(Number(e.target.value))}
                  onDoubleClick={() => changeRotation(0)}
                  className="h-1.5 min-w-0 flex-1 cursor-pointer accent-teal"
                  aria-label="Straighten (rotate left or right)"
                />
                <button type="button" className={iconButton} disabled={!ready} onClick={() => void reorient('right')} aria-label="Rotate 90° right" title="Rotate 90° right">
                  <RotateRightIcon size={16} />
                </button>
              </Control>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-body">Flip</span>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={toolButton} disabled={!ready} onClick={() => void reorient('flipH')}>
                      <FlipHorizontalIcon size={14} /> Horizontal
                    </button>
                    <button type="button" className={toolButton} disabled={!ready} onClick={() => void reorient('flipV')}>
                      <FlipVerticalIcon size={14} /> Vertical
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-body">Crop Position</span>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Crop position">
                    {(['top', 'center', 'bottom'] as const).map((position) => (
                      <button key={position} type="button" className={toolButton} disabled={!ready} onClick={() => placeVertically(position)}>
                        {position === 'top' ? 'Top' : position === 'center' ? 'Center' : 'Bottom'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-body">Move</span>
                  <div className="grid grid-cols-3 gap-1" role="group" aria-label="Move photo">
                    <span />
                    <button type="button" className={iconButton} disabled={!ready} onClick={() => moveBy(0, -1)} aria-label="Move up" title="Move up">
                      <ArrowUpIcon size={15} />
                    </button>
                    <span />
                    <button type="button" className={iconButton} disabled={!ready} onClick={() => moveBy(-1, 0)} aria-label="Move left" title="Move left">
                      <ArrowLeftIcon size={15} />
                    </button>
                    <button type="button" className={iconButton} disabled={!ready} onClick={() => moveBy(0, 1)} aria-label="Move down" title="Move down">
                      <ArrowDownIcon size={15} />
                    </button>
                    <button type="button" className={iconButton} disabled={!ready} onClick={() => moveBy(1, 0)} aria-label="Move right" title="Move right">
                      <ArrowRightIcon size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" className={toolButton} disabled={!original || busy || saving} onClick={resetAll}>
                    <ResetIcon size={14} /> Reset All
                  </button>
                  <button type="button" className={toolButton} disabled={!ready || detection === 'detecting'} onClick={autoFit}>
                    <ScanFaceIcon size={14} /> Auto-fit to Face
                  </button>
                  <button type="button" className={toolButton} disabled={busy || saving} onClick={() => replaceInput.current?.click()}>
                    <ImageReplaceIcon size={14} /> Replace Image
                  </button>
                </div>
              </div>

              <p className={`text-xs ${status[detection].tone}`} aria-live="polite">{status[detection].text}</p>
              <p className="text-xs text-body">Drag to move · scroll or pinch to zoom · zoom below 100% adds a white border for photos taken too close.</p>
            </div>

            <div className="flex shrink-0 flex-row flex-wrap items-start gap-4 sm:w-44 sm:flex-col sm:flex-nowrap sm:items-stretch">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-body">Profile Preview</span>
                <canvas
                  ref={portraitRef}
                  width={240}
                  height={320}
                  className="block h-[160px] w-[120px] rounded-2xl border border-line bg-mint"
                  aria-label="Profile photo preview"
                  data-testid="crop-preview"
                />
              </div>
              <div className="flex w-44 flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-body">Card Preview</span>
                <canvas
                  ref={cardRef}
                  width={352}
                  height={274}
                  className="block aspect-[288/224] w-full rounded-2xl border border-line bg-mint"
                  aria-label="Candidate card photo preview"
                  data-testid="card-preview"
                />
              </div>
              <p className="text-xs text-body sm:mt-1">This is exactly how the photo will appear on the profile page and on candidate cards.</p>
            </div>
          </div>
        )}

        {notice ? (
          <p className="mx-5 mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 sm:mx-6" role="alert">{notice}</p>
        ) : null}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onCancel} disabled={saving} className="rounded-full px-5 py-2.5 text-sm font-bold text-body hover:text-navy">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!ready || Boolean(loadError)}
            className="rounded-full bg-teal px-6 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Image'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Control({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-body">
        {label}
        <span className="font-semibold normal-case tracking-normal text-navy">{value}</span>
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
