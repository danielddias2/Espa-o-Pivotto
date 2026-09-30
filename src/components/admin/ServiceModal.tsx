import { useState, useEffect, useRef, useId } from 'react'
import type { Service } from '@/types'
import { createService, updateService } from '@/services/clinicService'
import {
  uploadServiceImage,
  deleteServiceImage,
  validateImageFile,
} from '@/services/storageService'
import { slugify, isValidSlug, formatCurrency } from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import Button from '@/components/ui/Button'

interface ServiceModalProps {
  isOpen: boolean
  service: Service | null
  onClose: () => void
  onSuccess: (saved: Service, isEdit: boolean) => void
}

interface FormState {
  name: string
  slug: string
  duration_minutes: string
  price: string
  description: string
  image_url: string
}

export default function ServiceModal({
  isOpen,
  service,
  onClose,
  onSuccess,
}: ServiceModalProps) {
  const isEdit = service !== null
  const modalTitleId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    name: '',
    slug: '',
    duration_minutes: '60',
    price: '',
    description: '',
    image_url: '',
  })

  const [touchedSlug, setTouchedSlug] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Estado de imagem
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    if (service) {
      setForm({
        name: service.name || '',
        slug: service.slug || '',
        duration_minutes: String(service.duration_minutes || 60),
        price: service.price != null ? String(service.price) : '',
        description: service.description || '',
        image_url: service.image_url || '',
      })
      setTouchedSlug(true)
      setImagePreview(service.image_url || null)
    } else {
      setForm({
        name: '',
        slug: '',
        duration_minutes: '60',
        price: '',
        description: '',
        image_url: '',
      })
      setTouchedSlug(false)
      setImagePreview(null)
    }

    setSelectedFile(null)
    setRemoveImage(false)
    setShowUrlInput(false)
    setSubmitError(null)
    setErrors({})
    setUploading(false)
  }, [isOpen, service])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, submitting, onClose])

  if (!isOpen) return null

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value
    setForm((prev) => ({
      ...prev,
      name: newName,
      slug: !touchedSlug && !isEdit ? slugify(newName) : prev.slug,
    }))
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }))
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTouchedSlug(true)
    const raw = e.target.value.toLowerCase().replace(/\s+/g, '-')
    setForm((prev) => ({ ...prev, slug: raw }))
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: '' }))
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setSubmitError(validation.error || 'Arquivo inválido')
      return
    }

    setSubmitError(null)
    setSelectedFile(file)
    setRemoveImage(false)

    // Cria preview local
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    setSelectedFile(null)
    setImagePreview(null)
    setForm((prev) => ({ ...prev, image_url: '' }))
    setRemoveImage(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (!form.name.trim()) {
      errs.name = 'Nome do procedimento é obrigatório.'
    }

    const cleanSlug = form.slug.trim()
    if (!cleanSlug) {
      errs.slug = 'Slug identificador é obrigatório.'
    } else if (!isValidSlug(cleanSlug)) {
      errs.slug = 'Slug inválido. Use apenas letras minúsculas, números e hífens.'
    }

    const dur = parseInt(form.duration_minutes, 10)
    if (isNaN(dur) || dur <= 0) {
      errs.duration_minutes = 'Duração deve ser maior que zero minutos.'
    }

    if (form.price.trim() !== '') {
      const p = parseFloat(form.price.replace(',', '.'))
      if (isNaN(p) || p < 0) {
        errs.price = 'Preço não pode ser negativo.'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    const dur = parseInt(form.duration_minutes, 10)
    const prc = form.price.trim() !== '' ? parseFloat(form.price.replace(',', '.')) : null
    const desc = form.description.trim() || null
    const cleanSlug = form.slug.trim()

    try {
      // Guarda a URL da imagem antiga para exclusão posterior
      const oldImageUrl = service?.image_url || null

      let finalImageUrl: string | null = form.image_url.trim() || null

      // Se um novo arquivo foi selecionado, envia para o Supabase Storage
      if (selectedFile) {
        setUploading(true)
        try {
          finalImageUrl = await uploadServiceImage(selectedFile, service?.id)
        } catch (uploadErr) {
          const msg = uploadErr instanceof Error ? uploadErr.message : 'Falha no upload da imagem'
          setSubmitError(msg)
          setSubmitting(false)
          setUploading(false)
          return
        }
        setUploading(false)
      } else if (removeImage) {
        finalImageUrl = null
      }

      let saved: Service

      if (isEdit && service) {
        saved = await updateService({
          p_service_id: service.id,
          p_name: form.name.trim(),
          p_slug: cleanSlug,
          p_duration_minutes: dur,
          p_price: prc,
          p_description: desc,
          p_image_url: finalImageUrl,
        })

        // Só remove a imagem antiga DEPOIS de confirmar que a nova foi salva
        if (oldImageUrl && oldImageUrl !== finalImageUrl) {
          deleteServiceImage(oldImageUrl)
        }

        onSuccess(saved, true)
      } else {
        saved = await createService({
          p_name: form.name.trim(),
          p_slug: cleanSlug,
          p_duration_minutes: dur,
          p_price: prc,
          p_description: desc,
          p_image_url: finalImageUrl,
        })
        onSuccess(saved, false)
      }
      onClose()
    } catch (err) {
      setSubmitError(getFriendlyError(err))
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const parsedPrice = parseFloat(form.price.replace(',', '.'))
  const hasValidPrice = !isNaN(parsedPrice) && parsedPrice >= 0

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F5] border border-[#EAE2DC] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-[#EAE2DC] bg-white flex items-start justify-between shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#7D3B7C] font-semibold mb-1">
              {isEdit ? 'Editar Procedimento' : 'Novo Procedimento'}
            </p>
            <h2
              id={modalTitleId}
              className="font-display text-2xl text-[#1C181D]"
            >
              {isEdit ? form.name || 'Editar serviço' : 'Cadastrar serviço'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-[#756A73] hover:text-[#1C181D] p-1.5 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Fechar formulário"
          >
            ✕
          </button>
        </div>

        {/* Formulário com scroll */}
        <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[calc(85vh-130px)]">
          {submitError && (
            <div
              role="alert"
              className="p-4 bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 rounded-xl leading-relaxed"
            >
              {submitError}
            </div>
          )}

          {/* 1. Imagem do Procedimento */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-[#756A73] font-semibold">
              Foto do Procedimento <span className="text-[10px] text-[#A1A1AA] lowercase font-normal">(opcional)</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white border border-[#EAE2DC] rounded-2xl">
              {/* Preview */}
              <div className="relative w-24 h-24 rounded-xl border-2 border-[#7D3B7C]/20 overflow-hidden bg-[#FAF0F8] flex items-center justify-center shrink-0 shadow-xs">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview do procedimento"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-[#7D3B7C] opacity-50">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </span>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#7D3B7C] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Controles de Imagem */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#FAF0F8] text-[#7D3B7C] hover:bg-[#F3E5F1] rounded-xl border border-[#7D3B7C]/20 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {imagePreview ? 'Trocar imagem' : 'Enviar imagem'}
                  </button>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={submitting}
                      className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Remover imagem
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowUrlInput((v) => !v)}
                    className="text-[11px] text-[#736371] hover:text-[#2D242D] underline ml-1 cursor-pointer"
                  >
                    {showUrlInput ? 'Ocultar URL' : 'Informar URL'}
                  </button>
                </div>

                <p className="text-[11px] text-[#A1A1AA]">
                  Formatos aceitos: JPG, PNG ou WebP (máx. 5 MB).
                </p>

                {uploading && (
                  <p className="text-[11px] text-[#7D3B7C] font-medium animate-pulse">
                    Enviando imagem...
                  </p>
                )}

                {showUrlInput && (
                  <div className="pt-2 animate-fade-in">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto.jpg"
                      value={form.image_url}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, image_url: e.target.value }))
                        setImagePreview(e.target.value || null)
                        setSelectedFile(null)
                        setRemoveImage(false)
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-[#EAE2DC] bg-[#FAF7F5] rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Nome do Procedimento */}
          <div className="space-y-1">
            <label
              htmlFor="svc-name"
              className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
            >
              Nome do procedimento <span className="text-red-500">*</span>
            </label>
            <input
              id="svc-name"
              type="text"
              required
              autoFocus
              value={form.name}
              onChange={handleNameChange}
              placeholder="Ex: Penteado Noiva, Cronograma Capilar..."
              className="w-full px-3.5 py-2.5 text-sm border border-[#EAE2DC] bg-white rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C]"
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* 3. Slug */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="svc-slug"
                className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
              >
                Slug identificador (URL) <span className="text-red-500">*</span>
              </label>
              {!touchedSlug && form.name && (
                <span className="text-[10px] text-[#7D3B7C] tracking-wider">
                  gerado automaticamente
                </span>
              )}
            </div>
            <input
              id="svc-slug"
              type="text"
              required
              value={form.slug}
              onChange={handleSlugChange}
              placeholder="ex: penteado-noiva"
              className="w-full px-3.5 py-2.5 text-sm font-mono border border-[#EAE2DC] bg-white rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C]"
            />
            {errors.slug && (
              <p className="text-xs text-red-600">{errors.slug}</p>
            )}
          </div>

          {/* 4. Duração e Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="svc-duration"
                className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
              >
                Duração (minutos) <span className="text-red-500">*</span>
              </label>
              <input
                id="svc-duration"
                type="number"
                min="5"
                step="5"
                required
                value={form.duration_minutes}
                onChange={(e) => {
                  setForm({ ...form, duration_minutes: e.target.value })
                  if (errors.duration_minutes) setErrors({ ...errors, duration_minutes: '' })
                }}
                className="w-full px-3.5 py-2.5 text-sm border border-[#EAE2DC] bg-white rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C]"
              />
              {errors.duration_minutes && (
                <p className="text-xs text-red-600">{errors.duration_minutes}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="svc-price"
                className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
              >
                Preço (R$) <span className="text-[10px] text-[#A1A1AA] lowercase">(opcional)</span>
              </label>
              <input
                id="svc-price"
                type="text"
                value={form.price}
                onChange={(e) => {
                  setForm({ ...form, price: e.target.value })
                  if (errors.price) setErrors({ ...errors, price: '' })
                }}
                placeholder="Ex: 250,00"
                className="w-full px-3.5 py-2.5 text-sm border border-[#EAE2DC] bg-white rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C]"
              />
              {hasValidPrice && (
                <p className="text-[11px] text-[#1C181D] font-medium">
                  {formatCurrency(parsedPrice)}
                </p>
              )}
            </div>
          </div>

          {/* 5. Descrição */}
          <div className="space-y-1">
            <label
              htmlFor="svc-desc"
              className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
            >
              Descrição <span className="text-[10px] text-[#A1A1AA] lowercase">(opcional)</span>
            </label>
            <textarea
              id="svc-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descreva os diferenciais e como o atendimento é realizado..."
              className="w-full px-3.5 py-2.5 text-sm border border-[#EAE2DC] bg-white rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C] resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-[#EAE2DC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-[#EAE2DC] text-[#756A73] hover:text-[#1C181D] rounded-full transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <Button type="submit" isLoading={submitting} size="sm">
              {isEdit ? 'Salvar alterações' : 'Criar procedimento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
