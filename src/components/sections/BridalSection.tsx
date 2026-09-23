export default function BridalSection() {
  const BRIDAL_STEPS = [
    {
      step: '01',
      title: 'Alinhamento & Ensaio',
      desc: 'Conversa detalhada sobre o estilo do casamento, vestido, acessórios e teste de penteado e maquiagem para total segurança.',
    },
    {
      step: '02',
      title: 'Cronograma dos Fios & Pele',
      desc: 'Planejamento de tratamentos capilares e cuidados preparatórios com a pele nas semanas que antecedem a cerimônia.',
    },
    {
      step: '03',
      title: 'Acolhimento no Grande Dia',
      desc: 'Um ambiente tranquilo, afetuoso e reservado para que a noiva e suas pessoas queridas vivam momentos inesquecíveis.',
    },
    {
      step: '04',
      title: 'Produção Impecável & Durabilidade',
      desc: 'Execução de maquiagem de alta resistência e fixação perfeita do penteado com coroa, grinalda ou véu até o fim da festa.',
    },
  ]

  return (
    <section
      id="noivas"
      className="py-24 sm:py-32 bg-[#FAF7F5] relative overflow-hidden"
      aria-labelledby="bridal-heading"
    >
      {/* Detalhes luminosos sutis */}
      <div
        className="absolute top-1/3 left-0 w-80 h-80 rounded-full bg-[#EBD5E8]/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-[#D4B896]/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
        
        {/* Cabeçalho da Seção Noivas */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF0F8] border border-[#EBD5E8] text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold">
            <span>✨ Experiência Exclusiva</span>
          </div>
          <h2
            id="bridal-heading"
            className="font-display text-4xl sm:text-6xl font-normal text-[#1C181D] leading-tight"
          >
            O cuidado que o seu sonho merece.
          </h2>
          <p className="text-base sm:text-lg text-[#756A73] font-light leading-relaxed">
            Seu grande dia começa muito antes do altar. Criamos uma experiência serena,
            dedicada e inesquecível para noivas, madrinhas e mães em Redenção - PA.
          </p>
        </div>

        {/* Composição Fotográfica Editorial com Fotos Reais de Noivas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          <div className="relative group rounded-3xl overflow-hidden aspect-[3/4] shadow-md border border-[#EAE2DC]">
            <img
              src="/images/brides/noiva-buque.jpg"
              alt="Noiva com tiara e buquê produzida por Josielly Pivotto"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-xs uppercase tracking-widest text-[#D4B896]">Beleza da Noiva</p>
              <p className="font-display text-lg sm:text-xl">Expressão radiante e acolhimento</p>
            </div>
          </div>

          <div className="relative group rounded-3xl overflow-hidden aspect-[3/4] shadow-md border border-[#EAE2DC]">
            <img
              src="/images/brides/noiva-renda.jpg"
              alt="Noiva em vestido rendado com véu e maquiagem delicada"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-xs uppercase tracking-widest text-[#D4B896]">Detalhes de Alta Costura</p>
              <p className="font-display text-lg sm:text-xl">Pele luminosa e véu impecável</p>
            </div>
          </div>

          <div className="relative group rounded-3xl overflow-hidden aspect-[3/4] shadow-md border border-[#EAE2DC]">
            <img
              src="/images/brides/madrinhas-rosa.jpg"
              alt="Produção de madrinhas e noiva com vestidos harmoniosos"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-xs uppercase tracking-widest text-[#D4B896]">Noiva & Madrinhas</p>
              <p className="font-display text-lg sm:text-xl">Harmonia e sintonia no cortejo</p>
            </div>
          </div>

        </div>

        {/* Jornada da Noiva */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE2DC] shadow-sm mb-12">
          <div className="max-w-xl mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold">
              Passo a Passo
            </span>
            <h3 className="font-display text-2xl sm:text-3xl text-[#1C181D] mt-1">
              Como construímos o seu dia especial
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {BRIDAL_STEPS.map((item) => (
              <div key={item.step} className="space-y-3 relative">
                <span className="font-display text-3xl font-light text-[#D4B896]">
                  {item.step}
                </span>
                <h4 className="font-display text-xl text-[#1C181D]">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#756A73] font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Estratégico para Noivas */}
        <div className="text-center space-y-4">
          <a
            href="https://wa.me/message/PTIHBB6DIPQTH1?text=Ol%C3%A1%20Josielly!%20Gostaria%20de%20conversar%20sobre%20a%20Experi%C3%AAncia%20Noivas%20no%20Espa%C3%A7o%20Pivotto."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-9 py-4 text-sm font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] active:scale-98 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D3B7C]"
          >
            Conversar sobre a Experiência Noivas no WhatsApp
          </a>
          <p className="text-xs text-[#756A73]">
            Recomendamos o contato antecipado para garantir a data do seu casamento em nossa agenda.
          </p>
        </div>

      </div>
    </section>
  )
}
