import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard, extractLocalDateString } from '@/hooks/useDashboard'
import type { AdminAppointment } from '@/types'
import {
  formatDateDisplay,
  formatTimeDisplay,
  formatDuration,
  getTodayString,
} from '@/utils/formatters'
import ErrorMessage from '@/components/ui/ErrorMessage'

// ── Error Boundary de Proteção contra Tela Branca ─────────────────
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

class DashboardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const msg = error instanceof Error ? error.message : 'Erro de renderização'
    return { hasError: true, errorMessage: msg }
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('[Espaço Pivotto Dashboard] Erro no ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
            <h2 className="text-lg font-bold text-rose-800">
              Não foi possível carregar o Dashboard
            </h2>
            <p className="text-xs sm:text-sm font-medium text-rose-600 max-w-md mx-auto">
              Ocorreu uma inconsistência inesperada ao processar os dados: {this.state.errorMessage}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#7D3B7C] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#683067] transition-colors"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ── Funções de Formatação Defensivas ──────────────────────────────
function safeFormatTime(iso?: string | null): string {
  if (!iso) return '--:--'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '--:--'
    return formatTimeDisplay(iso)
  } catch {
    return '--:--'
  }
}

function safeScheduleLabel(iso?: string | null): string {
  if (!iso) return 'Horário a definir'
  try {
    const today = getTodayString()
    const appDate = extractLocalDateString(iso)
    const timeStr = safeFormatTime(iso)

    if (appDate === today) {
      return `Hoje às ${timeStr}`
    }

    const [y, m, d] = today.split('-').map(Number)
    const tomorrow = new Date(y, m - 1, d + 1)
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

    if (appDate === tomorrowStr) {
      return `Amanhã às ${timeStr}`
    }

    const parts = appDate.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]} às ${timeStr}`
    }

    return timeStr
  } catch {
    return '--:--'
  }
}

function safeFormatWhatsApp(phone?: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return null
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${fullNumber}`
}

const STATUS_MAP: Record<
  string,
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

function getStatusMeta(status?: string | null) {
  if (!status) {
    return {
      label: 'Não informado',
      badge: 'bg-stone-100 text-stone-600 border-stone-200',
      dot: 'bg-stone-400',
    }
  }

  return (
    STATUS_MAP[status] || {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      badge: 'bg-stone-100 text-stone-600 border-stone-200',
      dot: 'bg-stone-400',
    }
  )
}

// ── Componente Principal do Dashboard ─────────────────────────────
function DashboardContent() {
  const {
    metrics,
    upcomingAppointments,
    clinicSettings,
    state,
    error,
    refetch,
  } = useDashboard()

  const todayStr = getTodayString()
  let todayFormatted = ''
  try {
    todayFormatted = formatDateDisplay(todayStr)
  } catch {
    todayFormatted = todayStr
  }

  const isLoading = state === 'loading'

  const totalApps = metrics?.totalAppointmentsCount || 0
  const pendingPct = totalApps > 0 ? (metrics.pendingCount / totalApps) * 100 : 0
  const confirmedPct = totalApps > 0 ? (metrics.confirmedCount / totalApps) * 100 : 0
  const completedPct = totalApps > 0 ? (metrics.completedCount / totalApps) * 100 : 0
  const cancelledPct = totalApps > 0 ? (metrics.cancelledCount / totalApps) * 100 : 0

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* ── 1. HEADER SUPERIOR ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EBE3DC]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#C8A882]">
              Painel de Gestão Studio
            </span>
            {clinicSettings?.booking_enabled !== undefined && (
              <span
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border',
                  clinicSettings.booking_enabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200',
                ].join(' ')}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    clinicSettings.booking_enabled ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  aria-hidden="true"
                />
                {clinicSettings.booking_enabled ? 'Agendamento online ativo' : 'Agendamento pausado'}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-medium text-[#2D242D]">
            Visão Geral
          </h1>

          <p className="text-xs sm:text-sm text-[#736371] mt-1.5">
            {clinicSettings?.clinic_name || 'Espaço Pivotto'}
            {clinicSettings?.professional_name && ` · ${clinicSettings.professional_name}`}
            {' — '}
            Acompanhamento diário da agenda e clientes.
          </p>
        </div>

        {/* Indicador de Data e Botão de Atualização */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBE3DC]">
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#736371] block">
              Data de hoje
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#2D242D]">
              {todayFormatted}
            </span>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            title="Recarregar dados"
            className="p-3 bg-white border border-[#EBE3DC] rounded-xl text-[#736371] hover:text-[#7D3B7C] hover:border-[#7D3B7C] transition-all disabled:opacity-50 shadow-xs flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label="Atualizar dados do dashboard"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isLoading ? 'animate-spin' : ''}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mensagem de Erro Caso Falhe */}
      {state === 'error' && (
        <div className="py-2">
          <ErrorMessage
            message={error || 'Não foi possível carregar as informações do dashboard.'}
            onRetry={refetch}
          />
        </div>
      )}

      {/* ── 2. CARDS PRINCIPAIS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Agendamentos Hoje */}
        <Link
          to="/admin/agenda"
          className={[
            'p-5 sm:p-6 bg-white border rounded-2xl shadow-xs flex flex-col justify-between transition-all group',
            metrics.todayAppointmentsCount > 0
              ? 'border-[#7D3B7C] ring-2 ring-[#7D3B7C]/10'
              : 'border-[#EBE3DC] hover:border-[#7D3B7C]',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#736371]">
              Agendamentos hoje
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF0F8] text-[#7D3B7C] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div className="mt-5">
            {isLoading ? (
              <div className="h-10 w-20 bg-[#EBE3DC]/60 rounded-lg animate-pulse" />
            ) : (
              <div>
                <span className="text-3xl sm:text-4xl font-bold text-[#2D242D] block font-display">
                  {metrics.todayAppointmentsCount}
                </span>
                <p className="text-xs text-[#736371] mt-1">
                  Atendimentos marcados para hoje
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Card 2: Pendentes */}
        <Link
          to="/admin/agenda"
          className="p-5 sm:p-6 bg-white border border-[#EBE3DC] hover:border-[#C8A882] rounded-2xl shadow-xs flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#736371]">
              Pendentes
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="mt-5">
            {isLoading ? (
              <div className="h-10 w-20 bg-[#EBE3DC]/60 rounded-lg animate-pulse" />
            ) : (
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-[#2D242D] font-display">
                    {metrics.pendingCount}
                  </span>
                  {metrics.pendingCount > 0 && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Requer atenção
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#736371] mt-1">
                  Aguardando confirmação do studio
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Card 3: Confirmados */}
        <Link
          to="/admin/agenda"
          className="p-5 sm:p-6 bg-white border border-[#EBE3DC] hover:border-[#7D3B7C] rounded-2xl shadow-xs flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#736371]">
              Confirmados
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF0F8] text-[#7D3B7C] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="mt-5">
            {isLoading ? (
              <div className="h-10 w-20 bg-[#EBE3DC]/60 rounded-lg animate-pulse" />
            ) : (
              <div>
                <span className="text-3xl sm:text-4xl font-bold text-[#2D242D] block font-display">
                  {metrics.confirmedCount}
                </span>
                <p className="text-xs text-[#736371] mt-1">
                  Horários reservados e confirmados
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Card 4: Concluídos */}
        <Link
          to="/admin/agenda"
          className="p-5 sm:p-6 bg-white border border-[#EBE3DC] hover:border-emerald-500 rounded-2xl shadow-xs flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#736371]">
              Concluídos
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </div>
          <div className="mt-5">
            {isLoading ? (
              <div className="h-10 w-20 bg-[#EBE3DC]/60 rounded-lg animate-pulse" />
            ) : (
              <div>
                <span className="text-3xl sm:text-4xl font-bold text-[#2D242D] block font-display">
                  {metrics.completedCount}
                </span>
                <p className="text-xs text-[#736371] mt-1">
                  Atendimentos realizados com sucesso
                </p>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* ── 3. BARRA DE DISTRIBUIÇÃO ──────────────────────────────────── */}
      {totalApps > 0 && (
        <div className="bg-white border border-[#EBE3DC] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#736371]">
              Distribuição Histórica ({totalApps} registros)
            </span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
            <div style={{ width: `${confirmedPct}%` }} className="bg-[#7D3B7C]" title={`Confirmados: ${metrics.confirmedCount}`} />
            <div style={{ width: `${completedPct}%` }} className="bg-emerald-500" title={`Concluídos: ${metrics.completedCount}`} />
            <div style={{ width: `${pendingPct}%` }} className="bg-amber-400" title={`Pendentes: ${metrics.pendingCount}`} />
            <div style={{ width: `${cancelledPct}%` }} className="bg-stone-300" title={`Cancelados: ${metrics.cancelledCount}`} />
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-[#736371] pt-1">
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7D3B7C]" /> Confirmados ({metrics.confirmedCount})</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Concluídos ({metrics.completedCount})</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Pendentes ({metrics.pendingCount})</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-stone-300" /> Cancelados ({metrics.cancelledCount})</span>
          </div>
        </div>
      )}

      {/* ── 4. AÇÕES RÁPIDAS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/agenda"
          className="p-4 bg-white border border-[#EBE3DC] hover:border-[#7D3B7C] rounded-2xl text-center group transition-all"
        >
          <span className="text-xs font-semibold text-[#2D242D] group-hover:text-[#7D3B7C] flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
            Ver Agenda
          </span>
        </Link>
        <Link
          to="/admin/servicos"
          className="p-4 bg-white border border-[#EBE3DC] hover:border-[#7D3B7C] rounded-2xl text-center group transition-all"
        >
          <span className="text-xs font-semibold text-[#2D242D] group-hover:text-[#7D3B7C] flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9Z" /></svg>
            Serviços
          </span>
        </Link>
        <Link
          to="/admin/clientes"
          className="p-4 bg-white border border-[#EBE3DC] hover:border-[#7D3B7C] rounded-2xl text-center group transition-all"
        >
          <span className="text-xs font-semibold text-[#2D242D] group-hover:text-[#7D3B7C] flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            Clientes
          </span>
        </Link>
        <Link
          to="/admin/configuracoes"
          className="p-4 bg-white border border-[#EBE3DC] hover:border-[#7D3B7C] rounded-2xl text-center group transition-all"
        >
          <span className="text-xs font-semibold text-[#2D242D] group-hover:text-[#7D3B7C] flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>
            Configurações
          </span>
        </Link>
      </div>

      {/* ── 5. PRÓXIMOS AGENDAMENTOS ─────────────────────────────────── */}
      <div className="bg-white border border-[#EBE3DC] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-medium text-[#2D242D]">
              Próximos Atendimentos
            </h2>
            <p className="text-xs text-[#736371]">
              Compromissos agendados nos próximos dias
            </p>
          </div>
          <Link
            to="/admin/agenda"
            className="text-xs font-semibold text-[#7D3B7C] hover:underline"
          >
            Ver todos na agenda →
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-medium text-[#736371]">
              Nenhum agendamento futuro encontrado.
            </p>
            <p className="text-xs text-[#A898A6]">
              Novos agendamentos feitos no site aparecerão aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EBE3DC]/60 overflow-hidden">
            {upcomingAppointments.map((app: AdminAppointment) => {
              const meta = getStatusMeta(app.status)
              const waLink = safeFormatWhatsApp(app.client_phone)

              return (
                <div
                  key={app.appointment_id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F5] -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#2D242D]">
                        {app.client_name}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${meta.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#736371]">
                      <span className="font-medium text-[#7D3B7C]">
                        {app.service_name}
                      </span>
                      {app.duration_minutes && (
                        <span>({formatDuration(app.duration_minutes)})</span>
                      )}
                      <span>·</span>
                      <span>{app.client_phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold text-[#2D242D] bg-[#FAF0F8] px-3 py-1.5 rounded-xl border border-[#7D3B7C]/15">
                      {safeScheduleLabel(app.start_at)}
                    </span>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Falar no WhatsApp"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  )
}
