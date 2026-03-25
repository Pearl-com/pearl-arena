import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'pearl'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-bg disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-theme-text text-theme-bg hover:bg-theme-text/90 focus:ring-theme-text/50',
    secondary: 'bg-theme-overlay/[0.06] text-theme-text-secondary border border-theme-border/10 hover:bg-theme-overlay/[0.10] hover:border-theme-border/20 hover:text-theme-text focus:ring-theme-border/20',
    ghost: 'text-theme-muted hover:text-theme-text/90 hover:bg-theme-overlay/[0.05] focus:ring-theme-border/20',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30 focus:ring-red-500/50',
    pearl: 'bg-gradient-to-r from-pearl to-pearl-dark text-black font-semibold hover:shadow-lg hover:shadow-pearl/20 hover:scale-[1.02] focus:ring-pearl/50',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  )
}
