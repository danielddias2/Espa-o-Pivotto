import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center pt-8 sm:pt-16 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#FAF7F5] via-[#FAF7F5] to-[#F5ECE7]"
      aria-labelledby="hero-title"
    >
      {/* Elementos Gráficos Sutis de Fundo */}
      <div
        className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-[#EBD5E8]/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-[#D4B896]/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Coluna de Tipografia Editorial (7 cols no desktop) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Tag / Assinatura de Entrada */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#EAE2DC] text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#7D3B7C] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7D3B7C]" />
              <span>Espaço Pivotto · Redenção - PA</span>
            </div>

            {/* Headline Principal Editorial */}
            <h1
              id="hero-title"
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#1C181D] leading-[1.08]"
            >
              A arte de revelar sua beleza{' '}
              <span className="italic font-normal text-[#7D3B7C] underline decoration-[#D4B896]/60 decoration-wavy decoration-1 underline-offset-8">
                mais autêntica.
              </span>
            </h1>

            {/* Subtítulo Editorial */}
            <p className="text-base sm:text-lg text-[#756A73] font-light max-w-xl leading-relaxed">
              Cabelo, maquiagem e sobrancelha com atendimento sob medida.
              Especialista em transformações, cuidados personalizados e
              produções memoráveis para noivas e momentos únicos.
            </p>

            {/* Pilares Rápidos de Confiança */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 py-2 border-y border-[#EAE2DC]/80 max-w-lg">
              <div>
                <p className="font-display text-xl sm:text-2xl text-[#1C181D]">Noivas</p>
                <p className="text-[11px] sm:text-xs text-[#756A73] uppercase tracking-wider">
                  Experiência Exclusiva
                </p>
              </div>
              <div>
                <p className="font-display text-xl sm:text-2xl text-[#1C181D]">Cabelo</p>
                <p className="text-[11px] sm:text-xs text-[#756A73] uppercase tracking-wider">
                  Cachos, Cortes & Penteados
                </p>
              </div>
              <div>
                <p className="font-display text-xl sm:text-2xl text-[#1C181D]">Make & Brow</p>
                <p className="text-[11px] sm:text-xs text-[#756A73] uppercase tracking-wider">
                  Harmonia & Olhar
                </p>
              </div>
            </div>

            {/* Ações (CTAs) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/agendamento"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-center"
              >
                Agendar Atendimento Online
              </Link>

              <a
                href="#noivas"
                className="inline-flex items-center justify-center px-7 py-4 text-sm font-medium tracking-wide text-[#1C181D] bg-white/70 hover:bg-white border border-[#EAE2DC] rounded-full shadow-xs hover:shadow-sm transition-all duration-200 text-center"
              >
                Conhecer Experiência Noivas
              </a>
            </div>
          </div>

          {/* Coluna Visual Assimétrica (5 cols no desktop) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            {/* Moldura Principal com Foto Real de Noiva / Beleza */}
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="/images/brides/noiva-buque.jpg"
                alt="Produção de Noiva no Espaço Pivotto por Josielly Pivotto"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                loading="eager"
              />
              {/* Gradiente sutil na base da foto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              
              {/* Badge Sobreposto na Imagem */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 shadow-lg">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold">
                  O Cuidado que o Seu Sonho Merece
                </p>
                <p className="text-sm font-display text-[#1C181D] italic mt-0.5">
                  Produções completas de beleza para o grande dia.
                </p>
              </div>
            </div>

            {/* Card Flutuante Secundário: Josielly Pivotto */}
            <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-[#EAE2DC] flex items-center gap-3 max-w-[230px] hidden sm:flex">
              <img
                src="/images/about/josielly-studio.jpg"
                alt="Josielly Pivotto"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="text-left">
                <p className="text-xs font-semibold text-[#1C181D] leading-tight">
                  Josielly Pivotto
                </p>
                <p className="text-[10px] text-[#756A73] uppercase tracking-wider mt-0.5">
                  Beleza com Propósito
                </p>
              </div>
            </div>

            {/* Detalhe Geométrico Decorativo */}
            <div
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full border border-[#D4B896]/80 -z-10"
              aria-hidden="true"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
