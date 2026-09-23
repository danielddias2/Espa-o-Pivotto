import { useState } from 'react'
import type { ClientData } from '@/types'
import Button from '@/components/ui/Button'

interface StepFormProps {
  data: ClientData
  onChange: (data: ClientData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepForm({ data, onChange, onNext, onBack }: StepFormProps) {
  const [touched, setTouched] = useState({ name: false, phone: false })

  const nameError = touched.name && !data.name.trim() ? 'Nome completo é obrigatório' : null
  const phoneError = touched.phone && !data.phone.trim() ? 'Telefone / WhatsApp é obrigatório' : null

  function handleNext() {
    setTouched({ name: true, phone: true })
    if (!data.name.trim() || !data.phone.trim()) return
    onNext()
  }

  function update(field: keyof ClientData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [field]: e.target.value })
  }

  function touch(field: 'name' | 'phone') {
    return () => setTouched((t) => ({ ...t, [field]: true }))
  }

  const inputBase =
    'w-full px-4 py-3.5 text-sm rounded-xl border bg-[#FAF7F5] text-[#1C181D] placeholder:text-[#A1A1AA] focus:outline-none focus:bg-white transition-colors'

  const inputOk = 'border-[#EAE2DC] focus:border-[#7D3B7C]'
  const inputErr = 'border-red-400 focus:border-red-500 bg-red-50/20'

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold mb-1">
          Etapa 4 de 5
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-[#1C181D]">
          Informe seus dados de contato
        </h2>
        <p className="text-sm text-[#756A73] font-light mt-1">
          Usamos esses dados para enviar a confirmação e lembretes do atendimento.
        </p>
      </div>

      <div className="max-w-xl bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE2DC] shadow-2xs space-y-5">
        {/* Nome */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-name"
            className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
          >
            Nome Completo <span className="text-red-500">*</span>
          </label>
          <input
            id="form-name"
            type="text"
            autoComplete="name"
            value={data.name}
            onChange={update('name')}
            onBlur={touch('name')}
            placeholder="Ex.: Maria Eduarda"
            className={`${inputBase} ${nameError ? inputErr : inputOk}`}
          />
          {nameError && (
            <p role="alert" className="text-xs text-red-600 mt-1">{nameError}</p>
          )}
        </div>

        {/* Telefone / WhatsApp */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-phone"
            className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
          >
            WhatsApp / Telefone <span className="text-red-500">*</span>
          </label>
          <input
            id="form-phone"
            type="tel"
            autoComplete="tel"
            value={data.phone}
            onChange={update('phone')}
            onBlur={touch('phone')}
            placeholder="(94) 99000-0000"
            className={`${inputBase} ${phoneError ? inputErr : inputOk}`}
          />
          {phoneError && (
            <p role="alert" className="text-xs text-red-600 mt-1">{phoneError}</p>
          )}
        </div>

        {/* E-mail */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-email"
            className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
          >
            E-mail <span className="text-[11px] normal-case text-[#A1A1AA]">(opcional)</span>
          </label>
          <input
            id="form-email"
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={update('email')}
            placeholder="seu@email.com"
            className={`${inputBase} ${inputOk}`}
          />
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-notes"
            className="block text-xs uppercase tracking-wider text-[#756A73] font-medium"
          >
            Observações ou Preferências <span className="text-[11px] normal-case text-[#A1A1AA]">(opcional)</span>
          </label>
          <textarea
            id="form-notes"
            rows={3}
            value={data.notes}
            onChange={update('notes')}
            placeholder="Ex.: Vou para um evento à noite, tenho cabelos cacheados, noiva..."
            className={`${inputBase} ${inputOk} resize-none`}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-xs uppercase tracking-wider font-semibold text-[#756A73] hover:text-[#1C181D] transition-colors py-2 text-center sm:text-left cursor-pointer"
        >
          ← Alterar Horário
        </button>
        <Button onClick={handleNext} size="lg">
          Revisar Agendamento →
        </Button>
      </div>
    </div>
  )
}
