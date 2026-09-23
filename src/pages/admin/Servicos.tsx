import { useState, useMemo } from 'react'
import type { Service } from '@/types'
import { useAdminServices } from '@/hooks/useAdminServices'
import { setServiceActive } from '@/services/clinicService'
import { formatCurrency, formatDuration } from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import ServiceModal from '@/components/admin/ServiceModal'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'
import Button from '@/components/ui/Button'

type FilterStatus = 'all' | 'active' | 'inactive'

export default function AdminServicos() {
  const { services, state, error, refetch, setServices } = useAdminServices()

  // Estado do Modal
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Filtros
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState<FilterStatus>('all')

  // Feedback e Loading pontual de toggle
  const [togglingId, setTogglingId]         = useState<string | null>(null)
  const [toastMessage, setToastMessage]     = useState<string | null>(null)
  const [actionError, setActionError]       = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 4000)
  }

  function handleNewService() {
    setEditingService(null)
    setModalOpen(true)
  }

  function handleEditService(svc: Service) {
    setEditingService(svc)
    setModalOpen(true)
  }

  function handleModalSuccess(saved: Service, isEdit: boolean) {
    if (isEdit) {
      setServices((prev) =>
        prev.map((s) => (s.id === saved.id ? { ...s, ...saved } : s))
      )
      showToast(`Procedimento "${saved.name}" atualizado com sucesso.`)
    } else {
      setServices((prev) => [saved, ...prev])
      showToast(`Procedimento "${saved.name}" cadastrado com sucesso.`)
    }
    refetch()
  }

  async function handleToggleActive(svc: Service) {
    const nextState = !svc.active
    setTogglingId(svc.id)
    setActionError(null)

    try {
      await setServiceActive(svc.id, nextState)
      setServices((prev) =>
        prev.map((s) => (s.id === svc.id ? { ...s, active: nextState } : s))
      )
      showToast(
        `Procedimento "${svc.name}" ${nextState ? 'ativado' : 'desativado'} com sucesso.`
      )
    } catch (err) {
      setActionError(getFriendlyError(err))
    } finally {
      setTogglingId(null)
    }
  }

  const counts = useMemo(() => {
    const activeCount = services.filter((s) => s.active).length
    return {
      all: services.length,
      active: activeCount,
      inactive: services.length - activeCount,
    }
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      if (statusFilter === 'active' && !svc.active) return false
      if (statusFilter === 'inactive' && svc.active) return false

      if (search.trim()) {
        const query = search.toLowerCase().trim()
        const matchName = svc.name.toLowerCase().includes(query)
        const matchSlug = (svc.slug || '').toLowerCase().includes(query)
        const matchDesc = (svc.description || '').toLowerCase().includes(query)
        if (!matchName && !matchSlug && !matchDesc) return false
      }

      return true
    })
  }, [services, statusFilter, search])

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

      {/* ── 1. CABEÇALHO ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EBE3DC]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#C8A882]">
            Catálogo & Preços
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-[#2D242D]">
            Procedimentos & Serviços
          </h1>
          <p className="text-xs sm:text-sm text-[#736371] mt-1">
            Gerencie os serviços oferecidos pelo Espaço Pivotto para agendamento online.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNewService}
            className="flex items-center gap-2 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Novo Procedimento
          </Button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={state === 'loading'}
            className="p-2.5 bg-white border border-[#EBE3DC] rounded-xl text-[#736371] hover:text-[#7D3B7C] hover:border-[#7D3B7C] transition-colors disabled:opacity-50"
            title="Atualizar serviços"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={state === 'loading' ? 'animate-spin' : ''}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
          </button>
        </div>
      </div>

      {/* ── 2. FILTROS & BUSCA ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
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
            onClick={() => setStatusFilter('active')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
              statusFilter === 'active'
                ? 'bg-[#7D3B7C] text-white shadow-xs'
                : 'text-[#736371] hover:text-[#7D3B7C]',
            ].join(' ')}
          >
            Ativos no site ({counts.active})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all',
              statusFilter === 'inactive'
                ? 'bg-stone-500 text-white shadow-xs'
                : 'text-[#736371] hover:text-stone-800',
            ].join(' ')}
          >
            Inativos ({counts.inactive})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por serviço…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] rounded-xl text-[#2D242D] placeholder:text-[#A898A6] focus:outline-none focus:border-[#7D3B7C] transition-colors"
          />
        </div>
      </div>

      {/* ── 3. LISTA DE PROCEDIMENTOS ───────────────────────────────── */}
      {state === 'loading' ? (
        <div className="py-24 flex justify-center">
          <Loader label="Carregando procedimentos..." />
        </div>
      ) : state === 'error' ? (
        <ErrorMessage message={error || 'Erro ao carregar os serviços.'} onRetry={refetch} />
      ) : filteredServices.length === 0 ? (
        <div className="bg-white border border-[#EBE3DC] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF0F8] text-[#7D3B7C] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9Z" /></svg>
          </div>
          <h3 className="font-display font-medium text-lg text-[#2D242D]">
            Nenhum procedimento encontrado
          </h3>
          <p className="text-xs text-[#736371] max-w-sm mx-auto">
            {search
              ? 'Nenhum resultado corresponde à sua pesquisa.'
              : 'Clique em "Novo Procedimento" para cadastrar.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => {
            const isToggling = togglingId === svc.id

            return (
              <div
                key={svc.id}
                className={[
                  'bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all group',
                  svc.active
                    ? 'border-[#EBE3DC] hover:border-[#7D3B7C]/50'
                    : 'border-stone-200 bg-stone-50/50 opacity-75',
                ].join(' ')}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-base text-[#2D242D] group-hover:text-[#7D3B7C] transition-colors">
                        {svc.name}
                      </h3>
                      <span className="text-[10px] font-mono text-[#A898A6]">
                        {svc.slug}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleActive(svc)}
                      className={[
                        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all shrink-0',
                        svc.active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200',
                      ].join(' ')}
                      title={svc.active ? 'Clique para desativar' : 'Clique para ativar'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${svc.active ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                      {svc.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>

                  {svc.description && (
                    <p className="text-xs text-[#736371] leading-relaxed line-clamp-2">
                      {svc.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-baseline gap-3 pt-1">
                    <span className="text-lg font-bold text-[#7D3B7C]">
                      {formatCurrency(svc.price ?? 0)}
                    </span>
                    <span className="text-xs text-[#736371]">
                      · {formatDuration(svc.duration_minutes)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#EBE3DC]/80 flex items-center justify-between">
                  <span className="text-[11px] text-[#A898A6]">
                    Intervalo pós: {svc.buffer_minutes || 0} min
                  </span>

                  <button
                    type="button"
                    onClick={() => handleEditService(svc)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#7D3B7C] hover:bg-[#FAF0F8] rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    Editar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL ────────────────────────────────────────────────────── */}
      {modalOpen && (
        <ServiceModal
          isOpen={modalOpen}
          service={editingService}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}
