interface LoaderProps {
  label?: string
  className?: string
}

export default function Loader({
  label = 'Carregando…',
  className = '',
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
    >
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-[#EAE2DC]" />
        <div className="absolute inset-0 rounded-full border-2 border-[#7D3B7C] border-t-transparent animate-spin" />
      </div>
      {label && (
        <span className="text-xs uppercase tracking-[0.15em] text-[#756A73] font-light">
          {label}
        </span>
      )}
    </div>
  )
}
