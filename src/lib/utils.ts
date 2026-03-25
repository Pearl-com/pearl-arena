import { clsx, type ClassValue } from 'clsx'
import { DOMAINS, MODELS, PEARL_MODEL } from './constants'
import type { DomainId } from './constants'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function getDomain(id: DomainId) {
  return DOMAINS.find(d => d.id === id)
}

export function getModel(id: string) {
  if (id === 'pearl') return PEARL_MODEL
  return MODELS.find(m => m.id === id)
}

export function scoreColor(score: number): string {
  if (score >= 8.5) return '#22C55E'  // green-500
  if (score >= 7) return '#F59E0B'    // amber-500
  if (score >= 5) return '#EF4444'    // red-500
  return '#6B7280'                    // gray-500
}

export function scoreLabel(score: number): string {
  if (score >= 9) return 'Exceptional'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Good'
  if (score >= 6) return 'Fair'
  if (score >= 5) return 'Poor'
  return 'Very Poor'
}

export function trendIcon(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

export function trendColor(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return '#22C55E'
  if (trend === 'down') return '#EF4444'
  return '#6B7280'
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export function winRateColor(rate: number): string {
  if (rate >= 0.35) return '#22C55E'
  if (rate >= 0.20) return '#F59E0B'
  if (rate >= 0.10) return '#6366F1'
  return '#6B7280'
}

export function generateSessionId(): string {
  return `arena-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getDomainColor(domain: DomainId): string {
  return getDomain(domain)?.color ?? '#6B7280'
}

export function difficultyColor(d: string): string {
  const map: Record<string, string> = {
    easy: '#22C55E',
    medium: '#F59E0B',
    hard: '#EF4444',
    expert: '#8B5CF6',
  }
  return map[d] ?? '#6B7280'
}

export function pluralize(count: number, word: string, plural?: string): string {
  return count === 1 ? `${count} ${word}` : `${count} ${plural ?? word + 's'}`
}
