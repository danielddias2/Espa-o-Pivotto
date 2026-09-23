interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export default function ErrorMessage({
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`p-6 bg-[#FAF3F5] border border-[#F0D5DD] rounded-xl text-center space-y-3 ${className}`}
    >
      <p className="text-sm text-[#922842] font-light leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs uppercase tracking-[0.15em] font-medium text-[#7D3B7C] hover:text-[#672B66] underline underline-offset-4 cursor-pointer"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
