import { scoreColor, scoreLabel, formatDuration, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { ExpertScore } from '@/lib/types'

interface Model {
  id: string
  name: string
  provider: string
  color: string
  letter: string
}

interface ResponseCardProps {
  model: Model
  response: string
  isLoading: boolean
  isPearl?: boolean
  score?: ExpertScore
  isWinner?: boolean
  responseTime?: number
}

export function ResponseCard({
  model,
  response,
  isLoading,
  isPearl,
  score,
  isWinner,
  responseTime,
}: ResponseCardProps) {
  const borderColor = isPearl ? '#F5C842' : model.color

  return (
    <div
      className={cn(
        'relative rounded-2xl border overflow-hidden transition-all duration-500 flex flex-col',
        isWinner
          ? 'ring-2 ring-green-400/40 shadow-xl shadow-green-500/10'
          : isPearl
          ? 'border-pearl/25 bg-gradient-to-b from-pearl/[0.05] to-transparent'
          : 'border-theme-border bg-theme-card shadow-theme-md'
      )}
    >
      {/* Winner ribbon */}
      {isWinner && (
        <div className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
      )}

      {/* Card Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b shrink-0',
          isPearl ? 'border-pearl/15' : 'border-theme-border/60'
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{
              backgroundColor: `${borderColor}22`,
              color: borderColor,
              border: `1px solid ${borderColor}44`,
            }}
          >
            {isPearl ? '✦' : model.letter}
          </div>
          <div>
            <div
              className={cn('text-[13px] font-semibold', isPearl ? 'text-pearl/90' : 'text-theme-text-secondary')}
            >
              {model.name}
            </div>
            <div className="text-[10px] text-theme-muted/70">{model.provider}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {responseTime && (
            <span className="text-[10px] text-theme-muted/50 font-mono">{formatDuration(responseTime)}</span>
          )}
          {isPearl && (
            <Badge color="#F5C842" size="sm">AI + Expert</Badge>
          )}
          {isWinner && (
            <Badge color="#22C55E" size="sm" dot pulse>Winner</Badge>
          )}
        </div>
      </div>

      {/* Score Bar */}
      {score && (
        <div className="px-4 py-2.5 border-b border-theme-border/50 bg-theme-bg/20 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-theme-muted font-medium uppercase tracking-wider">Expert Score</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: scoreColor(score.overall) }}>
                {scoreLabel(score.overall)}
              </span>
              <span
                className="text-lg font-bold font-mono"
                style={{ color: scoreColor(score.overall) }}
              >
                {score.overall.toFixed(1)}
              </span>
            </div>
          </div>
          {/* Overall bar */}
          <div className="h-1.5 rounded-full bg-theme-overlay/[0.06] overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${score.overall * 10}%`,
                backgroundColor: scoreColor(score.overall),
              }}
            />
          </div>
          {/* Sub-scores */}
          <div className="grid grid-cols-5 gap-1">
            {[
              { label: 'Acc', value: score.accuracy },
              { label: 'Comp', value: score.completeness },
              { label: 'Safe', value: score.safety },
              { label: 'Clear', value: score.clarity },
              { label: 'Trust', value: score.trustworthiness },
            ].map(sub => (
              <div key={sub.label} className="text-center">
                <div className="text-[9px] text-theme-muted/50 mb-0.5">{sub.label}</div>
                <div
                  className="text-[11px] font-bold"
                  style={{ color: scoreColor(sub.value) }}
                >
                  {sub.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Body */}
      <div className="p-4 flex-1 min-h-[140px] max-h-[320px] overflow-y-auto">
        {isLoading && !response ? (
          <div className="flex items-center gap-2 text-theme-muted/70 h-full">
            <div className="flex gap-1">
              {[0, 150, 300].map(delay => (
                <div
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-theme-overlay/30 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <span className="text-xs">Generating response…</span>
          </div>
        ) : (
          <div
            className={cn(
              'text-[13px] leading-relaxed whitespace-pre-wrap',
              response ? 'text-theme-text-secondary' : 'text-theme-muted/50 italic'
            )}
          >
            {response || 'Waiting…'}
            {isLoading && response && (
              <span className="inline-block w-0.5 h-3.5 bg-theme-overlay/60 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </div>
        )}
      </div>

      {/* Expert notes */}
      {score?.notes && (
        <div className="px-4 py-2.5 border-t border-theme-border/50 bg-theme-bg/10">
          <p className="text-[11px] text-theme-muted/70 italic">"{score.notes}"</p>
        </div>
      )}
    </div>
  )
}
