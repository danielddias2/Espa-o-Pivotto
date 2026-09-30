import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

// ── Constantes ────────────────────────────────────────────────
const CROP_ASPECT = 16 / 9
const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.1
const OUTPUT_WIDTH = 1280
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / CROP_ASPECT) // 720
const OUTPUT_QUALITY = 0.88

// ── Props ─────────────────────────────────────────────────────
interface ImageCropEditorProps {
  imageSrc: string
  onApply: (croppedFile: File) => void
  onCancel: () => void
}

// ── Utilitário: recortar a imagem via Canvas ──────────────────

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (err) => reject(err))
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = url
  })
}

async function getCroppedBlob(
  imageSrc: string,
  cropPixels: Area
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D não suportado neste navegador.')

  canvas.width = OUTPUT_WIDTH
  canvas.height = OUTPUT_HEIGHT

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT
  )

  // Tenta gerar WebP; fallback para JPEG se não suportado
  const supportsWebP = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg'

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao gerar a imagem recortada.'))
          return
        }
        resolve(blob)
      },
      mimeType,
      OUTPUT_QUALITY
    )
  })
}

// ── Componente ────────────────────────────────────────────────

export default function ImageCropEditor({
  imageSrc,
  onApply,
  onCancel,
}: ImageCropEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels)
    },
    []
  )

  async function handleApply() {
    if (!croppedAreaPixels) return

    setProcessing(true)
    setError(null)

    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels)
      const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
      const file = new File([blob], `crop_${Date.now()}.${ext}`, {
        type: blob.type,
      })
      onApply(file)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao processar a imagem.'
      )
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Área de Corte */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#7D3B7C]/30 bg-[#1C181D]" style={{ aspectRatio: '16/9' }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={CROP_ASPECT}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          restrictPosition
          showGrid
          objectFit="contain"
          classes={{
            containerClassName: 'rounded-2xl',
          }}
          style={{
            cropAreaStyle: {
              border: '2px solid rgba(125, 59, 124, 0.6)',
              borderRadius: '12px',
            },
          }}
        />
      </div>

      {/* Controle de Zoom */}
      <div className="flex items-center gap-3 px-1">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM || processing}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#EAE2DC] text-[#7D3B7C] hover:bg-[#FAF0F8] transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
          aria-label="Reduzir zoom"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          disabled={processing}
          className="flex-1 h-1.5 bg-[#EAE2DC] rounded-full appearance-none cursor-pointer accent-[#7D3B7C] disabled:opacity-40"
          aria-label="Zoom"
        />

        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM || processing}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#EAE2DC] text-[#7D3B7C] hover:bg-[#FAF0F8] transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
          aria-label="Aumentar zoom"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <span className="text-[10px] text-[#A1A1AA] font-mono tabular-nums w-10 text-right shrink-0">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Erro */}
      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Dica Mobile */}
      <p className="text-[10px] text-[#A1A1AA] text-center">
        Arraste para reposicionar · Use os controles ou scroll/pinch para zoom
      </p>

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-3 pt-1 border-t border-[#EAE2DC]">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-[#EAE2DC] text-[#756A73] hover:text-[#1C181D] rounded-full transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={processing || !croppedAreaPixels}
          className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-[#7D3B7C] text-white rounded-full hover:bg-[#672B66] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {processing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Processando…
            </>
          ) : (
            'Aplicar enquadramento'
          )}
        </button>
      </div>
    </div>
  )
}
