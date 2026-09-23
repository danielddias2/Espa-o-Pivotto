import { Link } from 'react-router-dom'
import { useClinicSettings } from '@/hooks/useClinicSettings'

export default function ContactSection() {
  const { settings } = useClinicSettings()

  return (
    <section
      id="contato"
      className="py-24 sm:py-32 bg-[#FAF7F5] relative"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Informações de Atendimento */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-[#7D3B7C] font-semibold">
                Atendimento & Localização
              </p>
              <h2
                id="contact-heading"
                className="font-display text-3xl sm:text-5xl font-normal text-[#1C181D]"
              >
                Estamos prontas para receber você.
              </h2>
              <p className="text-base text-[#756A73] font-light leading-relaxed">
                Cada atendimento no Espaço Pivotto é realizado com horário marcado, garantindo exclusividade, conforto e a atenção que você merece.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-[#EAE2DC] flex items-start gap-4 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#F4EDE8] flex items-center justify-center shrink-0 text-[#7D3B7C]">
                  📍
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1C181D]">
                    Localização do Estúdio
                  </h3>
                  <p className="text-xs text-[#756A73] mt-1 leading-relaxed">
                    {settings?.address
                      ? `${settings.address}, ${settings.city || 'Redenção'} - ${settings.state || 'PA'}`
                      : 'Redenção - Pará (PA)'}
                  </p>
                  <p className="text-[11px] text-[#A89FA7] mt-0.5">
                    Endereço detalhado compartilhado na confirmação do agendamento.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EAE2DC] flex items-start gap-4 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#F4EDE8] flex items-center justify-center shrink-0 text-[#7D3B7C]">
                  💬
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1C181D]">
                    WhatsApp Oficial
                  </h3>
                  <p className="text-xs text-[#756A73] mt-1">
                    Dúvidas sobre noivas, procedimentos ou agendamentos especiais.
                  </p>
                  <a
                    href="https://wa.me/message/PTIHBB6DIPQTH1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-semibold text-[#7D3B7C] hover:text-[#672B66] underline mt-1.5"
                  >
                    Abrir conversa no WhatsApp →
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EAE2DC] flex items-start gap-4 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#F4EDE8] flex items-center justify-center shrink-0 text-[#7D3B7C]">
                  📸
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1C181D]">
                    Instagram
                  </h3>
                  <p className="text-xs text-[#756A73] mt-1">
                    Conheça mais produções em @espacopivotto_bec.
                  </p>
                  <a
                    href="https://instagram.com/espacopivotto_bec"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-semibold text-[#7D3B7C] hover:text-[#672B66] underline mt-1.5"
                  >
                    Seguir no Instagram →
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/agendamento"
                className="inline-flex items-center justify-center px-8 py-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-md transition-colors"
              >
                Agendar Horário Online
              </Link>
            </div>
          </div>

          {/* Card Visual / Mapa Representativo */}
          <div className="lg:col-span-6">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#EAE2DC] shadow-sm space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#D4B896] font-semibold">
                  Ambiente Acolhedor
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-[#1C181D]">
                  Viva um momento feito para você.
                </h3>
                <p className="text-sm text-[#756A73] font-light leading-relaxed">
                  Nosso espaço foi planejado para oferecer relaxamento, cuidado e beleza em cada instante.
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden aspect-[4/3] relative border border-[#EAE2DC]">
                <img
                  src="/images/brides/noiva-renda.jpg"
                  alt="Espaço Pivotto em Redenção - PA"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C181D]/60 via-transparent to-transparent flex items-end p-5 text-white">
                  <div>
                    <p className="font-display text-lg">Espaço Pivotto</p>
                    <p className="text-xs text-white/80">Redenção - PA</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#EAE2DC]/60 text-xs text-[#756A73] space-y-1">
                <p className="font-medium text-[#1C181D]">Horário de Atendimento:</p>
                <p>Terça a Sábado — Com agendamento prévio pelo site ou WhatsApp.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
