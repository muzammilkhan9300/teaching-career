import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper, { type Area as PixelArea, type Point } from 'react-easy-crop'
import { CloseIcon, CrosshairIcon, ResetIcon, ScanFaceIcon, ZoomInIcon, ZoomOutIcon } from '@/components/icons'
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

const MIN_ZOOM = 0.5 // below 1 = zoom out past the photo's edges (white fill), for photos taken too close
const MAX_ZOOM = 6
const ZOOM_STEP = 0.1

type Detection = 'detecting' | 'found' | 'none' | 'unavailable'

interface PhotoCropDialogProps {
  file: File
  onCancel: () => void
  /** Receives the final 600×800 JPEG. */
  onConfirm: (cropped: File) => void
}

/** Skip the automatic ~4MB detector download on data-saver / very slow connections. */
function shouldAutoDetect() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !(connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g')
}

/**
 * Passport-style crop editor for candidate profile photos. Opens on the
 * picked file, auto-frames head + shoulders (face detection where possible,
 * a top-weighted crop otherwise) and lets the user zoom / drag / reset before
 * producing the final 3:4 image.
 */
export function PhotoCropDialog({ file, onCancel, onConfirm }: PhotoCropDialogProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<PixelArea | null>(null)
  // The framing the editor (re)starts from; changing `framingKey` re-mounts the cropper on it.
  const [framing, setFraming] = useState<Area | null>(null)
  const [framingKey, setFramingKey] = useState(0)
  const [detection, setDetection] = useState<Detection>('detecting')
  const [saving, setSaving] = useState(false)
  const touched = useRef(false)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const [url] = useState(() => URL.createObjectURL(file))

  useEffect(() => () => URL.revokeObjectURL(url), [url])

  const applyFraming = useCallback((next: Area) => {
    setFraming(next)
    setFramingKey((k) => k + 1)
  }, [])

  const runDetection = useCallback(
    async (img: HTMLImageElement, force: boolean) => {
      setDetection('detecting')
      try {
        const face = await detectMainFace(img)
        if (!face) {
          setDetection('none')
          return
        }
        setDetection('found')
        // Don't yank the photo away from someone who already started adjusting it.
        if (force || !touched.current) {
          touched.current = false
          applyFraming(passportFraming(img.naturalWidth, img.naturalHeight, face))
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
    loadImage(url)
      .then((img) => {
        if (cancelled) return
        setImage(img)
        applyFraming(fallbackFraming(img.naturalWidth, img.naturalHeight))
        if (shouldAutoDetect()) void runDetection(img, false)
        else setDetection('unavailable')
      })
      .catch(() => !cancelled && setLoadError('This image could not be opened. Please choose a different JPG, PNG or WEBP file.'))
    return () => {
      cancelled = true
    }
  }, [url, applyFraming, runDetection])

  // Live 3:4 preview of exactly what will be saved.
  useEffect(() => {
    if (!image || !area || !previewRef.current) return
    const frame = requestAnimationFrame(() => {
      const canvas = previewRef.current
      if (!canvas) return
      const small = drawCrop(image, area, canvas.width, canvas.height)
      canvas.getContext('2d')!.drawImage(small, 0, 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [image, area])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel, saving])

  const changeZoom = (next: number) => {
    touched.current = true
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next * 100) / 100)))
  }

  async function handleSave() {
    if (!image || !area) return
    setSaving(true)
    try {
      onConfirm(await cropToPortraitFile(image, area, file.name))
    } catch {
      setLoadError('Could not create the cropped photo. Please try again.')
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
    'inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-navy transition hover:border-teal hover:text-teal disabled:opacity-50'

  return (
    <div className="fixed inset-0 z-[200] flex items-stretch justify-center bg-navy/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="photo-crop-title">
      <div className="flex max-h-full w-full max-w-3xl flex-col overflow-y-auto bg-white shadow-tc-lg sm:max-h-[95vh] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id="photo-crop-title" className="text-lg font-extrabold text-navy">Adjust Profile Photo</h2>
            <p className="text-xs text-body">Show the full head, neck and both shoulders. Saved as a {PHOTO_WIDTH}×{PHOTO_HEIGHT} portrait.</p>
          </div>
          <button type="button" onClick={onCancel} disabled={saving} className="text-body hover:text-navy" aria-label="Close photo editor">
            <CloseIcon size={20} />
          </button>
        </div>

        {loadError ? (
          <p className="m-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">{loadError}</p>
        ) : (
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="relative h-[52vh] max-h-[460px] min-h-[280px] overflow-hidden rounded-2xl bg-navy/90" data-testid="crop-area">
                {image && framing ? (
                  <Cropper
                    key={framingKey}
                    image={url}
                    crop={crop}
                    zoom={zoom}
                    aspect={PHOTO_ASPECT}
                    minZoom={MIN_ZOOM}
                    maxZoom={MAX_ZOOM}
                    zoomSpeed={0.4}
                    restrictPosition={zoom >= 1}
                    initialCroppedAreaPixels={framing}
                    showGrid
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropAreaChange={(_, pixels) => setArea(pixels)}
                    onCropComplete={(_, pixels) => setArea(pixels)}
                    onInteractionStart={() => (touched.current = true)}
                    style={{ cropAreaStyle: { border: '2px solid rgba(255,255,255,0.9)' }, mediaStyle: { backgroundColor: '#fff' } }}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm text-white/80">Loading photo…</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button type="button" className={toolButton} onClick={() => changeZoom(zoom - ZOOM_STEP)} aria-label="Zoom out" title="Zoom out">
                  <ZoomOutIcon size={16} />
                </button>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => changeZoom(Number(e.target.value))}
                  className="h-1.5 min-w-0 flex-1 cursor-pointer accent-teal"
                  aria-label="Zoom"
                />
                <button type="button" className={toolButton} onClick={() => changeZoom(zoom + ZOOM_STEP)} aria-label="Zoom in" title="Zoom in">
                  <ZoomInIcon size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" className={toolButton} disabled={!framing} onClick={() => {
                    touched.current = false
                    if (framing) applyFraming(framing)
                  }}>
                  <ResetIcon size={14} /> Reset Position
                </button>
                <button
                  type="button"
                  className={toolButton}
                  onClick={() => {
                    touched.current = true
                    setCrop({ x: 0, y: 0 })
                  }}
                >
                  <CrosshairIcon size={14} /> Center Image
                </button>
                <button type="button" className={toolButton} disabled={!image || detection === 'detecting'} onClick={() => image && void runDetection(image, true)}>
                  <ScanFaceIcon size={14} /> Auto-fit to Face
                </button>
              </div>
              <p className={`text-xs ${status[detection].tone}`} aria-live="polite">{status[detection].text}</p>
              <p className="text-xs text-body">Drag to move · scroll or pinch to zoom · zoom below 100% adds a white border for photos taken too close.</p>
            </div>

            <div className="flex shrink-0 flex-row items-center gap-4 sm:w-40 sm:flex-col sm:items-stretch">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-body">Preview</span>
                <canvas
                  ref={previewRef}
                  width={150}
                  height={200}
                  className="block h-[200px] w-[150px] rounded-2xl border border-line bg-mint"
                  aria-label="Cropped photo preview"
                  data-testid="crop-preview"
                />
              </div>
              <p className="text-xs text-body sm:mt-1">This is exactly how the photo will appear on the profile.</p>
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onCancel} disabled={saving} className="rounded-full px-5 py-2.5 text-sm font-bold text-body hover:text-navy">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!area || saving || Boolean(loadError)}
            className="rounded-full bg-teal px-6 py-2.5 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Use This Photo'}
          </button>
        </div>
      </div>
    </div>
  )
}
