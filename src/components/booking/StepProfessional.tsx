import type { Service, Professional } from '@/types'
import { useProfessionals } from '@/hooks/useProfessionals'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'

interface StepProfessionalProps {
  service: Service
  selected: Professional | null
  isAnyProfessional: boolean
  onSelect: (prof: Professional | null, isAny: boolean) => void
  onNext: () => void
  onBack: () => void
}

export default function StepProfessional({
  service,
  selected,
  isAnyProfessional,
  onSelect,
  onNext,
  onBack,
}: StepProfessionalProps) {
  const { professionals, state, error, refetch } = useProfessionals(service.id)

  const hasSelection = isAnyProfessional || selected !== null

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho da Etapa */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7D3B7C] font-semibold mb-1">
          Etapa 2 de 6
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-[#1C181D]">
          Escolha a Profissional
        </h2>
        <p className="text-sm text-[#756A73] font-light mt-1">
          Selecione quem você deseja que realize seu procedimento (<strong className="font-medium text-[#1C181D]">{service.name}</strong>) ou escolha qualquer profissional disponível.
        </p>
      </div>

      {state === 'loading' && <Loader label="Buscando profissionais habilitadas…" />}

      {state === 'error' && (
        <ErrorMessage
          message={error || 'Erro ao carregar profissionais.'}
          onRetry={refetch}
        />
      )}

      {state === 'success' && (
        <div className="space-y-4">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
            role="radiogroup"
            aria-label="Seleção de profissional"
          >
            {/* Opção 1: Qualquer profissional disponível */}
            <div
              role="radio"
              aria-checked={isAnyProfessional}
              tabIndex={0}
              onClick={() => onSelect(null, true)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onSelect(null, true)
                }
              }}
              className={[
                'p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-4 sm:col-span-2 group',
                isAnyProfessional
                  ? 'border-[#7D3B7C] bg-[#FAF0F8] ring-2 ring-[#7D3B7C]/20 shadow-xs'
                  : 'border-[#EAE2DC] bg-white hover:border-[#7D3B7C]/40 hover:bg-[#FAF7F5]',
              ].join(' ')}
            >
              {/* Ícone Estilizado de Equipe */}
              <div
                className={[
                  'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-2xs',
                  isAnyProfessional
                    ? 'bg-[#7D3B7C] text-white'
                    : 'bg-[#F4EDE8] text-[#7D3B7C] group-hover:bg-[#FAF0F8]',
                ].join(' ')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-sm sm:text-base text-[#1C181D]">
                    Qualquer profissional disponível
                  </h3>
                  <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-[#EAE2DC] text-[#7D3B7C]">
                    Mais Horários
                  </span>
                </div>
                <p className="text-xs text-[#756A73] leading-relaxed mt-1">
                  Ideal se você procura o horário mais conveniente. O atendimento será realizado por uma profissional qualificada da nossa equipe.
                </p>
              </div>

              {/* Radio indicator */}
              <div
                className={[
                  'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                  isAnyProfessional
                    ? 'border-[#7D3B7C] bg-[#7D3B7C]'
                    : 'border-[#D1C7BD] bg-white',
                ].join(' ')}
              >
                {isAnyProfessional && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            {/* Opções das Profissionais Específicas */}
            {professionals.map((prof) => {
              const isSelected = !isAnyProfessional && selected?.id === prof.id

              return (
                <div
                  key={prof.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => onSelect(prof, false)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault()
                      onSelect(prof, false)
                    }
                  }}
                  className={[
                    'p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3.5 group',
                    isSelected
                      ? 'border-[#7D3B7C] bg-[#FAF0F8] ring-2 ring-[#7D3B7C]/20 shadow-xs'
                      : 'border-[#EAE2DC] bg-white hover:border-[#7D3B7C]/40 hover:bg-[#FAF7F5]',
                  ].join(' ')}
                >
                  {/* Avatar Circular */}
                  <div className="w-12 h-12 rounded-full border border-[#7D3B7C]/20 overflow-hidden bg-[#FAF0F8] flex items-center justify-center shrink-0 shadow-2xs">
                    {prof.photo_url ? (
                      <img
                        src={prof.photo_url}
                        alt={prof.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-display font-semibold text-lg text-[#7D3B7C]">
                        {prof.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[#1C181D] truncate group-hover:text-[#7D3B7C] transition-colors">
                      {prof.name}
                    </h3>

                    {prof.specialty && (
                      <p className="text-xs text-[#C8A882] font-medium truncate mt-0.5">
                        {prof.specialty}
                      </p>
                    )}

                    {prof.bio && (
                      <p className="text-[11px] text-[#756A73] leading-relaxed line-clamp-2 mt-1">
                        {prof.bio}
                      </p>
                    )}
                  </div>

                  {/* Radio indicator */}
                  <div
                    className={[
                      'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                      isSelected
                        ? 'border-[#7D3B7C] bg-[#7D3B7C]'
                        : 'border-[#D1C7BD] bg-white',
                    ].join(' ')}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              )
            })}
          </div>

          {professionals.length === 0 && (
            <div className="p-5 bg-[#FAF7F5] border border-[#EAE2DC] rounded-2xl text-center text-xs text-[#756A73]">
              Não há profissionais específicas vinculadas exclusivamente a este procedimento no momento.
              Você pode prosseguir com a opção <strong>"Qualquer profissional disponível"</strong>.
            </div>
          )}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-xs uppercase tracking-wider font-semibold text-[#756A73] hover:text-[#1C181D] transition-colors py-2 text-center sm:text-left cursor-pointer"
        >
          ← Alterar Procedimento
        </button>
        <Button onClick={onNext} disabled={!hasSelection} size="lg">
          Continuar para Data →
        </Button>
      </div>
    </div>
  )
}
