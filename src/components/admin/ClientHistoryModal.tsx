import { useState, useEffect } from 'react'
import type { AdminClient, AdminAppointment, AppointmentStatus } from '@/types'
import { getClientAppointments } from '@/services/clinicService'
import {
  formatDateDisplay,
  formatTimeDisplay,
  formatDuration,
} from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import Loader from '@/components/ui/Loader'
import Button from '@/components/ui/Button'

interface ClientHistoryModalProps {
  isOpen: boolean
  client: AdminClient | null
  onClose: () => void
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: 'Pendente',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmado',
    badge: 'bg-[#F9F0F7] text-[#7D3B7C] border-[#EBD5E8]',
    dot: 'bg-[#7D3B7C]',
  },
  completed: {
    label: 'Concluído',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  cancelled: {
    label: 'Cancelado',
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    dot: 'bg-zinc-400',
  },
  no_show: {
    label: 'Não Compareceu',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
}

function extractLocalDateString(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${fullNumber}`
}

export default function ClientHistoryModal({
  isOpen,
  client,
  onClose,
}: ClientHistoryModalProps) {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !client) return

    let isMounted = true
    setLoading(true)
    setError(null)

    getClientAppointments(client.id)
      .then((data) => {
        if (isMounted) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
          )
          setAppointments(sorted)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getFriendlyError(err))
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, client])

  if (!isOpen || !client) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#FAF7F5] border border-[#EAE2DC] max-w-2xl w-full max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="p-6 sm:p-8 border-b border-[#EAE2DC] flex items-start justify-between shrink-0 bg-white">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#7D3B7C] font-semibold block mb-1">
              Histórico & Atendimentos
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#1C181D]">
              {client.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#756A73] hover:text-[#1C181D] p-1.5 text-sm transition-colors cursor-pointer"
            aria-label="Fechar histórico"
          >
            ✕
          </button>
        </div>

        <div className="px-6 sm:px-8 py-4 bg-[#FAF7F5] border-b border-[#EAE2DC] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#756A73] block mb-0.5 font-medium">
              WhatsApp
            </span>
            <a
              href={formatWhatsAppLink(client.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7D3B7C] hover:underline font-mono"
            >
              {client.phone}
            </a>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#756A73] block mb-0.5 font-medium">
              E-mail
            </span>
            <span className="text-[#1C181D] truncate block">
              {client.email || 'Não informado'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#756A73] block mb-0.5 font-medium">
              Cliente desde
            </span>
            <span className="text-[#1C181D]">
              {formatDateDisplay(extractLocalDateString(client.created_at))}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#756A73] block mb-0.5 font-medium">
              Total Agendamentos
            </span>
            <span className="text-sm font-semibold text-[#7D3B7C]">
              {loading ? '…' : appointments.length}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[#756A73] font-semibold mb-3">
            Atendimentos Registrados
          </h3>

          {loading && <Loader label="Buscando agendamentos..." />}

          {error && (
            <div role="alert" className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {!loading && !error && appointments.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE2DC]">
              <p className="text-sm text-[#756A73]">
                Nenhum agendamento encontrado para esta cliente.
              </p>
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <div className="space-y-3">
              {appointments.map((app) => {
                const statusMeta = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending
                const dateStr = extractLocalDateString(app.start_at)

                return (
                  <div
                    key={app.appointment_id}
                    className="p-4 bg-white rounded-2xl border border-[#EAE2DC] space-y-3 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-display text-base text-[#1C181D] block">
                          {app.service_name}
                        </span>
                        <span className="text-xs text-[#756A73]">
                          Duração: {formatDuration(app.duration_minutes)}
                        </span>
                      </div>

                      <span
                        className={[
                          'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border shrink-0 w-fit',
                          statusMeta.badge,
                        ].join(' ')}
                      >
                        <span className={['w-1.5 h-1.5 rounded-full', statusMeta.dot].join(' ')} />
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-[#FAF7F5]">
                      <div>
                        <strong className="text-[#1C181D]">{formatDateDisplay(dateStr)}</strong>
                      </div>
                      <div className="text-[#756A73] font-mono">
                        {formatTimeDisplay(app.start_at)} – {formatTimeDisplay(app.end_at)}
                      </div>
                    </div>

                    {app.notes && (
                      <div className="text-xs bg-[#FAF7F5] p-2.5 rounded-xl border border-[#EAE2DC]/60 italic text-[#756A73]">
                        &quot;{app.notes}&quot;
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-4 px-6 sm:px-8 border-t border-[#EAE2DC] bg-white flex justify-end shrink-0">
          <Button onClick={onClose} variant="secondary" size="sm">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
