import type { Service, AvailableSlot } from '@/types'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { formatDateDisplay, formatTimeDisplay } from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'

interface StepSlotProps {
  service: Service
  date: string
  selected: AvailableSlot | null
  onSelect: (slot: AvailableSlot) => void
  onNext: () => void
  onBack: () => void
  conflictError: string | null
}

export default function StepSlot({
  service,
  date,
  selected,
  onSelect,
  onNext,
  onBack,
  conflictError,
}: StepSlotProps) {
  const { slots, state, error, refetch } = useAvailableSlots(service.id, date)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold mb-1">
          Etapa 3 de 5
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-[#1C181D]">
          Escolha o melhor horário
        </h2>
        <p className="text-sm text-[#756A73] font-light mt-1">
          {service.name} · {formatDateDisplay(date)}
        </p>
      </div>

      {conflictError && (
        <div
          role="alert"
          className="p-4 border border-amber-300 bg-amber-50 rounded-2xl text-xs sm:text-sm text-amber-900 leading-relaxed flex items-center gap-3"
        >
          <span className="text-lg">⚠️</span>
          <span>{conflictError}</span>
        </div>
      )}

      {state === 'loading' && <Loader label="Consultando agenda do estúdio…" />}

      {state === 'error' && (
        <ErrorMessage
          message={getFriendlyError(error ?? '')}
          onRetry={refetch}
        />
      )}

      {state === 'success' && slots.length === 0 && (
        <div className="py-12 p-8 text-center bg-white rounded-2xl border border-[#EAE2DC] space-y-4">
          <p className="text-sm text-[#756A73]">
            Não encontramos horários disponíveis para esta data.
          </p>
          <button
            onClick={onBack}
            className="text-xs uppercase tracking-wider font-semibold text-[#7D3B7C] underline hover:text-[#672B66] cursor-pointer"
          >
            ← Escolher outro dia no calendário
          </button>
        </div>
      )}

      {state === 'success' && slots.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE2DC] space-y-4 shadow-2xs">
          <p className="text-xs uppercase tracking-wider text-[#756A73] font-medium">
            Horários Livres Encontrados:
          </p>
          <div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5"
            role="listbox"
            aria-label="Horários disponíveis"
          >
            {slots.map((slot) => {
              const isSelected = selected?.start_at === slot.start_at
              return (
                <button
                  key={slot.start_at}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelect(slot)}
                  className={[
                    'py-3 px-2 rounded-xl text-xs sm:text-sm text-center font-medium transition-all duration-150 cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C]',
                    isSelected
                      ? 'bg-[#7D3B7C] text-white shadow-xs font-semibold'
                      : 'bg-[#FAF7F5] text-[#1C181D] hover:bg-[#F9F0F7] hover:border-[#7D3B7C]/40 border border-[#EAE2DC]',
                  ].join(' ')}
                >
                  {formatTimeDisplay(slot.start_at)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-xs uppercase tracking-wider font-semibold text-[#756A73] hover:text-[#1C181D] transition-colors py-2 text-center sm:text-left cursor-pointer"
        >
          ← Alterar Data
        </button>
        <Button onClick={onNext} disabled={!selected} size="lg">
          Continuar para Dados →
        </Button>
      </div>
    </div>
  )
}
