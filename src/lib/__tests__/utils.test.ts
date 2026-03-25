import { describe, it, expect } from 'vitest'
import { scoreColor, scoreLabel, formatDuration, formatNumber, pluralize, cn } from '../utils'

describe('scoreColor', () => {
  it('returns green for scores >= 8.5', () => {
    expect(scoreColor(8.5)).toBe('#22C55E')
    expect(scoreColor(9.5)).toBe('#22C55E')
    expect(scoreColor(10)).toBe('#22C55E')
  })

  it('returns amber for scores >= 7 and < 8.5', () => {
    expect(scoreColor(7)).toBe('#F59E0B')
    expect(scoreColor(8.4)).toBe('#F59E0B')
  })

  it('returns red for scores >= 5 and < 7', () => {
    expect(scoreColor(5)).toBe('#EF4444')
    expect(scoreColor(6.9)).toBe('#EF4444')
  })

  it('returns gray for scores < 5', () => {
    expect(scoreColor(4.9)).toBe('#6B7280')
    expect(scoreColor(0)).toBe('#6B7280')
  })
})

describe('scoreLabel', () => {
  it('returns correct labels for score thresholds', () => {
    expect(scoreLabel(9.5)).toBe('Exceptional')
    expect(scoreLabel(9)).toBe('Exceptional')
    expect(scoreLabel(8.5)).toBe('Excellent')
    expect(scoreLabel(8)).toBe('Excellent')
    expect(scoreLabel(7.5)).toBe('Good')
    expect(scoreLabel(6.5)).toBe('Fair')
    expect(scoreLabel(5)).toBe('Poor')
    expect(scoreLabel(4)).toBe('Very Poor')
  })
})

describe('formatDuration', () => {
  it('formats milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms')
  })

  it('formats seconds', () => {
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(30000)).toBe('30.0s')
  })

  it('formats minutes', () => {
    expect(formatDuration(90000)).toBe('1m 30s')
  })
})

describe('formatNumber', () => {
  it('formats millions', () => {
    expect(formatNumber(1500000)).toBe('1.5M')
  })

  it('formats thousands', () => {
    expect(formatNumber(12847)).toBe('12.8K')
  })

  it('returns plain number for < 1000', () => {
    expect(formatNumber(42)).toBe('42')
  })
})

describe('pluralize', () => {
  it('returns singular for count 1', () => {
    expect(pluralize(1, 'model')).toBe('1 model')
  })

  it('returns plural for count != 1', () => {
    expect(pluralize(3, 'model')).toBe('3 models')
  })

  it('uses custom plural form', () => {
    expect(pluralize(0, 'index', 'indices')).toBe('0 indices')
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const skip = false
    expect(cn('base', skip && 'skip', 'end')).toBe('base end')
  })
})
