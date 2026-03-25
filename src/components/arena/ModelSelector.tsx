import { MODELS, PEARL_MODEL, PROVIDER_GROUPS } from '@/lib/constants'
import { isProviderConfigured } from '@/lib/providers'
import type { ProviderId } from '@/lib/providers'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface ModelSelectorProps {
  selected: string[]
  onToggle: (id: string) => void
  maxModels?: number
}

// Build ordered groups from MODELS array preserving order of first appearance
function buildGroups() {
  const order: string[] = []
  const groups: Record<string, typeof MODELS[number][]> = {}
  for (const m of MODELS) {
    if (!groups[m.group]) {
      groups[m.group] = []
      order.push(m.group)
    }
    groups[m.group].push(m)
  }
  return { order, groups }
}

const { order: GROUP_ORDER, groups: GROUPED_MODELS } = buildGroups()

export function ModelSelector({ selected, onToggle, maxModels = 4 }: ModelSelectorProps) {
  const isMaxed = selected.length >= maxModels

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-6 h-6 rounded-full bg-theme-overlay/10 flex items-center justify-center text-[11px] font-bold text-theme-muted">2</span>
        <span className="text-sm font-medium text-theme-muted">
          Select challengers{' '}
          <span className="text-theme-muted/70">({selected.length}/{maxModels})</span>
        </span>
        <span className="ml-auto text-[10px] text-theme-muted/50">
          {MODELS.length} models available
        </span>
      </div>

      {/* Provider groups */}
      <div className="space-y-4">
        {GROUP_ORDER.map(group => {
          const groupMeta = PROVIDER_GROUPS[group]
          const models = GROUPED_MODELS[group]
          if (!models?.length) return null

          // Check if any key is configured for the models in this group
          const anyConfigured = models.some(m => isProviderConfigured(m.apiProvider as ProviderId))

          return (
            <div key={group}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: groupMeta?.color ?? '#666' }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-theme-muted/70">
                  {groupMeta?.label ?? group}
                </span>
                {!anyConfigured && (
                  <span className="text-[9px] text-theme-muted/30 ml-1">· no key · simulated</span>
                )}
                <div className="h-px flex-1 bg-theme-overlay/[0.04]" />
              </div>

              {/* Models in this group */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {models.map(m => {
                  const isSelected = selected.includes(m.id)
                  const isDisabled = isMaxed && !isSelected

                  return (
                    <button
                      key={m.id}
                      onClick={() => onToggle(m.id)}
                      disabled={isDisabled}
                      title={m.description}
                      className={cn(
                        'relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left group shadow-theme-sm',
                        isSelected
                          ? 'border-theme-border/25 bg-theme-overlay/[0.08] shadow-theme-md'
                          : isDisabled
                          ? 'border-theme-border/50 bg-theme-overlay/[0.02] opacity-35 cursor-not-allowed'
                          : 'border-theme-border/80 bg-theme-overlay/[0.03] hover:bg-theme-overlay/[0.07] hover:border-theme-border hover:shadow-theme-md cursor-pointer'
                      )}
                    >
                      {/* Model avatar */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{
                          backgroundColor: `${m.color}22`,
                          color: m.color,
                          border: `1px solid ${m.color}44`,
                        }}
                      >
                        {m.letter}
                      </div>

                      {/* Name + provider */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[12px] font-semibold text-theme-text-secondary truncate leading-tight">
                            {m.shortName}
                          </span>
                          {m.isNew && (
                            <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 leading-none">
                              New
                            </span>
                          )}
                          {m.isReasoning && (
                            <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-violet-500/20 text-violet-400 leading-none">
                              R1
                            </span>
                          )}
                          {m.hasSearch && (
                            <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-400 leading-none">
                              🔍
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-theme-muted/70 truncate leading-tight mt-0.5">{m.provider}</div>
                      </div>

                      {/* Check mark */}
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 border-2 border-theme-bg flex items-center justify-center shrink-0">
                          <span className="text-[9px] text-theme-text font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pearl AI — always included */}
      <div className="flex items-center gap-2 mt-5 mb-3">
        <div className="h-px flex-1 bg-theme-overlay/[0.05]" />
        <span className="text-[10px] text-theme-muted/50 uppercase tracking-widest">always included</span>
        <div className="h-px flex-1 bg-theme-overlay/[0.05]" />
      </div>

      <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-pearl/25 bg-pearl/[0.06]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-pearl/20 text-pearl border border-pearl/30">
          ✦
        </div>
        <div>
          <div className="text-sm font-semibold text-pearl/90">{PEARL_MODEL.name}</div>
          <div className="text-[10px] text-pearl/50">{PEARL_MODEL.provider}</div>
        </div>
        <Badge color="#F5C842" size="sm" dot pulse>Always On</Badge>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400">New</span>
          <span className="text-[9px] text-theme-muted/50">recently released</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-violet-500/20 text-violet-400">R1</span>
          <span className="text-[9px] text-theme-muted/50">reasoning model</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-400">🔍</span>
          <span className="text-[9px] text-theme-muted/50">web search</span>
        </div>
      </div>
    </div>
  )
}
