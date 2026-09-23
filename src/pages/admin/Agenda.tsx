import { useState, useMemo, useCallback } from 'react'
import type { AdminAppointment, AppointmentStatus } from '@/types'
import { useAdminAppointments } from '@/hooks/useAdminAppointments'
import {
  formatDateDisplay,
  formatTimeDisplay,
  getTodayString,
  formatDuration,
} from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'

type FilterStatus = 'all' | AppointmentStatus

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
    badge: 'bg-purple-50 text-[#7D3B7C] border-[#7D3B7C]/20',
    dot: 'bg-[#7D3B7C]',
  },
  completed: {
    label: 'Concluído',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  cancelled: {
    label: 'Cancelado',
    badge: 'bg-stone-100 text-stone-600 border-stone-200',
    dot: 'bg-stone-400',
  },
  no_show: {
    label: 'Não compareceu',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  const ny = date.getFullYear()
  const nm = String(date.getMonth() + 1).padStart(2, '0')
  const nd = String(date.getDate()).padStart(2, '0')
  return `${ny}-${nm}-${nd}`
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

export default function AdminAgenda() {
  const { appointments, state, error, refetch, updateStatus } = useAdminAppointments()

  // Navegação por dia (padrão: hoje)
  const today = useMemo(() => getTodayString(), [])
  const [selectedDate, setSelectedDate] = useState<string>(today)

  // Filtros de status e busca
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  // Modal de Detalhes
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null)

  // Feedback de ações
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 4000)
  }, [])

  // Atualização de status
  async function handleStatusChange(
    appointment: AdminAppointment,
    newStatus: AppointmentStatus
  ) {
    setUpdatingId(appointment.appointment_id)
    setActionError(null)

    try {
      await updateStatus(appointment.appointment_id, newStatus)
      const label = STATUS_CONFIG[newStatus].label.toLowerCase()
      showToast(`Agendamento de "${appointment.client_name}" marcado como ${label}.`)

      setSelectedAppointment((prev) =>
        prev && prev.appointment_id === appointment.appointment_id
          ? { ...prev, status: newStatus }
          : prev
      )
    } catch (err) {
      setActionError(getFriendlyError(err))
    } finally {
      setUpdatingId(null)
    }
  }

  // Agendamentos do dia selecionado
  const dayAppointments = useMemo(() => {
    return appointments.filter(
      (app) => extractLocalDateString(app.start_at) === selectedDate
    )
  }, [appointments, selectedDate])

  // Contadores por status no dia selecionado
  const counts = useMemo(() => {
    return {
      all: dayAppointments.length,
      pending: dayAppointments.filter((a) => a.status === 'pending').length,
      confirmed: dayAppointments.filter((a) => a.status === 'confirmed').length,
      completed: dayAppointments.filter((a) => a.status === 'completed').length,
      cancelled: dayAppointments.filter((a) => a.status === 'cancelled').length,
    }
  }, [dayAppointments])

  // Agendamentos filtrados por status e busca
  const filteredAppointments = useMemo(() => {
    return dayAppointments
      .filter((app) => {
        if (statusFilter !== 'all' && app.status !== statusFilter) {
          return false
        }

        if (search.trim()) {
          const q = search.toLowerCase().trim()
          const matchClient = app.client_name.toLowerCase().includes(q)
          const matchService = app.service_name.toLowerCase().includes(q)
          const matchPhone = app.client_phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
          const matchEmail = (app.client_email || '').toLowerCase().includes(q)
          if (!matchClient && !matchService && !matchPhone && !matchEmail) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
  }, [dayAppointments, statusFilter, search])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Toast flutuante */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#1E1422] text-[#FAF7F5] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#7D3B7C] text-sm animate-fade-in"
        >
          <span className="w-2 h-2 rounded-full bg-[#C8A882]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 text-xs"
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        </div>
      )}

      {/* Alerta de erro de ação */}
      {actionError && (
        <div
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 text-sm text-rose-700 rounded-2xl flex items-center justify-between"
        >
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-700 hover:text-rose-900 font-bold ml-4 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 1. CABEÇALHO & NAVEGAÇÃO DE DATA ──────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#EBE3DC]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#C8A882]">
            Controle de Horários
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-[#2D242D]">
            Agenda do Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#736371] mt-1">
            Visualização diária de atendimentos de cabelo, maquiagem e sobrancelha.
          </p>
        </div>

        {/* Controles de Navegação da Data */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            className={[
              'px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all',
              selectedDate === today
                ? 'bg-[#7D3B7C] text-white border-[#7D3B7C] shadow-sm'
                : 'bg-white text-[#2D242D] border-[#EBE3DC] hover:border-[#7D3B7C]',
            ].join(' ')}
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
            className="p-2 bg-white border border-[#EBE3DC] rounded-xl text-[#2D242D] hover:border-[#7D3B7C] transition-colors"
            title="Dia anterior"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="px-3.5 py-2 text-xs font-medium bg-white border border-[#EBE3DC] rounded-xl text-[#2D242D] focus:outline-none focus:border-[#7D3B7C] transition-colors"
          />

          <button
            type="button"
            onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
            className="p-2 bg-white border border-[#EBE3DC] rounded-xl text-[#2D242D] hover:border-[#7D3B7C] transition-colors"
            title="Próximo dia"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={state === 'loading'}
            className="p-2 bg-white border border-[#EBE3DC] rounded-xl text-[#736371] hover:text-[#7D3B7C] hover:border-[#7D3B7C] transition-colors disabled:opacity-50"
            title="Atualizar agenda"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={state === 'loading' ? 'animate-spin' : ''}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
          </button>
        </div>
      </div>

      {/* ── 2. BARRA DE FILTROS & BUSCA ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Filtros de Status */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-[#EBE3DC] rounded-2xl">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
              statusFilter === 'all'
                ? 'bg-[#7D3B7C] text-white shadow-xs'
                : 'text-[#736371] hover:text-[#2D242D]',
            ].join(' ')}
          >
            Todos ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-[#736371] hover:text-amber-800',
            ].join(' ')}
          >
            Pendentes ({counts.pending})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('confirmed')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
              statusFilter === 'confirmed'
                ? 'bg-[#7D3B7C] text-white shadow-xs'
                : 'text-[#736371] hover:text-[#7D3B7C]',
            ].join(' ')}
          >
            Confirmados ({counts.confirmed})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#736371] hover:text-emerald-800',
            ].join(' ')}
          >
            Concluídos ({counts.completed})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('cancelled')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
              statusFilter === 'cancelled'
                ? 'bg-stone-500 text-white shadow-xs'
                : 'text-[#736371] hover:text-stone-800',
            ].join(' ')}
          >
            Cancelados ({counts.cancelled})
          </button>
        </div>

        {/* Busca rápida */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por cliente, serviço…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] rounded-xl text-[#2D242D] placeholder:text-[#A898A6] focus:outline-none focus:border-[#7D3B7C] transition-colors"
          />
        </div>
      </div>

      {/* ── 3. LISTA DE AGENDAMENTOS ─────────────────────────────────── */}
      {state === 'loading' ? (
        <div className="py-24 flex justify-center">
          <Loader label="Carregando horários..." />
        </div>
      ) : state === 'error' ? (
        <ErrorMessage message={error || 'Erro ao carregar a agenda.'} onRetry={refetch} />
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white border border-[#EBE3DC] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF0F8] text-[#7D3B7C] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
          </div>
          <h3 className="font-display font-medium text-lg text-[#2D242D]">
            Nenhum agendamento para este filtro
          </h3>
          <p className="text-xs text-[#736371] max-w-sm mx-auto">
            {search
              ? 'Tente ajustar os termos da pesquisa.'
              : `Não há atendimentos registrados para ${formatDateDisplay(selectedDate)}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((app) => {
            const meta = STATUS_CONFIG[app.status] || {
              label: app.status,
              badge: 'bg-stone-100 text-stone-600 border-stone-200',
              dot: 'bg-stone-400',
            }
            const isUpdating = updatingId === app.appointment_id
            const waLink = formatWhatsAppLink(app.client_phone)

            return (
              <div
                key={app.appointment_id}
                className="bg-white border border-[#EBE3DC] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#7D3B7C]/40 transition-all"
              >
                {/* Informações Principais */}
                <div className="flex items-start gap-4">
                  {/* Horário */}
                  <div className="flex flex-col items-center justify-center bg-[#FAF0F8] border border-[#7D3B7C]/15 rounded-xl px-3.5 py-2.5 shrink-0 text-center min-w-[70px]">
                    <span className="text-base font-bold text-[#7D3B7C]">
                      {formatTimeDisplay(app.start_at)}
                    </span>
                    <span className="text-[10px] text-[#A898A6]">
                      {formatTimeDisplay(app.end_at)}
                    </span>
                  </div>

                  {/* Cliente e Serviço */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-[#2D242D]">
                        {app.client_name}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${meta.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#736371]">
                      <span className="font-medium text-[#7D3B7C]">{app.service_name}</span>
                      {app.duration_minutes && (
                        <span>({formatDuration(app.duration_minutes)})</span>
                      )}
                      <span>·</span>
                      <span>{app.client_phone}</span>
                    </div>

                    {app.notes && (
                      <p className="text-xs text-[#A898A6] italic line-clamp-1">
                        "{app.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Controles e Ações */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  {/* WhatsApp */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-200"
                    title="Enviar WhatsApp"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </a>

                  {/* Detalhes */}
                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(app)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#5C4A5A] hover:text-[#2D242D] hover:bg-stone-100 rounded-xl transition-colors border border-[#EBE3DC]"
                  >
                    Detalhes
                  </button>

                  {/* Alterar Status */}
                  <select
                    value={app.status}
                    disabled={isUpdating}
                    onChange={(e) => handleStatusChange(app, e.target.value as AppointmentStatus)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#EBE3DC] rounded-xl text-[#2D242D] focus:outline-none focus:border-[#7D3B7C] transition-colors disabled:opacity-50"
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmar</option>
                    <option value="completed">Concluir</option>
                    <option value="cancelled">Cancelar</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── 4. MODAL DE DETALHES ───────────────────────────────────────── */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DC] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE3DC]">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C8A882]">
                  Ficha do Agendamento
                </span>
                <h3 className="text-xl font-display font-medium text-[#2D242D]">
                  {selectedAppointment.client_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-[#736371] hover:text-[#2D242D] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-[#736371] block">Procedimento:</span>
                  <span className="text-sm font-medium text-[#7D3B7C]">
                    {selectedAppointment.service_name}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-[#736371] block">Duração:</span>
                  <span className="text-sm font-medium text-[#2D242D]">
                    {selectedAppointment.duration_minutes ? formatDuration(selectedAppointment.duration_minutes) : 'Não informado'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-[#736371] block">Horário:</span>
                  <span className="text-sm font-medium text-[#2D242D]">
                    {formatTimeDisplay(selectedAppointment.start_at)} às {formatTimeDisplay(selectedAppointment.end_at)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-[#736371] block">Data:</span>
                  <span className="text-sm font-medium text-[#2D242D]">
                    {formatDateDisplay(extractLocalDateString(selectedAppointment.start_at))}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#736371] block">Telefone / WhatsApp:</span>
                <a
                  href={formatWhatsAppLink(selectedAppointment.client_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-emerald-700 hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  {selectedAppointment.client_phone} ↗
                </a>
              </div>

              {selectedAppointment.client_email && (
                <div>
                  <span className="font-semibold text-[#736371] block">E-mail:</span>
                  <span className="text-sm font-medium text-[#2D242D]">
                    {selectedAppointment.client_email}
                  </span>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#EBE3DC]">
                  <span className="font-semibold text-[#736371] block mb-1">Observações da Cliente:</span>
                  <p className="text-[#2D242D] leading-relaxed">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#EBE3DC] flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAppointment(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
