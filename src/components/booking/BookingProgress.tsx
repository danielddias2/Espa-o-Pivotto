const STEPS = [
  { n: 1, label: 'Serviço' },
  { n: 2, label: 'Data'    },
  { n: 3, label: 'Horário' },
  { n: 4, label: 'Dados'   },
  { n: 5, label: 'Revisão' },
]

interface BookingProgressProps {
  currentStep: number // 1–5
}

export default function BookingProgress({ currentStep }: BookingProgressProps) {
  const pct = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <>
      {/* Mobile: barra + texto */}
      <div className="sm:hidden mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#756A73]">
            Etapa {currentStep} de {STEPS.length}
          </span>
          <span className="text-xs tracking-wider uppercase text-[#7D3B7C] font-semibold">
            {STEPS[currentStep - 1]?.label}
          </span>
        </div>
        <div className="h-1 bg-[#EAE2DC] rounded-full overflow-hidden relative">
          <div
            aria-hidden="true"
            className="h-full bg-[#7D3B7C] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop: círculos + labels + conexões */}
      <div
        className="hidden sm:flex items-center justify-between mb-12 max-w-xl mx-auto"
        role="list"
        aria-label="Etapas do agendamento"
      >
        {STEPS.map((step, i) => {
          const done = step.n < currentStep
          const current = step.n === currentStep
          return (
            <div key={step.n} className="flex items-center flex-1 last:flex-none" role="listitem">
              <div className="flex flex-col items-center gap-2">
                <div
                  aria-current={current ? 'step' : undefined}
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                    done ? 'bg-[#7D3B7C] text-white shadow-xs' : '',
                    current ? 'bg-[#1C181D] text-white ring-4 ring-[#7D3B7C]/20 shadow-xs' : '',
                    !done && !current ? 'bg-[#F4EDE8] text-[#756A73] border border-[#EAE2DC]' : '',
                  ].join(' ')}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step.n
                  )}
                </div>
                <span
                  className={[
                    'text-[11px] tracking-wider uppercase whitespace-nowrap font-medium',
                    current ? 'text-[#7D3B7C] font-semibold' : 'text-[#756A73]',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'flex-1 h-0.5 mx-3 mb-6 transition-colors duration-500',
                    done ? 'bg-[#7D3B7C]' : 'bg-[#EAE2DC]',
                  ].join(' ')}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
