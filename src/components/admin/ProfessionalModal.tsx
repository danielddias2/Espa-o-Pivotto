import { useState, useEffect, useRef, useId } from 'react'
import type { Professional, Service } from '@/types'
import {
  createProfessional,
  updateProfessional,
  setProfessionalServices,
  getActiveServices,
  getServicesByProfessional,
} from '@/services/clinicService'
import {
  uploadProfessionalPhoto,
  deleteProfessionalPhoto,
  validateImageFile,
} from '@/services/storageService'
import { getFriendlyError } from '@/utils/errorMessages'
import { formatCurrency, formatDuration } from '@/utils/formatters'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'

interface ProfessionalModalProps {
  isOpen: boolean
  professional: Professional | null
  onClose: () => void
  onSuccess: (saved: Professional, isEdit: boolean) => void
}

export default function ProfessionalModal({
  isOpen,
  professional,
  onClose,
  onSuccess,
}: ProfessionalModalProps) {
  const isEdit = professional !== null
  const modalTitleId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Campos do formulário
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [bio, setBio] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)

  // Procedimentos
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)

  // Status de envio
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carrega lista de serviços ativos do studio
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setServicesLoading(true)

    getActiveServices()
      .then((data) => {
        if (isMounted) {
          setAvailableServices(data)
        }
      })
      .catch((err) => {
        console.error('[ProfessionalModal] Erro ao carregar serviços:', err)
      })
      .finally(() => {
        if (isMounted) setServicesLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Inicializa dados da profissional
  useEffect(() => {
    if (!isOpen) return

    if (professional) {
      setName(professional.name || '')
      setSpecialty(professional.specialty || '')
      setWhatsapp(professional.whatsapp || '')
      setBio(professional.bio || '')
      setPhotoUrl(professional.photo_url || '')
      setPhotoPreview(professional.photo_url || null)
      setSelectedFile(null)
      setRemovePhoto(false)
      setShowUrlInput(false)

      // Carrega os procedimentos que essa profissional já realiza
      getServicesByProfessional(professional.id)
        .then((svcs) => {
          setSelectedServiceIds(svcs.map((s) => s.id))
        })
        .catch((err) => {
          console.warn('[ProfessionalModal] Erro ao carregar procedimentos da profissional:', err)
        })
    } else {
      setName('')
      setSpecialty('')
      setWhatsapp('')
      setBio('')
      setPhotoUrl('')
      setPhotoPreview(null)
      setSelectedFile(null)
      setRemovePhoto(false)
      setShowUrlInput(false)
      setSelectedServiceIds([])
    }

    setErrors({})
    setSubmitError(null)
  }, [isOpen, professional])

  // Tecla Escape para fechar
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
    setRemovePhoto(false)

    // Cria preview local
    const reader = new FileReader()
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleRemovePhoto() {
    setSelectedFile(null)
    setPhotoPreview(null)
    setPhotoUrl('')
    setRemovePhoto(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  function selectAllServices() {
    setSelectedServiceIds(availableServices.map((s) => s.id))
  }

  function clearServices() {
    setSelectedServiceIds([])
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {}

    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = 'O nome da profissional é obrigatório (mínimo 2 caracteres).'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setSubmitting(true)

    try {
      let finalPhotoUrl: string | null = photoUrl.trim() || null

      // Se um novo arquivo foi selecionado, envia para o Supabase Storage
      if (selectedFile) {
        try {
          finalPhotoUrl = await uploadProfessionalPhoto(selectedFile, professional?.id)
        } catch (uploadErr) {
          // Se falhou o upload, alerta o usuário mas permite continuar se for erro de bucket
          const msg = uploadErr instanceof Error ? uploadErr.message : 'Falha no upload da foto'
          setSubmitError(msg)
          setSubmitting(false)
          return
        }
      } else if (removePhoto) {
        finalPhotoUrl = null
        if (professional?.photo_url) {
          deleteProfessionalPhoto(professional.photo_url)
        }
      }

      const cleanName = name.trim()
      const cleanSpecialty = specialty.trim() || null
      const cleanWhatsapp = whatsapp.trim() || null
      const cleanBio = bio.trim() || null

      let savedProfessional: Professional

      if (isEdit && professional) {
        savedProfessional = await updateProfessional({
          p_professional_id: professional.id,
          p_name: cleanName,
          p_photo_url: finalPhotoUrl,
          p_specialty: cleanSpecialty,
          p_whatsapp: cleanWhatsapp,
          p_bio: cleanBio,
        })

        // Sincroniza procedimentos associados
        await setProfessionalServices(professional.id, selectedServiceIds)
        onSuccess(savedProfessional, true)
      } else {
        savedProfessional = await createProfessional({
          p_name: cleanName,
          p_photo_url: finalPhotoUrl,
          p_specialty: cleanSpecialty,
          p_whatsapp: cleanWhatsapp,
          p_bio: cleanBio,
        })

        // Sincroniza procedimentos associados
        if (savedProfessional && savedProfessional.id) {
          await setProfessionalServices(savedProfessional.id, selectedServiceIds)
        }
        onSuccess(savedProfessional, false)
      }

      onClose()
    } catch (err) {
      setSubmitError(getFriendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
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
              {isEdit ? 'Editar Cadastro' : 'Nova Profissional'}
            </p>
            <h2 id={modalTitleId} className="font-display text-2xl text-[#1C181D]">
              {isEdit ? professional?.name : 'Cadastrar Profissional'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-[#756A73] hover:text-[#1C181D] p-1.5 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Formulário com scroll */}
        <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[calc(85vh-130px)]">
          {submitError && (
            <div
              role="alert"
              className="p-4 bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 rounded-xl leading-relaxed"
            >
              {submitError}
            </div>
          )}

          {/* 1. Foto de Perfil */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-[#756A73] font-semibold">
              Foto de Perfil <span className="text-[10px] text-[#A1A1AA] lowercase font-normal">(opcional)</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white border border-[#EAE2DC] rounded-2xl">
              {/* Preview Circular */}
              <div className="relative w-20 h-20 rounded-full border-2 border-[#7D3B7C]/20 overflow-hidden bg-[#FAF0F8] flex items-center justify-center shrink-0 shadow-xs">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview da profissional"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display font-semibold text-2xl text-[#7D3B7C]">
                    {name.trim() ? name.trim().charAt(0).toUpperCase() : '✦'}
                  </span>
                )}
              </div>

              {/* Controles de Foto */}
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
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#FAF0F8] text-[#7D3B7C] hover:bg-[#F3E5F1] rounded-xl border border-[#7D3B7C]/20 transition-colors cursor-pointer"
                  >
                    {photoPreview ? 'Trocar foto' : 'Enviar foto'}
                  </button>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    >
                      Remover foto
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

                {showUrlInput && (
                  <div className="pt-2 animate-fade-in">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto.jpg"
                      value={photoUrl}
                      onChange={(e) => {
                        setPhotoUrl(e.target.value)
                        setPhotoPreview(e.target.value || null)
                        setSelectedFile(null)
                        setRemovePhoto(false)
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-[#EAE2DC] bg-[#FAF7F5] rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Nome da Profissional */}
          <div className="space-y-1">
            <label
              htmlFor="prof-name"
              className="block text-xs uppercase tracking-wider text-[#756A73] font-semibold"
            >
              Nome Completo <span className="text-rose-500">*</span>
            </label>
            <input
              id="prof-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              placeholder="Ex: Josielly Pivotto, Ana Paula..."
              className="w-full px-4 py-3 text-sm border border-[#EAE2DC] bg-white rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C] shadow-2xs"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-0.5">{errors.name}</p>}
          </div>

          {/* 3. Especialidade */}
          <div className="space-y-1">
            <label
              htmlFor="prof-specialty"
              className="block text-xs uppercase tracking-wider text-[#756A73] font-semibold"
            >
              Especialidade / Título <span className="text-[10px] text-[#A1A1AA] lowercase font-normal">(opcional)</span>
            </label>
            <input
              id="prof-specialty"
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Ex: Especialista em Penteados & Noivas"
              className="w-full px-4 py-3 text-sm border border-[#EAE2DC] bg-white rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C] shadow-2xs"
            />
          </div>

          {/* 4. WhatsApp Específico */}
          <div className="space-y-1">
            <label
              htmlFor="prof-whatsapp"
              className="block text-xs uppercase tracking-wider text-[#756A73] font-semibold"
            >
              WhatsApp Direto <span className="text-[10px] text-[#A1A1AA] lowercase font-normal">(opcional)</span>
            </label>
            <input
              id="prof-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: (94) 98765-4321"
              className="w-full px-4 py-3 text-sm border border-[#EAE2DC] bg-white rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C] shadow-2xs"
            />
            <p className="text-[11px] text-[#A1A1AA]">
              Número que receberá as mensagens das clientes ao agendarem com esta profissional. Se em branco, usa o WhatsApp geral do estúdio.
            </p>
          </div>

          {/* 4. Bio / Apresentação */}
          <div className="space-y-1">
            <label
              htmlFor="prof-bio"
              className="block text-xs uppercase tracking-wider text-[#756A73] font-semibold"
            >
              Bio & Diferenciais <span className="text-[10px] text-[#A1A1AA] lowercase font-normal">(opcional)</span>
            </label>
            <textarea
              id="prof-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte brevemente sobre a formação, experiência e atendimento da profissional..."
              className="w-full px-4 py-3 text-sm border border-[#EAE2DC] bg-white rounded-xl text-[#1C181D] focus:outline-none focus:border-[#7D3B7C] resize-none shadow-2xs leading-relaxed"
            />
          </div>

          {/* 5. Procedimentos Realizados */}
          <div className="space-y-3 pt-2 border-t border-[#EAE2DC]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#756A73] font-semibold">
                  Procedimentos Realizados
                </label>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Selecione quais serviços esta profissional está apta a atender.
                </p>
              </div>

              {availableServices.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAllServices}
                    className="text-[#7D3B7C] hover:underline font-medium cursor-pointer"
                  >
                    Marcar todos
                  </button>
                  <span className="text-stone-300">·</span>
                  <button
                    type="button"
                    onClick={clearServices}
                    className="text-[#736371] hover:underline font-medium cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
              )}
            </div>

            {servicesLoading ? (
              <div className="py-6 flex justify-center">
                <Loader label="Carregando procedimentos..." />
              </div>
            ) : availableServices.length === 0 ? (
              <div className="p-4 bg-white border border-[#EAE2DC] rounded-xl text-center text-xs text-[#736371]">
                Nenhum serviço ativo encontrado no catálogo. Cadastre procedimentos na aba "Serviços".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                {availableServices.map((svc) => {
                  const isChecked = selectedServiceIds.includes(svc.id)
                  return (
                    <label
                      key={svc.id}
                      className={[
                        'flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all',
                        isChecked
                          ? 'bg-[#FAF0F8] border-[#7D3B7C] shadow-2xs'
                          : 'bg-white border-[#EAE2DC] hover:border-[#7D3B7C]/40',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleService(svc.id)}
                        className="mt-0.5 rounded border-stone-300 text-[#7D3B7C] focus:ring-[#7D3B7C] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-[#2D242D] block truncate">
                          {svc.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[#736371] mt-0.5">
                          {svc.price != null && (
                            <span className="font-medium text-[#7D3B7C]">
                              {formatCurrency(svc.price)}
                            </span>
                          )}
                          <span>· {formatDuration(svc.duration_minutes)}</span>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
            <div className="text-right">
              <span className="text-[11px] font-semibold text-[#7D3B7C]">
                {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'procedimento selecionado' : 'procedimentos selecionados'}
              </span>
            </div>
          </div>

          {/* Rodapé com botões de ação */}
          <div className="pt-4 border-t border-[#EAE2DC] flex items-center justify-end gap-3 sticky bottom-0 bg-[#FAF7F5] pb-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-[#EAE2DC] text-[#756A73] hover:text-[#1C181D] rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              className="shadow-sm shadow-[#7D3B7C]/20"
            >
              {isEdit ? 'Salvar Alterações' : 'Cadastrar Profissional'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
