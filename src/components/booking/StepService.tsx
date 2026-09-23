import type { Service, LoadingState } from '@/types'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { formatCurrency, formatDuration } from '@/utils/formatters'

interface StepServiceProps {
  services: Service[]
  state: LoadingState
  selected: Service | null
  onSelect: (service: Service) => void
  onNext: () => void
}

export default function StepService({
  services,
  state,
  selected,
  onSelect,
  onNext,
}: StepServiceProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold mb-1">
          Etapa 1 de 5
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-[#1C181D]">
          Qual procedimento você deseja realizar?
        </h2>
        <p className="text-sm text-[#756A73] font-light mt-1">
          Selecione o serviço para consultar os dias e horários disponíveis.
        </p>
      </div>

      {state === 'loading' && <Loader label="Buscando serviços disponíveis…" />}

      {state === 'error' && (
        <ErrorMessage message="Não foi possível carregar os serviços. Tente novamente em instantes." />
      )}

      {state === 'success' && services.length === 0 && (
        <div className="py-12 text-center p-8 bg-white rounded-2xl border border-[#EAE2DC] space-y-4">
          <p className="text-sm text-[#756A73]">
            Nenhum serviço disponível para agendamento online no momento.
          </p>
          <a
            href="https://wa.me/message/PTIHBB6DIPQTH1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-semibold uppercase tracking-wider text-[#7D3B7C] underline"
          >
            Falar pelo WhatsApp para consultar horários →
          </a>
        </div>
      )}

      {state === 'success' && services.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          role="listbox"
          aria-label="Lista de serviços"
        >
          {services.map((service) => {
            const isSelected = selected?.id === service.id
            return (
              <button
                key={service.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(service)}
                className={[
                  'text-left p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C]',
                  isSelected
                    ? 'border-[#7D3B7C] bg-[#F9F0F7] shadow-sm'
                    : 'border-[#EAE2DC] bg-white hover:border-[#7D3B7C]/40 hover:bg-[#FAF7F5]',
                ].join(' ')}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#7D3B7C] font-semibold">
                      Procedimento
                    </span>
                    {service.duration_minutes != null && (
                      <span className="text-xs text-[#756A73]">
                        {formatDuration(service.duration_minutes)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl text-[#1C181D]">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="text-xs sm:text-sm text-[#756A73] font-light leading-relaxed mt-1.5 line-clamp-3">
                      {service.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#EAE2DC]/60 text-xs">
                  {service.price != null ? (
                    <span className="font-semibold text-[#1C181D]">
                      {formatCurrency(service.price)}
                    </span>
                  ) : (
                    <span className="text-[#756A73] italic">Sob consulta</span>
                  )}
                  <span
                    className={[
                      'font-medium text-xs',
                      isSelected ? 'text-[#7D3B7C]' : 'text-[#756A73]',
                    ].join(' ')}
                  >
                    {isSelected ? '✓ Selecionado' : 'Selecionar'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!selected} size="lg">
          Continuar para Data →
        </Button>
      </div>
    </div>
  )
}
