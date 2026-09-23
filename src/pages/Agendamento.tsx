import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Service, AvailableSlot, ClientData } from '@/types'
import { useServices } from '@/hooks/useServices'
import { useClinicSettings } from '@/hooks/useClinicSettings'
import { createPublicAppointment } from '@/services/clinicService'
import { getFriendlyError } from '@/utils/errorMessages'
import {
  getCachedClientData,
  setCachedClientData,
  clearCachedClientData,
} from '@/utils/bookingCache'
import BookingProgress from '@/components/booking/BookingProgress'
import StepService from '@/components/booking/StepService'
import StepDate from '@/components/booking/StepDate'
import StepSlot from '@/components/booking/StepSlot'
import StepForm from '@/components/booking/StepForm'
import StepReview from '@/components/booking/StepReview'
import StepSuccess from '@/components/booking/StepSuccess'

const INITIAL_CLIENT: ClientData = { name: '', phone: '', email: '', notes: '' }

interface BookingState {
  step: number
  service: Service | null
  date: string
  slot: AvailableSlot | null
  client: ClientData
  isSubmitting: boolean
  submitError: string | null
  conflictError: string | null
  isSuccess: boolean
}

const INITIAL_STATE: BookingState = {
  step: 1,
  service: null,
  date: '',
  slot: null,
  client: INITIAL_CLIENT,
  isSubmitting: false,
  submitError: null,
  conflictError: null,
  isSuccess: false,
}

export default function Agendamento() {
  const [searchParams] = useSearchParams()
  const { services, state: servicesState } = useServices()
  const { settings, state: settingsState } = useClinicSettings()
  const [booking, setBooking] = useState<BookingState>(() => ({
    ...INITIAL_STATE,
    client: getCachedClientData(),
  }))

  // Pré-seleção via querystring ?servico=ID
  useEffect(() => {
    const paramId = searchParams.get('servico')
    if (!paramId || servicesState !== 'success') return
    const found = services.find((s) => s.id === paramId)
    if (found) {
      setBooking((prev) => ({ ...prev, service: found }))
    }
  }, [searchParams, services, servicesState])

  function selectService(service: Service) {
    setBooking((prev) => ({
      ...prev,
      service,
      date: '',
      slot: null,
      conflictError: null,
      submitError: null,
    }))
  }

  function selectDate(date: string) {
    setBooking((prev) => ({
      ...prev,
      date,
      slot: null,
      conflictError: null,
      submitError: null,
    }))
  }

  function selectSlot(slot: AvailableSlot) {
    setBooking((prev) => ({
      ...prev,
      slot,
      conflictError: null,
      submitError: null,
    }))
  }

  function updateClient(client: ClientData) {
    setBooking((prev) => ({ ...prev, client }))
    setCachedClientData(client)
  }

  function goNext() {
    setBooking((prev) => ({ ...prev, step: prev.step + 1 }))
  }

  function goBack() {
    setBooking((prev) => ({
      ...prev,
      step: prev.step - 1,
      submitError: null,
    }))
  }

  function goToStep(step: number) {
    setBooking((prev) => ({
      ...prev,
      step,
      submitError: null,
    }))
  }

  async function handleSubmit() {
    const { service, slot, client } = booking
    if (!service || !slot) return

    setBooking((prev) => ({
      ...prev,
      isSubmitting: true,
      submitError: null,
    }))

    try {
      await createPublicAppointment({
        p_name: client.name,
        p_phone: client.phone,
        p_email: client.email || undefined,
        p_service_id: service.id,
        p_start_at: slot.start_at,
        p_notes: client.notes || undefined,
      })

      clearCachedClientData()

      setBooking((prev) => ({
        ...prev,
        isSubmitting: false,
        isSuccess: true,
      }))
    } catch (err) {
      const friendly = getFriendlyError(err)
      const isConflict = friendly.toLowerCase().includes('horário')

      setBooking((prev) => ({
        ...prev,
        isSubmitting: false,
        submitError: friendly,
        conflictError: isConflict ? friendly : prev.conflictError,
      }))
    }
  }

  const bookingDisabled =
    settingsState === 'success' &&
    settings !== null &&
    settings.booking_enabled === false

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAF7F5] pt-8 sm:pt-14 pb-20">
      
      {/* Banner Superior da Página */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EDE8] text-[11px] uppercase tracking-wider text-[#7D3B7C] font-semibold mb-3">
          <span>Espaço Pivotto</span>
          <span>•</span>
          <span>Redenção - PA</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-[#1C181D]">
          Agendamento Online
        </h1>
        <p className="text-sm text-[#756A73] font-light mt-1">
          Reserve seu horário com rapidez, comodidade e confirmação imediata.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* Quando agendamento estiver desativado */}
        {bookingDisabled && (
          <div className="p-10 bg-white rounded-3xl border border-[#EAE2DC] text-center space-y-4">
            <p className="font-display text-2xl text-[#1C181D]">
              Agendamentos online temporariamente em manutenção
            </p>
            <p className="text-sm text-[#756A73] font-light max-w-md mx-auto">
              Nossa equipe está à disposição no WhatsApp para agendar seu procedimento.
            </p>
            <a
              href="https://wa.me/message/PTIHBB6DIPQTH1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-wider font-semibold text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-md transition-colors"
            >
              Falar com Josielly no WhatsApp
            </a>
          </div>
        )}

        {/* Fluxo de Agendamento Ativo */}
        {!bookingDisabled && !booking.isSuccess && (
          <div className="bg-white/80 backdrop-blur-xs p-6 sm:p-10 lg:p-12 rounded-3xl border border-[#EAE2DC] shadow-sm">
            <BookingProgress currentStep={booking.step} />

            {booking.step === 1 && (
              <StepService
                services={services}
                state={servicesState}
                selected={booking.service}
                onSelect={selectService}
                onNext={goNext}
              />
            )}

            {booking.step === 2 && booking.service && (
              <StepDate
                service={booking.service}
                selectedDate={booking.date}
                onDateChange={selectDate}
                onNext={goNext}
                onBack={goBack}
              />
            )}

            {booking.step === 3 && booking.service && booking.date && (
              <StepSlot
                service={booking.service}
                date={booking.date}
                selected={booking.slot}
                onSelect={selectSlot}
                onNext={goNext}
                onBack={goBack}
                conflictError={booking.conflictError}
              />
            )}

            {booking.step === 4 && (
              <StepForm
                data={booking.client}
                onChange={updateClient}
                onNext={goNext}
                onBack={goBack}
              />
            )}

            {booking.step === 5 &&
              booking.service &&
              booking.slot &&
              booking.date && (
                <StepReview
                  service={booking.service}
                  date={booking.date}
                  slot={booking.slot}
                  client={booking.client}
                  isSubmitting={booking.isSubmitting}
                  error={booking.submitError}
                  onConfirm={handleSubmit}
                  onBack={goBack}
                  onChangeSlot={() => goToStep(3)}
                />
              )}
          </div>
        )}

        {/* Sucesso */}
        {booking.isSuccess &&
          booking.service &&
          booking.slot &&
          booking.date && (
            <div className="bg-white p-6 sm:p-12 rounded-3xl border border-[#EAE2DC] shadow-sm">
              <StepSuccess
                service={booking.service}
                date={booking.date}
                slot={booking.slot}
              />
            </div>
          )}

        {/* Rodapé de Ajuda */}
        <div className="mt-8 text-center text-xs text-[#756A73]">
          Precisa de auxílio com seu agendamento?{' '}
          <a
            href="https://wa.me/message/PTIHBB6DIPQTH1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7D3B7C] font-semibold underline"
          >
            Fale conosco pelo WhatsApp
          </a>
        </div>
      </div>

    </div>
  )
}
