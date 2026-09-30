import type { Service, Professional } from '@/types'
import Button from '@/components/ui/Button'
import { getTodayString, formatDateDisplay } from '@/utils/formatters'

interface StepDateProps {
  service: Service
  professional?: Professional | null
  isAnyProfessional?: boolean
  selectedDate: string
  onDateChange: (date: string) => void
  onNext: () => void
  onBack: () => void
}

export default function StepDate({
  service,
  professional,
  isAnyProfessional,
  selectedDate,
  onDateChange,
  onNext,
  onBack,
}: StepDateProps) {
  const today = getTodayString()

  const professionalLabel = isAnyProfessional
    ? 'Qualquer profissional disponível'
    : professional?.name

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold mb-1">
          Etapa 3 de 6
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-[#1C181D]">
          Escolha a data do atendimento
        </h2>
        <p className="text-sm text-[#756A73] font-light mt-1">
          <strong className="font-medium text-[#1C181D]">{service.name}</strong>
          {professionalLabel && <span> · Profissional: <strong className="font-medium text-[#7D3B7C]">{professionalLabel}</strong></span>}
        </p>
      </div>

      <div className="max-w-md p-6 bg-white rounded-2xl border border-[#EAE2DC] space-y-4 shadow-2xs">
        <label
          htmlFor="booking-date"
          className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
        >
          Data Desejada
        </label>
        <input
          id="booking-date"
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-4 py-3.5 text-sm border border-[#EAE2DC] rounded-xl bg-[#FAF7F5] text-[#1C181D] focus:outline-none focus:border-[#7D3B7C] focus:bg-white transition-colors cursor-pointer"
        />

        {selectedDate && (
          <div className="p-3.5 rounded-xl bg-[#F9F0F7] border border-[#EBD5E8] text-xs text-[#7D3B7C] font-medium flex items-center gap-2">
            <span>📅</span>
            <span>{formatDateDisplay(selectedDate)}</span>
          </div>
        )}

        <p className="text-[11px] text-[#756A73] leading-relaxed">
          Na etapa seguinte, você verá os horários em tempo real para o dia selecionado.
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-xs uppercase tracking-wider font-semibold text-[#756A73] hover:text-[#1C181D] transition-colors py-2 text-center sm:text-left cursor-pointer"
        >
          ← Alterar Profissional
        </button>
        <Button onClick={onNext} disabled={!selectedDate} size="lg">
          Ver Horários Disponíveis →
        </Button>
      </div>
    </div>
  )
}
