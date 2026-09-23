import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavLinkItem {
  label: string
  href: string
}

const NAV_LINKS: NavLinkItem[] = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Serviços', href: '/#servicos' },
  { label: 'Noivas', href: '/#noivas' },
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Galeria', href: '/#galeria' },
  { label: 'Contato', href: '/#contato' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Detecta rolagem para enriquecer sombra e opacidade de fundo
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fecha o menu mobile quando a rota ou hash mudar
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  // Fecha o menu mobile no resize para telas maiores que mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Tecla ESC para fechar menu mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  // Bloqueia rolagem do body quando menu mobile está aberto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300',
          'bg-[#FAF7F5]/95 backdrop-blur-md border-b border-[#EAE2DC]',
          isScrolled ? 'shadow-sm bg-[#FAF7F5]/98' : 'shadow-none',
        ].join(' ')}
        aria-label="Cabeçalho Principal"
      >
        {/* Container: altura reduzida no mobile (h-14 / 56px) e preservada no desktop (h-20 / 80px) */}
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 md:h-20 flex items-center justify-between">
          
          {/* ── 1. LOGO À ESQUERDA (MÁXIMO 80PX NO DESKTOP / COMPACTA NO MOBILE) ── */}
          <Link
            to="/"
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C] rounded-lg transition-transform duration-200 active:scale-95"
            aria-label="Espaço Pivotto — Início"
          >
            <img
              src="/images/logo/logo-clean.png"
              alt="Espaço Pivotto — Josielly Pivotto"
              className="w-auto max-w-[54px] sm:max-w-[64px] md:max-w-[80px] h-auto max-h-9 sm:max-h-11 md:max-h-14 object-contain transition-all duration-200"
            />
          </Link>

          {/* ── 2. NAVEGAÇÃO DESKTOP ALINHADA À DIREITA ──────────────────── */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-auto">
            <nav className="flex items-center gap-1 lg:gap-2" aria-label="Navegação Institucional">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium tracking-wide text-[#1C181D]/80 hover:text-[#7D3B7C] hover:bg-[#FAF0F8] transition-all duration-200 active:scale-95 relative"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Botão de Destaque CTA Desktop */}
            <Link
              to="/agendamento"
              className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C]"
            >
              Agendar Horário
            </Link>
          </div>

          {/* ── 3. CONTROLES MOBILE ULTRA COMPACTOS (TELAS < MD) ────────── */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/agendamento"
              className="inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-xs active:scale-95 transition-all duration-150"
            >
              Agendar
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F4EDE8] text-[#1C181D] hover:text-[#7D3B7C] active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C]"
              aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── 4. MENU MOBILE COLAPSADO (DRAWER/DROPDOWN SUAVE) ─────────── */}
      {mobileOpen && (
        <div
          id="mobile-nav-panel"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-14 sm:top-16 inset-x-3 bg-white border border-[#EAE2DC] rounded-3xl p-5 shadow-2xl space-y-4 max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE2DC]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#756A73] font-semibold">
                Navegação
              </span>
              <span className="text-xs text-[#7D3B7C] font-display italic">
                Josielly Pivotto
              </span>
            </div>

            <nav className="flex flex-col space-y-1" aria-label="Navegação Mobile">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 px-3 rounded-xl text-sm font-medium text-[#1C181D] hover:bg-[#F9F0F7] hover:text-[#7D3B7C] active:bg-[#F9F0F7] transition-colors flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-[#756A73] font-light">→</span>
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-[#EAE2DC] space-y-2">
              <Link
                to="/agendamento"
                onClick={() => setMobileOpen(false)}
                className="w-full inline-flex items-center justify-center py-3 px-5 text-xs font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] active:scale-98 rounded-full shadow-sm transition-all"
              >
                Agendar Atendimento Online
              </Link>

              <a
                href="https://wa.me/message/PTIHBB6DIPQTH1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center py-2.5 px-5 text-xs font-medium tracking-wide text-[#1C181D] bg-[#F4EDE8] hover:bg-[#EAE2DC] active:scale-98 rounded-full transition-all"
              >
                Falar com Josielly no WhatsApp ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
