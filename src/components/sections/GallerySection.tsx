import { useState, useEffect } from 'react'

interface GalleryItem {
  id: string
  title: string
  category: 'noivas' | 'cabelos' | 'maquiagem' | 'sobrancelhas'
  categoryLabel: string
  src: string
  alt: string
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    title: 'Produção Completa de Noiva',
    category: 'noivas',
    categoryLabel: 'Noivas',
    src: '/images/brides/noiva-buque.jpg',
    alt: 'Noiva radiante com tiara e buquê no Espaço Pivotto',
  },
  {
    id: '2',
    title: 'Definição e Iluminação de Cachos',
    category: 'cabelos',
    categoryLabel: 'Cabelos',
    src: '/images/services/cabelo-cachos.jpg',
    alt: 'Cabelos cacheados e volumosos tratados por Josielly Pivotto',
  },
  {
    id: '3',
    title: 'Penteado Trança Elegance com Esferas Douradas',
    category: 'cabelos',
    categoryLabel: 'Cabelos',
    src: '/images/services/penteado-tranca.jpg',
    alt: 'Penteado em trança sofisticada com acessórios dourados',
  },
  {
    id: '4',
    title: 'Vestido de Noiva em Renda Francesa',
    category: 'noivas',
    categoryLabel: 'Noivas',
    src: '/images/brides/noiva-renda.jpg',
    alt: 'Noiva vestida para a cerimônia com véu e maquiagem clássica',
  },
  {
    id: '5',
    title: 'Maquiagem Social Glam para Noite',
    category: 'maquiagem',
    categoryLabel: 'Maquiagem',
    src: '/images/services/maquiagem-festa.jpg',
    alt: 'Maquiagem social marcante com pele acetinada e olhar destacado',
  },
  {
    id: '6',
    title: 'Madrinhas em Harmonia Rosa',
    category: 'noivas',
    categoryLabel: 'Noivas',
    src: '/images/brides/madrinhas-rosa.jpg',
    alt: 'Produção coletiva de noiva e madrinhas',
  },
  {
    id: '7',
    title: 'Design e Alinhamento de Sobrancelha',
    category: 'sobrancelhas',
    categoryLabel: 'Sobrancelha',
    src: '/images/services/sobrancelha-design.jpg',
    alt: 'Design de sobrancelha com arqueamento natural e alinhamento',
  },
  {
    id: '8',
    title: 'Penteado com Tranças Laterais e Cachos',
    category: 'cabelos',
    categoryLabel: 'Cabelos',
    src: '/images/brides/noiva-vestido-altar.jpg',
    alt: 'Penteado semi-preso com tranças de raiz e cachos soltos',
  },
]

export default function GallerySection() {
  const [selectedFilter, setSelectedFilter] = useState<string>('todas')
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null)

  const filteredItems =
    selectedFilter === 'todas'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === selectedFilter)

  // Tecla ESC para fechar o lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePhoto(null)
    }
    if (activePhoto) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePhoto])

  return (
    <section
      id="galeria"
      className="py-24 sm:py-32 bg-[#F5ECE7] relative"
      aria-labelledby="gallery-title"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Cabeçalho da Galeria */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#7D3B7C] font-semibold">
              Portfólio de Beleza
            </p>
            <h2
              id="gallery-title"
              className="font-display text-3xl sm:text-5xl font-normal text-[#1C181D]"
            >
              Resultados reais e transformações.
            </h2>
            <p className="text-sm sm:text-base text-[#756A73] font-light leading-relaxed">
              Explore nossos trabalhos em noivas, penteados, valorização de cachos, maquiagem e design de sobrancelhas.
            </p>
          </div>

          {/* Filtros da Galeria */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'noivas', label: 'Noivas' },
              { id: 'cabelos', label: 'Cabelos' },
              { id: 'maquiagem', label: 'Maquiagem' },
              { id: 'sobrancelhas', label: 'Sobrancelha' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={[
                  'px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer',
                  selectedFilter === tab.id
                    ? 'bg-[#7D3B7C] text-white shadow-xs'
                    : 'bg-white/80 text-[#1C181D] hover:bg-white border border-[#EAE2DC]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Imagens da Galeria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-xs border border-[#EAE2DC] bg-white"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] uppercase tracking-widest text-[#D4B896]">
                  {item.categoryLabel}
                </span>
                <p className="font-display text-base leading-snug mt-1">
                  {item.title}
                </p>
                <span className="text-xs text-white/80 mt-2 inline-flex items-center gap-1 font-light">
                  Ampliar foto ↗
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chamada para o Instagram */}
        <div className="mt-14 p-8 rounded-3xl bg-white border border-[#EAE2DC] text-center max-w-xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#7D3B7C] font-semibold">
            Instagram Oficial
          </p>
          <p className="text-sm text-[#756A73] font-light">
            Acompanhe nossas produções diárias, vídeos de procedimentos e bastidores do estúdio.
          </p>
          <div className="pt-2">
            <a
              href="https://instagram.com/espacopivotto_bec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#1C181D] bg-[#F4EDE8] hover:bg-[#EAE2DC] rounded-full transition-colors"
            >
              <span>Ver mais em @espacopivotto_bec</span>
              <span>↗</span>
            </a>
          </div>
        </div>

      </div>

      {/* Modal Lightbox */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/4] max-h-[75vh] w-full bg-black">
              <img
                src={activePhoto.src}
                alt={activePhoto.alt}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar ampliação"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#7D3B7C] font-semibold">
                  {activePhoto.categoryLabel}
                </span>
                <h3 className="font-display text-xl text-[#1C181D]">
                  {activePhoto.title}
                </h3>
              </div>
              <a
                href="https://wa.me/message/PTIHBB6DIPQTH1"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-white bg-[#7D3B7C] hover:bg-[#672B66] rounded-full transition-colors"
              >
                Agendar
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
