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

export default function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Detecta rolagem para enriquecer a cápsula sem layout shift
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fecha o menu mobile quando a rota mudar
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Fecha o menu mobile no resize para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Trava scroll suave do body quando menu mobile está aberto
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
      {/* Wrapper Fixo Flutuante */}
      <header
        className="fixed top-3 sm:top-5 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none"
        aria-label="Cabeçalho Principal"
      >
        <div className="max-w-5xl mx-auto w-full">
          {/* Cápsula Flutuante */}
          <div
            className={[
              'pointer-events-auto transition-all duration-300 ease-out',
              'rounded-full px-4 sm:px-6 py-2 sm:py-2.5',
              'flex items-center justify-between',
              isScrolled
                ? 'navbar-capsule-scrolled shadow-lg'
                : 'navbar-capsule',
            ].join(' ')}
          >
            {/* Logo Oficial à Esquerda */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C] rounded-full pr-2"
              aria-label="Espaço Pivotto — Início"
            >
              <img
                src="/images/logo/logo-clean.png"
                alt="Espaço Pivotto — Josielly Pivotto"
                className="h-7 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>

            {/* Links Centrais no Desktop */}
            <nav
              className="hidden lg:flex items-center gap-7"
              aria-label="Navegação Institucional"
            >
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-[13px] tracking-wide font-medium text-[#1C181D]/85 hover:text-[#7D3B7C] transition-colors duration-200 py-1"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Ação Destacada (CTA) & Botão Mobile */}
            <div className="flex items-center gap-3">
              {/* Botão Agendar no Desktop */}
              <Link
                to="/agendamento"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                Agendar Horário
              </Link>

              {/* Botão Menu Mobile */}
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full bg-[#F4EDE8] text-[#1C181D] hover:text-[#7D3B7C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C]"
                aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation-drawer"
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
        </div>
      </header>

      {/* Menu Drawer Mobile */}
      <div
        id="mobile-navigation-drawer"
        aria-hidden={!mobileOpen}
        className={[
          'lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={[
            'absolute top-20 inset-x-3 sm:inset-x-6 bg-[#FFFFFF] border border-[#EAE2DC] rounded-3xl p-6 shadow-2xl',
            'transition-all duration-300 ease-out flex flex-col gap-4',
            mobileOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-4 scale-95 opacity-0',
          ].join(' ')}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2DC]">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#756A73] font-medium">
              Navegação
            </span>
            <span className="text-xs text-[#7D3B7C] font-display italic">
              Josielly Pivotto
            </span>
          </div>

          <nav className="flex flex-col gap-2" aria-label="Navegação Mobile">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 text-base text-[#1C181D] hover:text-[#7D3B7C] hover:bg-[#F9F0F7] rounded-xl transition-colors font-medium flex items-center justify-between"
              >
                <span>{item.label}</span>
                <span className="text-xs text-[#756A73]">→</span>
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-[#EAE2DC] space-y-2">
            <Link
              to="/agendamento"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center py-3.5 px-6 text-sm font-semibold tracking-wide uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-md transition-colors"
            >
              Agendar Atendimento Online
            </Link>

            <a
              href="https://wa.me/message/PTIHBB6DIPQTH1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center py-3 px-6 text-xs font-medium tracking-wide text-[#1C181D] bg-[#F4EDE8] hover:bg-[#EAE2DC] rounded-full transition-colors"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
