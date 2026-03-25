import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  variant?: 'filled' | 'outlined' | 'subtle'
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
  pulse?: boolean
}

export function Badge({
  children,
  color = '#6B7280',
  variant = 'subtle',
  size = 'sm',
  className,
  dot,
  pulse,
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  const style: React.CSSProperties = variant === 'subtle'
    ? { backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }
    : variant === 'outlined'
    ? { color, border: `1px solid ${color}50`, backgroundColor: 'transparent' }
    : { backgroundColor: color, color: '#fff' }

  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap', sizeClasses[size], className)}
      style={style}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', pulse && 'animate-pulse')}
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  )
}
