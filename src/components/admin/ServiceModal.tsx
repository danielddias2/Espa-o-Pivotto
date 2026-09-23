import { useState, useEffect, useId } from 'react'
import type { Service } from '@/types'
import { createService, updateService } from '@/services/clinicService'
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

  const modalTitleId = useId()

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
    }
    setSubmitError(null)
    setErrors({})
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
    const img = form.image_url.trim() || null
    const cleanSlug = form.slug.trim()

    try {
      if (isEdit && service) {
        const updated = await updateService({
          p_service_id: service.id,
          p_name: form.name.trim(),
          p_slug: cleanSlug,
          p_duration_minutes: dur,
          p_price: prc,
          p_description: desc,
          p_image_url: img,
        })
        onSuccess(updated, true)
      } else {
        const created = await createService({
          p_name: form.name.trim(),
          p_slug: cleanSlug,
          p_duration_minutes: dur,
          p_price: prc,
          p_description: desc,
          p_image_url: img,
        })
        onSuccess(created, false)
      }
      onClose()
    } catch (err) {
      setSubmitError(getFriendlyError(err))
    } finally {
      setSubmitting(false)
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
    >
      <div
        className="bg-[#FAF7F5] border border-[#EAE2DC] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-[#EAE2DC] bg-white flex items-start justify-between">
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

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {submitError && (
            <div
              role="alert"
              className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl"
            >
              {submitError}
            </div>
          )}

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
