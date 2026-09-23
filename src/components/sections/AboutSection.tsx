export default function AboutSection() {
  return (
    <section
      id="sobre"
      className="py-24 sm:py-32 bg-[#FAF7F5] relative overflow-hidden"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Imagem Editorial de Josielly */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-[#EAE2DC]">
              <img
                src="/images/about/josielly-studio.jpg"
                alt="Josielly Pivotto no Espaço Pivotto em Redenção - PA"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C181D]/40 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="font-display text-2xl font-light">Josielly Pivotto</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[#D4B896]">
                  Fundadora & Especialista em Beleza
                </p>
              </div>
            </div>

            {/* Fundo de respiro / moldura flutuante */}
            <div
              className="absolute -bottom-6 -right-6 w-3/4 h-3/4 rounded-3xl border border-[#7D3B7C]/20 -z-10 hidden sm:block"
              aria-hidden="true"
            />
          </div>

          {/* Conteúdo Editorial */}
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-[#7D3B7C] font-semibold">
                Sobre a Profissional
              </p>
              <h2
                id="about-heading"
                className="font-display text-3xl sm:text-5xl font-normal text-[#1C181D] leading-tight"
              >
                Realçando a sua beleza com propósito e dedicação.
              </h2>
            </div>

            <div className="space-y-5 text-base sm:text-lg text-[#756A73] font-light leading-relaxed">
              <p>
                No <strong className="font-medium text-[#1C181D]">Espaço Pivotto</strong>, 
                cada atendimento é concebido como uma experiência única. Acreditamos que a beleza não 
                segue padrões universais — ela nasce do respeito aos traços, à textura e à personalidade de cada mulher.
              </p>
              <p>
                Com dedicação a cabelos, maquiagens e sobrancelhas, Josielly Pivotto combina técnicas 
                modernas, produtos de alta performance e um olhar sensível para criar produções marcantes 
                que encantam no dia a dia e brilham nos momentos mais especiais da sua vida.
              </p>
            </div>

            {/* Pilares da Filosofia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="p-5 rounded-2xl bg-white border border-[#EAE2DC] shadow-2xs">
                <p className="font-display text-lg text-[#1C181D] mb-1">
                  Atendimento Personalizado
                </p>
                <p className="text-xs text-[#756A73] leading-relaxed">
                  Tempo reservado com exclusividade para você, sem pressa, com escuta atenta e diagnóstico cuidadoso.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EAE2DC] shadow-2xs">
                <p className="font-display text-lg text-[#1C181D] mb-1">
                  Cuidado em Cada Detalhe
                </p>
                <p className="text-xs text-[#756A73] leading-relaxed">
                  Da saúde dos fios ao acabamento impecável da pele e alinhamento do olhar.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-6">
              <a
                href="https://wa.me/message/PTIHBB6DIPQTH1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-[#7D3B7C] hover:text-[#672B66] transition-colors"
              >
                <span>Falar Diretamente com Josielly</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
