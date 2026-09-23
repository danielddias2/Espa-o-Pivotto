import { useState, useMemo, useCallback } from 'react'
import type { AdminClient } from '@/types'
import { useAdminClients } from '@/hooks/useAdminClients'
import { formatDateDisplay } from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import ClientModal from '@/components/admin/ClientModal'
import ClientHistoryModal from '@/components/admin/ClientHistoryModal'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'

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

export default function AdminClientes() {
  const { clients, state, error, refetch, deleteClient } = useAdminClients()

  // Estados de Modais
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingClient, setEditingClient]   = useState<AdminClient | null>(null)
  const [historyClient, setHistoryClient]   = useState<AdminClient | null>(null)
  const [deletingClient, setDeletingClient] = useState<AdminClient | null>(null)

  // Busca
  const [search, setSearch]                 = useState('')

  // Feedbacks
  const [isDeleting, setIsDeleting]         = useState(false)
  const [toastMessage, setToastMessage]     = useState<string | null>(null)
  const [actionError, setActionError]       = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 4000)
  }, [])

  function handleNewClient() {
    setEditingClient(null)
    setModalOpen(true)
  }

  function handleEditClient(client: AdminClient) {
    setEditingClient(client)
    setModalOpen(true)
  }

  function handleOpenHistory(client: AdminClient) {
    setHistoryClient(client)
  }

  function handleModalSuccess(saved: AdminClient, isEdit: boolean) {
    if (isEdit) {
      showToast(`Cadastro de "${saved.name}" atualizado com sucesso.`)
    } else {
      showToast(`Cliente "${saved.name}" cadastrada com sucesso.`)
    }
    refetch()
  }

  async function confirmDelete() {
    if (!deletingClient) return
    setIsDeleting(true)
    setActionError(null)

    try {
      await deleteClient(deletingClient.id)
      showToast(`Cliente "${deletingClient.name}" removida com sucesso.`)
      setDeletingClient(null)
    } catch (err) {
      setActionError(getFriendlyError(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients

    const query = search.toLowerCase().trim()
    const queryDigits = search.replace(/\D/g, '')

    return clients.filter((c) => {
      const matchName = c.name.toLowerCase().includes(query)
      const matchEmail = (c.email || '').toLowerCase().includes(query)
      const matchPhone = queryDigits
        ? c.phone.replace(/\D/g, '').includes(queryDigits)
        : c.phone.toLowerCase().includes(query)

      return matchName || matchEmail || matchPhone
    })
  }, [clients, search])

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
            Base de Contatos
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-[#2D242D]">
            Clientes do Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#736371] mt-1">
            Gestão cadastral, histórico de agendamentos e preferências das clientes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNewClient}
            className="flex items-center gap-2 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nova Cliente
          </Button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={state === 'loading'}
            className="p-2.5 bg-white border border-[#EBE3DC] rounded-xl text-[#736371] hover:text-[#7D3B7C] hover:border-[#7D3B7C] transition-colors disabled:opacity-50"
            title="Atualizar lista"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={state === 'loading' ? 'animate-spin' : ''}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
          </button>
        </div>
      </div>

      {/* ── 2. BARRA DE BUSCA ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-[#EBE3DC] rounded-xl text-[#2D242D] placeholder:text-[#A898A6] focus:outline-none focus:border-[#7D3B7C] transition-colors shadow-2xs"
          />
        </div>

        <span className="text-xs font-semibold text-[#736371]">
          {filteredClients.length} {filteredClients.length === 1 ? 'cliente cadastrada' : 'clientes cadastradas'}
        </span>
      </div>

      {/* ── 3. LISTA / TABELA DE CLIENTES ───────────────────────────── */}
      {state === 'loading' ? (
        <div className="py-24 flex justify-center">
          <Loader label="Carregando clientes..." />
        </div>
      ) : state === 'error' ? (
        <ErrorMessage message={error || 'Erro ao carregar os clientes.'} onRetry={refetch} />
      ) : filteredClients.length === 0 ? (
        <div className="bg-white border border-[#EBE3DC] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF0F8] text-[#7D3B7C] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          </div>
          <h3 className="font-display font-medium text-lg text-[#2D242D]">
            Nenhuma cliente encontrada
          </h3>
          <p className="text-xs text-[#736371] max-w-sm mx-auto">
            {search
              ? 'Nenhum resultado corresponde à sua pesquisa.'
              : 'Cadastre sua primeira cliente utilizando o botão acima.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const waLink = formatWhatsAppLink(client.phone)
            return (
              <div
                key={client.id}
                className="bg-white border border-[#EBE3DC] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#7D3B7C]/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FAF0F8] border border-[#7D3B7C]/20 flex items-center justify-center text-[#7D3B7C] font-semibold text-sm shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-[#2D242D] group-hover:text-[#7D3B7C] transition-colors">
                          {client.name}
                        </h3>
                        {client.created_at && (
                          <span className="text-[10px] text-[#A898A6]">
                            Cliente desde {formatDateDisplay(extractLocalDateString(client.created_at))}
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-200 shrink-0"
                      title="Chamar no WhatsApp"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </a>
                  </div>

                  <div className="space-y-1 text-xs text-[#736371] pt-1">
                    <p className="flex items-center gap-2">
                      <span className="text-[#A898A6]">Tel:</span>
                      <span className="text-[#2D242D] font-medium">{client.phone}</span>
                    </p>
                    {client.email && (
                      <p className="flex items-center gap-2">
                        <span className="text-[#A898A6]">E-mail:</span>
                        <span className="text-[#2D242D] truncate font-medium">{client.email}</span>
                      </p>
                    )}
                    {client.notes && (
                      <p className="text-[11px] text-[#736371] bg-[#FAF7F5] p-2 rounded-lg border border-[#EBE3DC]/60 italic mt-2 line-clamp-2">
                        "{client.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#EBE3DC]/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenHistory(client)}
                    className="text-xs font-semibold text-[#7D3B7C] hover:underline flex items-center gap-1"
                  >
                    Histórico
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditClient(client)}
                      className="p-1.5 text-stone-600 hover:text-[#7D3B7C] hover:bg-[#FAF0F8] rounded-lg transition-colors"
                      title="Editar cadastro"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingClient(client)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir cadastro"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAIS ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <ClientModal
          isOpen={modalOpen}
          client={editingClient}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {historyClient && (
        <ClientHistoryModal
          isOpen={!!historyClient}
          client={historyClient}
          onClose={() => setHistoryClient(null)}
        />
      )}

      {/* Diálogo de Confirmação de Exclusão */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DC] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </div>

            <div>
              <h3 className="font-display font-medium text-lg text-[#2D242D]">
                Excluir Cliente
              </h3>
              <p className="text-xs text-[#736371] mt-1.5 leading-relaxed">
                Tem certeza que deseja remover <strong>"{deletingClient.name}"</strong>? O histórico de atendimentos continuará preservado.
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingClient(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={confirmDelete}
                isLoading={isDeleting}
              >
                Sim, excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
