import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  glowColor?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, hover, glow, glowColor, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }
  return (
    <div
      className={cn(
        'rounded-2xl border border-theme-border bg-theme-card shadow-theme-sm transition-all duration-200',
        hover && 'hover:border-theme-border hover:bg-theme-card-hover hover:shadow-theme-md',
        glow && 'ring-1',
        paddings[padding],
        className
      )}
      style={glow && glowColor ? { boxShadow: `0 0 20px ${glowColor}20`, borderColor: `${glowColor}40` } : undefined}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  icon?: string
  color?: string
  trend?: string
  trendUp?: boolean
}

export function StatCard({ label, value, subLabel, icon, color = '#6366F1', trend, trendUp }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-theme-muted font-medium uppercase tracking-wider">{label}</span>
        {icon && (
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ backgroundColor: `${color}20` }}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-theme-text">{value}</div>
          {subLabel && <div className="text-xs text-theme-muted mt-0.5">{subLabel}</div>}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </Card>
  )
}
