import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useServices } from '@/hooks/useServices'
import { formatCurrency, formatDuration } from '@/utils/formatters'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'

// Categorias visuais do Espaço Pivotto baseadas na assinatura oficial do logo:
// "cabelo • maquiagem • sobrancelha" + ocasiões especiais
interface ServiceCategory {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  highlights: string[]
}

const CATEGORIES: ServiceCategory[] = [
  {
    id: 'cabelo',
    title: 'Cabelos & Penteados',
    subtitle: 'Transformação & Cuidado',
    description:
      'Tratamentos profundos, valorização de cachos, cortes contemporâneos e penteados autorais para celebrações.',
    image: '/images/services/cabelo-cachos.jpg',
    highlights: ['Definição & Cachos', 'Penteados Sociais & Festas', 'Cronograma Capilar', 'Tranças Estruturadas'],
  },
  {
    id: 'maquiagem',
    title: 'Maquiagem Profissional',
    subtitle: 'Luz, Pele & Durabilidade',
    description:
      'Técnicas de acabamento impecável com alta resistência para noivas, formandas, ensaios fotográficos e festas.',
    image: '/images/services/maquiagem-festa.jpg',
    highlights: ['Make Noiva', 'Make Social Glam', 'Pele Blindada', 'Ensaios Fotográficos'],
  },
  {
    id: 'sobrancelha',
    title: 'Design de Sobrancelhas',
    subtitle: 'Harmonia & Expressão',
    description:
      'Mapeamento facial personalizado e alinhamento preciso para valorizar a arquitetura natural do seu olhar.',
    image: '/images/services/sobrancelha-design.jpg',
    highlights: ['Design Estratégico', 'Alinhamento & Limpeza', 'Realce do Olhar', 'Visagismo Facial'],
  },
  {
    id: 'producao',
    title: 'Produção Completa',
    subtitle: 'Experiência Integrada',
    description:
      'Penteado e maquiagem pensados em conjunto para criar uma composição harmoniosa, elegante e inesquecível.',
    image: '/images/services/penteado-tranca.jpg',
    highlights: ['Madrinhas & Formandas', 'Ocasiões Especiais', 'Ensaio Pré-Wedding', 'Produções de Gala'],
  },
]

export default function ServicesSection() {
  const { services, state, refetch } = useServices()
  const [activeTab, setActiveTab] = useState<string>('cabelo')

  const currentCategory = CATEGORIES.find((c) => c.id === activeTab) || CATEGORIES[0]

  return (
    <section
      id="servicos"
      className="py-24 sm:py-32 bg-[#F5ECE7] relative overflow-hidden"
      aria-labelledby="services-title"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Cabeçalho da Seção */}
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-[#7D3B7C] font-semibold">
            Especialidades Espaço Pivotto
          </p>
          <h2
            id="services-title"
            className="font-display text-3xl sm:text-5xl font-normal text-[#1C181D]"
          >
            Serviços desenhados para realçar o seu melhor.
          </h2>
          <p className="text-sm sm:text-base text-[#756A73] font-light leading-relaxed">
            Cada procedimento é executado com técnicas consagradas, cosméticos de primeira linha
            e respeito absoluto à sua individualidade.
          </p>
        </div>

        {/* Seletor de Categorias / Abas Editoriais */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeTab === cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={[
                'px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer',
                activeTab === cat.id
                  ? 'bg-[#7D3B7C] text-white shadow-md'
                  : 'bg-white/80 text-[#1C181D] hover:bg-white border border-[#EAE2DC]',
              ].join(' ')}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Vitrine Editorial da Categoria Selecionada */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-[#EAE2DC] mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Imagem Protagonista */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-md">
                <img
                  src={currentCategory.image}
                  alt={currentCategory.title}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Descrição & Destaques */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#D4B896] font-semibold">
                  {currentCategory.subtitle}
                </span>
                <h3 className="font-display text-2xl sm:text-4xl text-[#1C181D]">
                  {currentCategory.title}
                </h3>
              </div>

              <p className="text-base text-[#756A73] font-light leading-relaxed">
                {currentCategory.description}
              </p>

              {/* Lista de Procedimentos / Destaques da Categoria */}
              <div className="pt-2">
                <p className="text-xs uppercase tracking-[0.15em] text-[#1C181D] font-medium mb-3">
                  Principais Atendimentos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentCategory.highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-[#1C181D]/90 p-2.5 rounded-xl bg-[#FAF7F5] border border-[#EAE2DC]/60"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7D3B7C]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA da Categoria */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/agendamento"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-xs uppercase tracking-wider font-semibold text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full shadow-sm transition-colors text-center"
                >
                  Agendar este Procedimento
                </Link>

                <a
                  href="https://wa.me/message/PTIHBB6DIPQTH1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-wider font-medium text-[#1C181D] bg-[#F4EDE8] hover:bg-[#EAE2DC] rounded-full transition-colors text-center"
                >
                  Tirar Dúvidas no WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Integração com Serviços Ativos do Supabase */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#EAE2DC]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold">
                Agendamento Imediato
              </p>
              <h3 className="font-display text-2xl sm:text-3xl text-[#1C181D] mt-1">
                Procedimentos Disponíveis no Sistema
              </h3>
            </div>
            <Link
              to="/agendamento"
              className="text-xs uppercase tracking-wider text-[#7D3B7C] hover:text-[#672B66] font-semibold underline underline-offset-4"
            >
              Ver todos os horários →
            </Link>
          </div>

          {state === 'loading' && <Loader label="Sincronizando serviços disponíveis…" />}

          {state === 'error' && (
            <ErrorMessage
              message="Não foi possível sincronizar os serviços no momento."
              onRetry={refetch}
            />
          )}

          {state === 'success' && services.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EAE2DC] hover:border-[#7D3B7C]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#756A73]">
                      <span className="uppercase tracking-wider">
                        {formatDuration(service.duration_minutes)}
                      </span>
                      {service.price != null && (
                        <span className="font-medium text-[#1C181D]">
                          {formatCurrency(service.price)}
                        </span>
                      )}
                    </div>

                    <h4 className="font-display text-xl text-[#1C181D]">
                      {service.name}
                    </h4>

                    {service.description && (
                      <p className="text-xs sm:text-sm text-[#756A73] font-light leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/agendamento?servico=${service.id}`}
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 text-xs uppercase tracking-wider font-semibold text-[#7D3B7C] bg-[#F9F0F7] hover:bg-[#7D3B7C] hover:text-white rounded-full transition-colors text-center"
                  >
                    Agendar Horário
                  </Link>
                </div>
              ))}
            </div>
          )}

          {state === 'success' && services.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE2DC]">
              <p className="text-sm text-[#756A73]">
                Entre em contato pelo WhatsApp para consultar a disponibilidade da nossa agenda.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
