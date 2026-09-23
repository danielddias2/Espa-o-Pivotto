import { useEffect, useState } from 'react'
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import Loader from '@/components/ui/Loader'

const ADMIN_NAV = [
  { 
    label: 'Dashboard', 
    to: '/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    )
  },
  { 
    label: 'Agenda', 
    to: '/admin/agenda',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    )
  },
  { 
    label: 'Clientes', 
    to: '/admin/clientes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  { 
    label: 'Serviços', 
    to: '/admin/servicos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9Z" />
        <path d="M11 3 8 9l4 13 4-13-3-6" />
        <path d="M2 9h20" />
      </svg>
    )
  },
  { 
    label: 'Configurações', 
    to: '/admin/configuracoes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  },
]

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5]">
        <Loader label="Verificando acesso ao painel..." />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F3F0]">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#1E1422] text-[#FAF7F5] px-5 py-3.5 flex items-center justify-between border-b border-[#322338] sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/images/logo/logo-icon.png" 
            alt="Espaço Pivotto" 
            className="w-7 h-7 object-contain rounded-full bg-white/10 p-0.5" 
          />
          <div className="flex flex-col leading-none">
            <span className="font-display font-medium text-base text-[#FAF7F5] tracking-tight">
              Espaço Pivotto
            </span>
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882] font-medium mt-0.5">
              Gestão Studio
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="text-[#FAF7F5] p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1E1422] border-b border-[#322338] px-4 py-3 space-y-1">
          {ADMIN_NAV.map((item) => {
            const isActive =
              item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  'flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all font-medium',
                  isActive
                    ? 'bg-[#7D3B7C] text-white font-semibold shadow-sm'
                    : 'text-white/80 hover:bg-white/5 hover:text-white',
                ].join(' ')}
              >
                <span className={isActive ? 'text-[#C8A882]' : 'text-white/60'}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Ver site público
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-300 hover:bg-white/5 rounded-xl text-left transition-colors font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Encerrar sessão
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1E1422] text-[#FAF7F5] shrink-0 sticky top-0 h-screen border-r border-[#322338]">
        {/* Brand header */}
        <div className="px-6 py-7 border-b border-[#322338]">
          <Link to="/" className="flex items-center gap-3.5 group">
            <img 
              src="/images/logo/logo-icon.png" 
              alt="Espaço Pivotto" 
              className="w-9 h-9 object-contain rounded-full bg-white/10 p-1 group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-medium text-lg text-[#FAF7F5] tracking-tight">
                Espaço Pivotto
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#C8A882] font-medium mt-0.5">
                Painel Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-3.5 py-6 gap-1 flex-1" aria-label="Navegação administrativa">
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/40 px-3 pb-2">
            Gestão & Atendimento
          </span>
          {ADMIN_NAV.map((item) => {
            const isActive =
              item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  'flex items-center gap-3.5 px-3.5 py-2.5 text-sm rounded-xl transition-all duration-150 font-medium',
                  isActive
                    ? 'bg-[#7D3B7C] text-white font-semibold shadow-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white',
                ].join(' ')}
              >
                <span className={isActive ? 'text-[#C8A882]' : 'text-white/50'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer controls */}
        <div className="px-4 py-5 border-t border-[#322338] flex flex-col gap-1.5">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Ver site público
          </Link>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded-xl text-left transition-colors font-medium"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
