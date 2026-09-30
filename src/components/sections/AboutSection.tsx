export default function AboutSection() {
  return (
    <section
      id="sobre"
      className="py-20 sm:py-28 lg:py-32 bg-[#FAF7F5] relative overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Elemento de iluminação ambiente sutil */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#EBD5E8]/25 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          
          {/* ── 1. RETRATO EDITORIAL DA PROFISSIONAL (5 colunas) ────────── */}
          <div className="lg:col-span-5 relative order-2 lg:order-1 flex flex-col items-center">
            {/* Moldura da Fotografia com Borda e Sombra Suave (Sem texto fundido na imagem) */}
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white">
              <img
                src="/images/about/josielly-studio.jpg"
                alt="Josielly Pivotto — Especialista em Cabelo, Maquiagem e Sobrancelha"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>

            {/* Plaqueta de Identificação com Alto Contraste abaixo da foto */}
            <div className="mt-4 px-5 py-2.5 rounded-2xl bg-white border border-[#EAE2DC] shadow-xs flex items-center gap-3 w-full max-w-sm sm:max-w-md justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7D3B7C]" />
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1C181D]">
                  Josielly Pivotto
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-wider text-[#756A73] font-medium">
                Redenção - PA
              </span>
            </div>

            {/* Moldura de fundo sutil */}
            <div
              className="absolute -bottom-6 -right-6 w-3/4 h-3/4 rounded-3xl border border-[#7D3B7C]/20 -z-10 hidden sm:block pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* ── 2. CONTEÚDO EDITORIAL & CREDENCIAIS (7 colunas) ──────────── */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 order-1 lg:order-2">
            
            {/* Bloco de Nome e Especialização com Alto Contraste */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF0F8] border border-[#EBD5E8] text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold">
                Sobre a Profissional
              </span>

              {/* Nome Completo com Grande Presença Visual */}
              <h2
                id="about-heading"
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1C181D] tracking-tight leading-[1.08]"
              >
                Josielly Pivotto
              </h2>

              {/* Função e Especialização com Destaque Nítido */}
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-[#7D3B7C]">
                Cabelo · Maquiagem · Sobrancelha · Noivas
              </p>
            </div>

            {/* Filosofia de Atendimento */}
            <div className="space-y-4 text-base sm:text-lg text-[#554A54] font-light leading-relaxed">
              <p>
                No <strong className="font-semibold text-[#1C181D]">Espaço Pivotto</strong>, 
                cada atendimento é concebido como uma experiência única. Acreditamos que a beleza não 
                segue moldes pré-definidos — ela nasce do respeito aos seus traços naturais, à textura única dos seus fios e à sua história.
              </p>
              <p className="text-sm sm:text-base text-[#756A73]">
                Combinando técnicas contemporâneas de visagismo, cosméticos de alta performance e um olhar sensível, Josielly Pivotto cria produções memoráveis para o dia a dia, ensaios fotográficos e os momentos mais marcantes da sua vida.
              </p>
            </div>

            {/* Pilares da Experiência */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-5 rounded-2xl bg-white border border-[#EAE2DC] shadow-2xs hover:border-[#7D3B7C]/40 hover:shadow-xs transition-all duration-200">
                <div className="w-8 h-8 rounded-xl bg-[#FAF0F8] text-[#7D3B7C] flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="font-display text-base font-medium text-[#1C181D] mb-1">
                  Atendimento Exclusivo
                </p>
                <p className="text-xs text-[#756A73] leading-relaxed">
                  Tempo reservado com atenção total e personalizada, garantindo conforto e segurança do início ao fim.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EAE2DC] shadow-2xs hover:border-[#7D3B7C]/40 hover:shadow-xs transition-all duration-200">
                <div className="w-8 h-8 rounded-xl bg-[#FAF0F8] text-[#7D3B7C] flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <p className="font-display text-base font-medium text-[#1C181D] mb-1">
                  Cuidado em Cada Detalhe
                </p>
                <p className="text-xs text-[#756A73] leading-relaxed">
                  Da saúde e cronograma dos fios ao acabamento impecável da pele e harmonia do olhar.
                </p>
              </div>
            </div>

            {/* Ação / Contato com Josielly */}
            <div className="pt-2 flex items-center gap-6">
              <a
                href="https://wa.me/message/PTIHBB6DIPQTH1"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#7D3B7C] hover:text-[#672B66] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C] rounded-lg"
              >
                <span>Falar Diretamente com Josielly</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">→</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
