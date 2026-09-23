import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  pill?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#7D3B7C] text-white border border-[#7D3B7C] hover:bg-[#672B66] hover:border-[#672B66] hover:shadow-md focus-visible:ring-[#7D3B7C]',
  secondary:
    'bg-[#F4EDE8] text-[#1C181D] border border-[#EAE2DC] hover:bg-[#EAE2DC] focus-visible:ring-[#7D3B7C]',
  outline:
    'bg-transparent text-[#1C181D] border border-[#1C181D] hover:bg-[#1C181D] hover:text-white focus-visible:ring-[#1C181D]',
  ghost:
    'bg-transparent text-[#1C181D] hover:text-[#7D3B7C] hover:bg-[#F9F0F7] focus-visible:ring-[#7D3B7C]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs tracking-wider uppercase',
  md: 'px-5 py-2.5 text-sm tracking-wide',
  lg: 'w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-medium tracking-wide',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  pill = true,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      disabled={isDisabled}
      aria-busy={isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 cursor-pointer font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        pill ? 'rounded-full' : 'rounded-lg',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading && (
        <span
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
