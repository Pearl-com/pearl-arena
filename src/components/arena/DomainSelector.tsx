import { DOMAINS } from '@/lib/constants'
import type { DomainId } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface DomainSelectorProps {
  selected: DomainId | null
  onSelect: (domain: DomainId) => void
}

export function DomainSelector({ selected, onSelect }: DomainSelectorProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-6 h-6 rounded-full bg-theme-overlay/10 flex items-center justify-center text-[11px] font-bold text-theme-muted">1</span>
        <span className="text-sm font-medium text-theme-muted">Choose your domain</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Select domain">
        {DOMAINS.map(d => (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            role="radio"
            aria-checked={selected === d.id}
            aria-label={`${d.label} — ${d.expert}`}
            className={cn(
              'relative flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left overflow-hidden group shadow-theme-sm',
              selected === d.id
                ? 'border-theme-border/25 bg-theme-overlay/[0.08] shadow-theme-md'
                : 'border-theme-border/70 bg-theme-overlay/[0.02] hover:bg-theme-overlay/[0.05] hover:border-theme-border hover:shadow-theme-md'
            )}
          >
            {/* Accent gradient when selected */}
            {selected === d.id && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${d.accent} pointer-events-none opacity-70`}
              />
            )}
            <span className="text-2xl relative z-10 mt-0.5">{d.icon}</span>
            <div className="relative z-10 min-w-0">
              <div className="text-sm font-semibold text-theme-text-secondary">{d.label}</div>
              <div className="text-[11px] text-theme-muted/70 truncate">{d.expert}</div>
              <div className="text-[10px] text-theme-muted/50 mt-0.5 hidden sm:block truncate">{d.description}</div>
            </div>
            {selected === d.id && (
              <div
                className="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-theme-text font-bold"
                style={{ backgroundColor: d.color }}
              >
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
