import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Service } from '@/types'
import { useServices } from '@/hooks/useServices'
import { useClinicSettings } from '@/hooks/useClinicSettings'
import { getClinicWhatsAppLink } from '@/utils/whatsapp'
import BookingProgress from '@/components/booking/BookingProgress'
import StepService from '@/components/booking/StepService'
import StepProfessional from '@/components/booking/StepProfessional'

export default function Agendamento() {
  const [searchParams] = useSearchParams()
  const { services, state: servicesState } = useServices()
  const { settings, state: settingsState } = useClinicSettings()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  // Pré-seleção via querystring ?servico=ID (ex: vindo da Home / Catálogo)
  useEffect(() => {
    const paramId = searchParams.get('servico')
    if (!paramId || servicesState !== 'success') return
    const found = services.find((s) => s.id === paramId)
    if (found) {
      setSelectedService(found)
      setStep(2)
    }
  }, [searchParams, services, servicesState])

  // Seleciona o procedimento e avança para a escolha da profissional
  function handleSelectService(service: Service) {
    setSelectedService(service)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Volta para a etapa de seleção de procedimento
  function handleBackToServices() {
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const bookingDisabled =
    settingsState === 'success' &&
    settings !== null &&
    settings.booking_enabled === false

  const generalWhatsAppUrl = getClinicWhatsAppLink(
    settings?.whatsapp,
    'Olá! Gostaria de falar sobre os procedimentos do Espaço Pivotto.'
  )

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
          Escolha seu procedimento e profissional para atendimento exclusivo no estúdio.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* Quando agendamento estiver temporariamente desativado */}
        {bookingDisabled && (
          <div className="p-10 bg-white rounded-3xl border border-[#EAE2DC] text-center space-y-4">
            <p className="font-display text-2xl text-[#1C181D]">
              Agendamentos online temporariamente em manutenção
            </p>
            <p className="text-sm text-[#756A73] font-light max-w-md mx-auto">
              Nossa equipe está à disposição para agendar seu procedimento.
            </p>
            {generalWhatsAppUrl ? (
              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-wider font-semibold text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-md transition-colors cursor-pointer"
              >
                Falar com a equipe no WhatsApp
              </a>
            ) : (
              <p className="text-xs text-[#A1A1AA]">
                Entre em contato pelos nossos canais presenciais ou redes sociais.
              </p>
            )}
          </div>
        )}

        {/* Novo Fluxo Simplificado: Procedimento → Profissional → WhatsApp */}
        {!bookingDisabled && (
          <div className="bg-white/80 backdrop-blur-xs p-6 sm:p-10 lg:p-12 rounded-3xl border border-[#EAE2DC] shadow-sm">
            <BookingProgress currentStep={step} />

            {/* ETAPA 1: ESCOLHA DO PROCEDIMENTO */}
            {step === 1 && (
              <StepService
                services={services}
                state={servicesState}
                selected={selectedService}
                onSelect={handleSelectService}
                onNext={() => setStep(2)}
              />
            )}

            {/* ETAPA 2: ESCOLHA DA PROFISSIONAL & ENCAMINHAMENTO WHATSAPP */}
            {step === 2 && selectedService && (
              <StepProfessional
                service={selectedService}
                clinicSettings={settings}
                onBack={handleBackToServices}
              />
            )}
          </div>
        )}

        {/* Rodapé de Ajuda */}
        <div className="mt-8 text-center text-xs text-[#756A73]">
          {generalWhatsAppUrl ? (
            <>
              Dúvidas sobre os procedimentos?{' '}
              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7D3B7C] font-semibold underline"
              >
                Fale conosco pelo WhatsApp
              </a>
            </>
          ) : (
            <span>Dúvidas sobre os procedimentos? Fale com a equipe do Espaço Pivotto no estúdio.</span>
          )}
        </div>
      </div>
    </div>
  )
}
