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

  // Detecta rolagem para ajustar sombra sutil
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fecha o menu mobile quando a rota mudar
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  // Fecha o menu mobile no resize para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    <header
      className={[
        'fixed top-0 left-0 right-0 w-full z-50 transition-all duration-200 bg-[#FAF7F5]/95 backdrop-blur-md border-b border-[#EAE2DC]',
        isScrolled ? 'shadow-sm' : '',
      ].join(' ')}
      aria-label="Cabeçalho Principal"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* ── 1. LOGO À ESQUERDA (MÁXIMO 80PX) ─────────────────────────── */}
        <Link
          to="/"
          className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C] rounded-lg"
          aria-label="Espaço Pivotto — Início"
        >
          <img
            src="/images/logo/logo-clean.png"
            alt="Espaço Pivotto — Josielly Pivotto"
            className="w-auto max-w-[80px] h-auto max-h-14 object-contain transition-transform duration-200 hover:scale-105"
          />
        </Link>

        {/* ── 2. BOTÕES DE NAVEGAÇÃO ALINHADOS À DIREITA (DESKTOP) ─────── */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-auto">
          <nav className="flex items-center gap-5 lg:gap-7" aria-label="Navegação Institucional">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs lg:text-sm font-medium tracking-wide text-[#1C181D]/80 hover:text-[#7D3B7C] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#7D3B7C] hover:after:w-full after:transition-all after:duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Botão de Destaque CTA */}
          <Link
            to="/agendamento"
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 shrink-0"
          >
            Agendar Horário
          </Link>
        </div>

        {/* ── 3. CONTROLES MOBILE (TELAS MENORES) ───────────────────────── */}
        <div className="flex md:hidden items-center gap-2.5">
          <Link
            to="/agendamento"
            className="inline-flex items-center justify-center px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-xs"
          >
            Agendar
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F4EDE8] text-[#1C181D] hover:text-[#7D3B7C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C]"
            aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-collapse"
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── 4. MENU COLAPSADO EM TELAS MENORES ─────────────────────────── */}
      {mobileOpen && (
        <div
          id="mobile-nav-collapse"
          className="md:hidden border-t border-[#EAE2DC] bg-[#FAF7F5]/98 backdrop-blur-lg px-5 py-6 space-y-4 shadow-xl animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE2DC]/60">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#756A73] font-medium">
              Menu do Studio
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
                className="py-2.5 px-3 rounded-xl text-base font-medium text-[#1C181D] hover:bg-[#F4EDE8] hover:text-[#7D3B7C] transition-colors flex items-center justify-between"
              >
                <span>{item.label}</span>
                <span className="text-xs text-[#756A73]">→</span>
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#EAE2DC] space-y-2.5">
            <Link
              to="/agendamento"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center py-3.5 px-6 text-xs font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-md transition-colors"
            >
              Agendar Atendimento Online
            </Link>

            <a
              href="https://wa.me/message/PTIHBB6DIPQTH1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center py-3 px-6 text-xs font-medium tracking-wide text-[#1C181D] bg-[#F4EDE8] hover:bg-[#EAE2DC] rounded-full transition-colors"
            >
              Falar com Josielly no WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
