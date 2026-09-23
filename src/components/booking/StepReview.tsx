import type { Service, AvailableSlot, ClientData } from '@/types'
import Button from '@/components/ui/Button'
import {
  formatDateDisplay,
  formatTimeDisplay,
  formatDuration,
  formatCurrency,
} from '@/utils/formatters'

interface StepReviewProps {
  service: Service
  date: string
  slot: AvailableSlot
  client: ClientData
  isSubmitting: boolean
  error: string | null
  onConfirm: () => void
  onBack: () => void
  onChangeSlot: () => void
}

export default function StepReview({
  service,
  date,
  slot,
  client,
  isSubmitting,
  error,
  onConfirm,
  onBack,
  onChangeSlot,
}: StepReviewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold mb-1">
          Etapa 5 de 5
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-[#1C181D]">
          Revise e confirme seu agendamento
        </h2>
        <p className="text-sm text-[#756A73] font-light mt-1">
          Confira as informações antes de finalizar.
        </p>
      </div>

      <div className="max-w-xl bg-white rounded-3xl border border-[#EAE2DC] divide-y divide-[#EAE2DC] overflow-hidden shadow-2xs">
        {/* Procedimento */}
        <div className="p-6 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#7D3B7C] font-semibold">
            Procedimento Escolhido
          </span>
          <h3 className="font-display text-2xl text-[#1C181D]">
            {service.name}
          </h3>
          <div className="flex items-center gap-4 text-xs text-[#756A73] pt-1">
            {service.duration_minutes != null && (
              <span>Duração: {formatDuration(service.duration_minutes)}</span>
            )}
            {service.price != null && (
              <span className="font-semibold text-[#1C181D]">
                {formatCurrency(service.price)}
              </span>
            )}
          </div>
        </div>

        {/* Data & Horário */}
        <div className="p-6 space-y-1 bg-[#FAF7F5]">
          <span className="text-[10px] uppercase tracking-widest text-[#7D3B7C] font-semibold">
            Data & Horário
          </span>
          <p className="font-display text-lg text-[#1C181D]">
            {formatDateDisplay(date)}
          </p>
          <p className="text-sm text-[#756A73] font-medium">
            Início: {formatTimeDisplay(slot.start_at)}
          </p>
        </div>

        {/* Dados do Cliente */}
        <div className="p-6 space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#7D3B7C] font-semibold">
            Seus Dados
          </span>
          <div className="space-y-1.5 text-sm text-[#1C181D]">
            <p><strong className="font-medium text-[#756A73]">Nome:</strong> {client.name}</p>
            <p><strong className="font-medium text-[#756A73]">WhatsApp:</strong> {client.phone}</p>
            {client.email && (
              <p><strong className="font-medium text-[#756A73]">E-mail:</strong> {client.email}</p>
            )}
            {client.notes && (
              <p className="text-xs text-[#756A73] pt-1 leading-relaxed bg-[#F4EDE8] p-3 rounded-xl border border-[#EAE2DC]">
                <strong className="text-[#1C181D]">Observações:</strong> {client.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="max-w-xl p-5 border border-red-200 bg-red-50 rounded-2xl space-y-3"
        >
          <p className="text-sm text-red-700 leading-relaxed font-light">{error}</p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <button
              onClick={onChangeSlot}
              className="text-[#7D3B7C] hover:underline cursor-pointer"
            >
              Escolher outro horário
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="text-[#1C181D] hover:underline cursor-pointer disabled:opacity-50"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-xs uppercase tracking-wider font-semibold text-[#756A73] hover:text-[#1C181D] transition-colors py-2 text-center sm:text-left cursor-pointer disabled:opacity-50"
        >
          ← Voltar para Dados
        </button>
        <Button onClick={onConfirm} isLoading={isSubmitting} size="lg">
          Finalizar & Confirmar Agendamento ✓
        </Button>
      </div>
    </div>
  )
}
