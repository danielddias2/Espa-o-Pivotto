import { useState, useMemo } from 'react'
import type { Professional } from '@/types'
import { useAdminProfessionals } from '@/hooks/useAdminProfessionals'
import ProfessionalModal from '@/components/admin/ProfessionalModal'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'
import Button from '@/components/ui/Button'
import { getFriendlyError } from '@/utils/errorMessages'

type FilterStatus = 'all' | 'active' | 'inactive'

export default function AdminProfissionais() {
  const {
    professionals,
    state,
    error,
    refetch,
    setProfessionals,
    setProfessionalActive,
  } = useAdminProfessionals()

  // Estado do Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)

  // Filtros
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

  // Feedback pontual
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 4500)
  }

  function handleNewProfessional() {
    setEditingProfessional(null)
    setModalOpen(true)
  }

  function handleEditProfessional(prof: Professional) {
    setEditingProfessional(prof)
    setModalOpen(true)
  }

  function handleModalSuccess(saved: Professional, isEdit: boolean) {
    if (isEdit) {
      setProfessionals((prev) =>
        prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p))
      )
      showToast(`Profissional "${saved.name}" atualizada com sucesso.`)
    } else {
      setProfessionals((prev) => [saved, ...prev])
      showToast(`Profissional "${saved.name}" cadastrada com sucesso.`)
    }
    refetch()
  }

  async function handleToggleActive(prof: Professional) {
    const nextState = !prof.active
    setTogglingId(prof.id)
    setActionError(null)

    try {
      await setProfessionalActive(prof.id, nextState)
      showToast(
        `Profissional "${prof.name}" ${nextState ? 'ativada' : 'desativada'} com sucesso.`
      )
    } catch (err) {
      setActionError(getFriendlyError(err))
    } finally {
      setTogglingId(null)
    }
  }

  const counts = useMemo(() => {
    const activeCount = professionals.filter((p) => p.active).length
    return {
      all: professionals.length,
      active: activeCount,
      inactive: professionals.length - activeCount,
    }
  }, [professionals])

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((prof) => {
      if (statusFilter === 'active' && !prof.active) return false
      if (statusFilter === 'inactive' && prof.active) return false

      if (search.trim()) {
        const query = search.toLowerCase().trim()
        const matchName = prof.name.toLowerCase().includes(query)
        const matchSpec = (prof.specialty || '').toLowerCase().includes(query)
        const matchBio = (prof.bio || '').toLowerCase().includes(query)
        if (!matchName && !matchSpec && !matchBio) return false
      }

      return true
    })
  }, [professionals, statusFilter, search])

  // Se houver erro de tabela ou RPC ausente (migration pendente no Supabase)
  const isMigrationMissing =
    error &&
    (error.includes('relation "public.professionals" does not exist') ||
      error.includes('PGRST205') ||
      error.includes('PGRST202') ||
      error.includes('get_professionals_admin'))

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
            Equipe & Atendimento
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-[#2D242D]">
            Profissionais do Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#736371] mt-1">
            Gerencie as profissionais que realizam atendimentos no Espaço Pivotto e vincule seus procedimentos.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNewProfessional}
            className="flex items-center gap-2 shadow-sm"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova Profissional
          </Button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={state === 'loading'}
            className="p-2.5 bg-white border border-[#EBE3DC] rounded-xl text-[#736371] hover:text-[#7D3B7C] hover:border-[#7D3B7C] transition-colors disabled:opacity-50 cursor-pointer"
            title="Atualizar lista de profissionais"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={state === 'loading' ? 'animate-spin' : ''}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── 2. AVISO DE MIGRATION PENDENTE (SE APLICÁVEL) ────────────── */}
      {isMigrationMissing && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-3">
          <div className="flex items-center gap-2.5 font-semibold text-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Migration de Profissionais Pendente no Supabase
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            As tabelas ou RPCs de profissionais ainda não foram criadas no banco do Supabase conectado.
            Para ativar, basta executar o arquivo <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-medium">supabase/migrations/20260929_professionals.sql</code> no <strong>SQL Editor</strong> do painel do Supabase.
          </p>
        </div>
      )}

      {/* ── 3. FILTROS & BUSCA ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-[#EBE3DC] rounded-2xl">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer',
              statusFilter === 'all'
                ? 'bg-[#7D3B7C] text-white shadow-xs'
                : 'text-[#736371] hover:text-[#2D242D]',
            ].join(' ')}
          >
            Todas ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer',
              statusFilter === 'active'
                ? 'bg-[#7D3B7C] text-white shadow-xs'
                : 'text-[#736371] hover:text-[#7D3B7C]',
            ].join(' ')}
          >
            Ativas ({counts.active})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={[
              'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer',
              statusFilter === 'inactive'
                ? 'bg-stone-500 text-white shadow-xs'
                : 'text-[#736371] hover:text-stone-800',
            ].join(' ')}
          >
            Inativas ({counts.inactive})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por profissional ou especialidade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] rounded-xl text-[#2D242D] placeholder:text-[#A898A6] focus:outline-none focus:border-[#7D3B7C] transition-colors"
          />
        </div>
      </div>

      {/* ── 4. LISTA DE PROFISSIONAIS ─────────────────────────────────── */}
      {state === 'loading' ? (
        <div className="py-24 flex justify-center">
          <Loader label="Carregando profissionais..." />
        </div>
      ) : state === 'error' && !isMigrationMissing ? (
        <ErrorMessage message={error || 'Erro ao carregar profissionais.'} onRetry={refetch} />
      ) : filteredProfessionals.length === 0 ? (
        <div className="bg-white border border-[#EBE3DC] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF0F8] text-[#7D3B7C] flex items-center justify-center mx-auto">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="font-display font-medium text-lg text-[#2D242D]">
            Nenhuma profissional encontrada
          </h3>
          <p className="text-xs text-[#736371] max-w-sm mx-auto">
            {search
              ? 'Nenhum resultado corresponde à sua pesquisa.'
              : 'Clique em "Nova Profissional" para cadastrar uma profissional na equipe.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfessionals.map((prof) => {
            const isToggling = togglingId === prof.id
            const servicesCount = prof.services_count ?? 0

            return (
              <div
                key={prof.id}
                className={[
                  'bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all group',
                  prof.active
                    ? 'border-[#EBE3DC] hover:border-[#7D3B7C]/50'
                    : 'border-stone-200 bg-stone-50/50 opacity-75',
                ].join(' ')}
              >
                <div className="space-y-4">
                  {/* Topo: Avatar + Identificação + Toggle */}
                  <div className="flex items-start gap-3.5">
                    {/* Avatar Circular */}
                    <div className="relative w-14 h-14 rounded-full border border-[#7D3B7C]/20 overflow-hidden bg-[#FAF0F8] flex items-center justify-center shrink-0 shadow-2xs">
                      {prof.photo_url ? (
                        <img
                          src={prof.photo_url}
                          alt={prof.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-display font-semibold text-lg text-[#7D3B7C]">
                          {prof.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base text-[#2D242D] group-hover:text-[#7D3B7C] transition-colors truncate">
                          {prof.name}
                        </h3>

                        {/* Botão de Toggle Ativa / Inativa */}
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleActive(prof)}
                          className={[
                            'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full border transition-all shrink-0 cursor-pointer disabled:opacity-50',
                            prof.active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200',
                          ].join(' ')}
                          title={prof.active ? 'Clique para desativar' : 'Clique para ativar'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prof.active ? 'bg-emerald-500' : 'bg-stone-400'
                            }`}
                          />
                          {prof.active ? 'Ativa' : 'Inativa'}
                        </button>
                      </div>

                      {prof.specialty ? (
                        <p className="text-xs text-[#C8A882] font-medium truncate mt-0.5">
                          {prof.specialty}
                        </p>
                      ) : (
                        <p className="text-xs text-[#A898A6] italic mt-0.5">
                          Sem especialidade definida
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {prof.bio && (
                    <p className="text-xs text-[#736371] leading-relaxed line-clamp-2">
                      {prof.bio}
                    </p>
                  )}

                  {/* Procedimentos vinculados */}
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-[#FAF0F8] text-[#7D3B7C] font-medium border border-[#7D3B7C]/15">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 3h12l4 6-10 13L2 9Z" />
                        <path d="M11 3 8 9l4 13 4-13-3-6" />
                        <path d="M2 9h20" />
                      </svg>
                      {servicesCount} {servicesCount === 1 ? 'procedimento' : 'procedimentos'}
                    </span>
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="pt-4 mt-4 border-t border-[#EBE3DC]/80 flex items-center justify-between">
                  <span className="text-[11px] text-[#A898A6]">
                    {prof.active ? 'Visível para agendamento' : 'Oculta na agenda'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleEditProfessional(prof)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#7D3B7C] hover:bg-[#FAF0F8] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Editar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── 5. MODAL DE CADASTRO / EDIÇÃO ────────────────────────────── */}
      {modalOpen && (
        <ProfessionalModal
          isOpen={modalOpen}
          professional={editingProfessional}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}
