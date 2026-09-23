import { useState, useEffect, useCallback } from 'react'
import { useClinicSettings } from '@/hooks/useClinicSettings'
import { updateClinicSettings } from '@/services/clinicService'
import { getFriendlyError } from '@/utils/errorMessages'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'

export default function AdminConfiguracoes() {
  const { settings, state, error, refetch } = useClinicSettings()

  const [clinicName, setClinicName] = useState('')
  const [professionalName, setProfessionalName] = useState('')
  const [bookingEnabled, setBookingEnabled] = useState(true)
  const [minNoticeHours, setMinNoticeHours] = useState(2)
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30)
  const [slotIntervalMinutes, setSlotIntervalMinutes] = useState(30)

  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Sincroniza formulário com dados carregados
  useEffect(() => {
    if (settings) {
      if (settings.clinic_name) setClinicName(settings.clinic_name)
      if (settings.professional_name) setProfessionalName(settings.professional_name)
      if (settings.booking_enabled !== undefined) setBookingEnabled(settings.booking_enabled)
      if (typeof settings.min_notice_hours === 'number') setMinNoticeHours(settings.min_notice_hours)
      if (typeof settings.max_advance_days === 'number') setMaxAdvanceDays(settings.max_advance_days)
      if (typeof settings.slot_interval_minutes === 'number') setSlotIntervalMinutes(settings.slot_interval_minutes)
    }
  }, [settings])

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 4000)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedClinic = clinicName.trim()
    if (!trimmedClinic) {
      setActionError('O nome do espaço não pode ficar em branco.')
      return
    }

    setIsSaving(true)
    setActionError(null)
    setSuccessMessage(null)

    try {
      await updateClinicSettings({
        p_clinic_name: trimmedClinic,
        p_professional_name: professionalName.trim() || undefined,
        p_booking_enabled: bookingEnabled,
        p_min_notice_hours: Number(minNoticeHours),
        p_max_advance_days: Number(maxAdvanceDays),
        p_slot_interval_minutes: Number(slotIntervalMinutes),
      })

      setSuccessMessage('Configurações salvas com sucesso!')
      showToast('Configurações do Espaço Pivotto atualizadas.')
      await refetch()
    } catch (err) {
      setActionError(getFriendlyError(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Toast flutuante */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#1E1422] text-[#FAF7F5] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#7D3B7C] text-sm animate-fade-in"
        >
          <span className="w-2 h-2 rounded-full bg-[#C8A882]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 text-xs"
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 1. CABEÇALHO ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EBE3DC]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#C8A882]">
            Studio & Regras de Atendimento
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-[#2D242D]">
            Configurações
          </h1>
          <p className="text-xs sm:text-sm text-[#736371] mt-1">
            Informações institucionais, disponibilidade da agenda e regras de reserva.
          </p>
        </div>
      </div>

      {state === 'loading' ? (
        <div className="py-24 flex justify-center">
          <Loader label="Carregando configurações..." />
        </div>
      ) : state === 'error' ? (
        <ErrorMessage message={error || 'Erro ao carregar configurações.'} onRetry={refetch} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl" noValidate>
          {actionError && (
            <div role="alert" className="p-4 bg-rose-50 border border-rose-200 text-sm text-rose-700 rounded-2xl">
              {actionError}
            </div>
          )}

          {successMessage && (
            <div role="status" className="p-4 bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 rounded-2xl">
              {successMessage}
            </div>
          )}

          {/* Seção 1: Identidade do Studio */}
          <div className="bg-white border border-[#EBE3DC] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <h2 className="font-display font-medium text-lg text-[#2D242D]">
              Identidade do Studio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4A5A]">
                  Nome do Studio / Espaço
                </label>
                <input
                  type="text"
                  required
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#FAF7F5] border border-[#E2D8D0] rounded-xl text-[#2D242D] focus:outline-none focus:border-[#7D3B7C] focus:bg-white transition-colors"
                  placeholder="Espaço Pivotto"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4A5A]">
                  Profissional Principal
                </label>
                <input
                  type="text"
                  value={professionalName}
                  onChange={(e) => setProfessionalName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#FAF7F5] border border-[#E2D8D0] rounded-xl text-[#2D242D] focus:outline-none focus:border-[#7D3B7C] focus:bg-white transition-colors"
                  placeholder="Josielly Pivotto"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Regras do Agendamento Online */}
          <div className="bg-white border border-[#EBE3DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE3DC]">
              <div>
                <h2 className="font-display font-medium text-lg text-[#2D242D]">
                  Agendamento Online no Site
                </h2>
                <p className="text-xs text-[#736371] mt-0.5">
                  Permitir que clientes agendem horários diretamente pelo site.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingEnabled}
                  onChange={(e) => setBookingEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7D3B7C]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4A5A]">
                  Intervalo entre Horários (min)
                </label>
                <select
                  value={slotIntervalMinutes}
                  onChange={(e) => setSlotIntervalMinutes(Number(e.target.value))}
                  className="w-full px-4 py-3 text-sm bg-[#FAF7F5] border border-[#E2D8D0] rounded-xl text-[#2D242D] focus:outline-none focus:border-[#7D3B7C] focus:bg-white transition-colors"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (1 hora)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4A5A]">
                  Antecedência Mínima (horas)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={minNoticeHours}
                  onChange={(e) => setMinNoticeHours(Number(e.target.value))}
                  className="w-full px-4 py-3 text-sm bg-[#FAF7F5] border border-[#E2D8D0] rounded-xl text-[#2D242D] focus:outline-none focus:border-[#7D3B7C] focus:bg-white transition-colors"
                />
                <span className="text-[10px] text-[#A898A6]">Evita reservas de última hora</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4A5A]">
                  Janela Máxima (dias futuros)
                </label>
                <input
                  type="number"
                  min={7}
                  max={120}
                  value={maxAdvanceDays}
                  onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
                  className="w-full px-4 py-3 text-sm bg-[#FAF7F5] border border-[#E2D8D0] rounded-xl text-[#2D242D] focus:outline-none focus:border-[#7D3B7C] focus:bg-white transition-colors"
                />
                <span className="text-[10px] text-[#A898A6]">Quantos dias à frente abrir vaga</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              className="px-8 shadow-md shadow-[#7D3B7C]/20"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
