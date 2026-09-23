import { Link } from 'react-router-dom'
import type { Service, AvailableSlot } from '@/types'
import { formatDateDisplay, formatTimeDisplay } from '@/utils/formatters'

interface StepSuccessProps {
  service: Service
  date: string
  slot: AvailableSlot
}

export default function StepSuccess({ service, date, slot }: StepSuccessProps) {
  return (
    <div className="py-10 sm:py-16 flex flex-col items-center text-center space-y-8 animate-fade-in max-w-xl mx-auto">
      
      {/* Ícone de Sucesso */}
      <div
        className="w-20 h-20 rounded-full bg-[#F9F0F7] border border-[#EBD5E8] flex items-center justify-center text-[#7D3B7C] shadow-sm"
        aria-hidden="true"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[#7D3B7C] font-semibold">
          Agendamento Confirmado
        </p>
        <h2 className="font-display text-3xl sm:text-5xl text-[#1C181D]">
          Aguardamos você no Espaço Pivotto!
        </h2>
        <p className="text-sm sm:text-base text-[#756A73] font-light max-w-md mx-auto leading-relaxed">
          Seu atendimento foi agendado com sucesso em nosso estúdio. Nosso espaço estará preparado com exclusividade para você.
        </p>
      </div>

      {/* Cartão de Resumo */}
      <div className="w-full bg-white rounded-3xl border border-[#EAE2DC] divide-y divide-[#EAE2DC] text-left shadow-xs overflow-hidden">
        <div className="p-5">
          <p className="text-[10px] uppercase tracking-wider text-[#756A73] mb-0.5">Procedimento</p>
          <p className="font-display text-lg text-[#1C181D]">{service.name}</p>
        </div>
        <div className="p-5">
          <p className="text-[10px] uppercase tracking-wider text-[#756A73] mb-0.5">Data</p>
          <p className="text-sm font-medium text-[#1C181D]">{formatDateDisplay(date)}</p>
        </div>
        <div className="p-5">
          <p className="text-[10px] uppercase tracking-wider text-[#756A73] mb-0.5">Horário de Início</p>
          <p className="text-sm font-medium text-[#7D3B7C]">{formatTimeDisplay(slot.start_at)}</p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3.5 text-xs uppercase tracking-wider font-semibold text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-md transition-colors"
        >
          Voltar à Página Inicial
        </Link>
        <a
          href="https://wa.me/message/PTIHBB6DIPQTH1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-wider font-medium text-[#1C181D] bg-white border border-[#EAE2DC] hover:bg-[#FAF7F5] rounded-full transition-colors"
        >
          Falar no WhatsApp
        </a>
      </div>

    </div>
  )
}
