import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#1C181D] text-[#FAF7F5] pt-16 sm:pt-20 pb-10 border-t border-[#302830]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-14 border-b border-[#302830]">
          {/* Coluna da Marca */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-block" aria-label="Espaço Pivotto">
              <div className="bg-[#FAF7F5] p-2.5 rounded-2xl inline-block shadow-sm">
                <img
                  src="/images/logo/logo-clean.png"
                  alt="Espaço Pivotto — Josielly Pivotto"
                  className="h-9 w-auto"
                />
              </div>
            </Link>
            <p className="text-sm text-[#A89FA7] font-light max-w-sm leading-relaxed">
              Realçando a sua beleza com propósito. Cuidado individualizado,
              técnicas contemporâneas e produções exclusivas para momentos
              inesquecíveis e noivas.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs tracking-wider uppercase text-[#C8A882]">
              <span>📍 Redenção - PA</span>
              <span>•</span>
              <span>Atendimento Exclusivo</span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C8A882] font-semibold">
              Navegação
            </h3>
            <ul className="space-y-2.5 text-sm text-[#D3CBD1] font-light">
              <li>
                <a href="/#inicio" className="hover:text-white transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="/#servicos" className="hover:text-white transition-colors">
                  Serviços Especializados
                </a>
              </li>
              <li>
                <a href="/#noivas" className="hover:text-white transition-colors">
                  Experiência Noivas
                </a>
              </li>
              <li>
                <a href="/#sobre" className="hover:text-white transition-colors">
                  Sobre Josielly Pivotto
                </a>
              </li>
              <li>
                <a href="/#galeria" className="hover:text-white transition-colors">
                  Galeria de Trabalhos
                </a>
              </li>
              <li>
                <Link to="/agendamento" className="text-[#C8A882] hover:underline transition-colors font-medium">
                  Agendar Horário Online
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento & Contato */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C8A882] font-semibold">
              Contato & Localização
            </h3>
            <div className="space-y-3 text-sm text-[#D3CBD1] font-light leading-relaxed">
              <p>
                <strong className="font-normal text-white">WhatsApp Direto:</strong>{' '}
                <a
                  href="https://wa.me/message/PTIHBB6DIPQTH1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C8A882] underline transition-colors"
                >
                  wa.me/message/PTIHBB6DIPQTH1
                </a>
              </p>
              <p>
                <strong className="font-normal text-white">Instagram:</strong>{' '}
                <a
                  href="https://instagram.com/espacopivotto_bec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C8A882] transition-colors"
                >
                  @espacopivotto_bec
                </a>
              </p>
              <p className="text-xs text-[#A89FA7] pt-2">
                Atendimento com hora marcada para garantir dedicação e privacidade em cada procedimento.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé Inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8189]">
          <p>
            © {currentYear} Espaço Pivotto. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/espacopivotto_bec"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram Oficial
            </a>
            <Link
              to="/admin/login"
              className="text-[#655D64] hover:text-[#A89FA7] transition-colors"
            >
              Acesso Administrativo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
