import { useState } from 'react'
import type { Service, Professional, ClinicSettings } from '@/types'
import { useProfessionals } from '@/hooks/useProfessionals'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { generateProfessionalWhatsAppLink, getClinicWhatsAppLink } from '@/utils/whatsapp'

interface StepProfessionalProps {
  service: Service
  clinicSettings?: ClinicSettings | null
  onBack: () => void
}

export default function StepProfessional({
  service,
  clinicSettings,
  onBack,
}: StepProfessionalProps) {
  const { professionals, state, error, refetch } = useProfessionals(service.id)
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null)

  // Gera o link do WhatsApp para a profissional selecionada (ou fallback para clínica)
  // Retorna null se nem a profissional nem a clínica possuírem WhatsApp configurado
  const whatsappUrl = selectedProf
    ? generateProfessionalWhatsAppLink({
        service,
        professional: selectedProf,
        clinicWhatsApp: clinicSettings?.whatsapp,
      })
    : null

  const generalClinicWaUrl = getClinicWhatsAppLink(
    clinicSettings?.whatsapp,
    `Olá! Gostaria de informações sobre o procedimento ${service.name} no Espaço Pivotto.`
  )

  function handleSelectProf(prof: Professional) {
    setSelectedProf(prof)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── 1. CABEÇALHO DA ETAPA ────────────────────────────────────── */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold mb-1">
          Etapa 2 de 2
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-[#1C181D]">
          Escolha a Profissional
        </h2>
        <p className="text-sm text-[#756A73] font-light mt-1">
          Procedimento selecionado:{' '}
          <strong className="font-medium text-[#1C181D]">{service.name}</strong>
        </p>
      </div>

      {state === 'loading' && <Loader label="Buscando profissionais habilitadas…" />}

      {state === 'error' && (
        <ErrorMessage
          message={error || 'Erro ao carregar profissionais.'}
          onRetry={refetch}
        />
      )}

      {state === 'success' && (
        <div className="space-y-6">
          {professionals.length > 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
              role="radiogroup"
              aria-label="Seleção de profissional"
            >
              {professionals.map((prof) => {
                const isSelected = selectedProf?.id === prof.id

                return (
                  <div
                    key={prof.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => handleSelectProf(prof)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        handleSelectProf(prof)
                      }
                    }}
                    className={[
                      'p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3.5 group',
                      isSelected
                        ? 'border-[#7D3B7C] bg-[#FAF0F8] ring-2 ring-[#7D3B7C]/20 shadow-xs'
                        : 'border-[#EAE2DC] bg-white hover:border-[#7D3B7C]/40 hover:bg-[#FAF7F5]',
                    ].join(' ')}
                  >
                    {/* Avatar Circular */}
                    <div className="w-12 h-12 rounded-full border border-[#7D3B7C]/20 overflow-hidden bg-[#FAF0F8] flex items-center justify-center shrink-0 shadow-2xs">
                      {prof.photo_url ? (
                        <img
                          src={prof.photo_url}
                          alt={prof.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-display font-semibold text-lg text-[#7D3B7C]">
                          {prof.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#1C181D] truncate group-hover:text-[#7D3B7C] transition-colors">
                        {prof.name}
                      </h3>

                      {prof.specialty && (
                        <p className="text-xs text-[#C8A882] font-medium truncate mt-0.5">
                          {prof.specialty}
                        </p>
                      )}

                      {prof.bio && (
                        <p className="text-[11px] text-[#756A73] leading-relaxed line-clamp-2 mt-1">
                          {prof.bio}
                        </p>
                      )}
                    </div>

                    {/* Radio indicator */}
                    <div
                      className={[
                        'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                        isSelected
                          ? 'border-[#7D3B7C] bg-[#7D3B7C]'
                          : 'border-[#D1C7BD] bg-white',
                      ].join(' ')}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 bg-[#FAF7F5] border border-[#EAE2DC] rounded-3xl text-center space-y-3">
              <p className="font-display text-xl text-[#1C181D]">
                Nenhuma profissional vinculada no momento
              </p>
              <p className="text-xs sm:text-sm text-[#756A73] font-light max-w-md mx-auto">
                Este procedimento ainda não possui profissionais vinculadas no sistema.
              </p>
              {generalClinicWaUrl && (
                <div className="pt-2">
                  <a
                    href={generalClinicWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-semibold text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-md transition-colors"
                  >
                    Consultar no WhatsApp do Estúdio
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ── 2. SEÇÃO DE ENCAMINHAMENTO PARA O WHATSAPP ─────────────── */}
          {selectedProf && (
            <div className="mt-8 p-6 sm:p-8 bg-gradient-to-br from-[#FAF0F8] to-[#FAF7F5] border border-[#7D3B7C]/25 rounded-3xl space-y-4 animate-fade-in shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-medium text-lg text-[#1C181D]">
                    Próximo passo: Conversar no WhatsApp
                  </h4>
                  <p className="text-xs sm:text-sm text-[#756A73] leading-relaxed">
                    Você será encaminhado para combinar o melhor dia e horário do seu atendimento diretamente com{' '}
                    <strong className="text-[#1C181D]">{selectedProf.name}</strong>.
                  </p>
                </div>
              </div>

              {whatsappUrl ? (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-xs uppercase tracking-wider font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-md shadow-[#25D366]/20 transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
                    </svg>
                    <span>Falar com {selectedProf.name} no WhatsApp</span>
                  </a>

                  <span className="text-[11px] text-[#A1A1AA] text-center sm:text-right">
                    Abertura segura e direta sem formulários.
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-amber-900 text-xs sm:text-sm space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>Canal de WhatsApp ainda não configurado</span>
                  </p>
                  <p className="text-amber-800/90 leading-relaxed">
                    O número de WhatsApp direto desta profissional e o WhatsApp geral da clínica ainda não foram preenchidos nas configurações do sistema. Cadastre o número no painel administrativo para habilitar o redirecionamento automático.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 3. BOTÃO DE VOLTAR ───────────────────────────────────────── */}
      <div className="pt-4 border-t border-[#EAE2DC] flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs uppercase tracking-wider font-semibold text-[#756A73] hover:text-[#1C181D] transition-colors py-2 text-center sm:text-left cursor-pointer flex items-center gap-2"
        >
          <span>←</span>
          <span>Alterar Procedimento</span>
        </button>
      </div>
    </div>
  )
}
