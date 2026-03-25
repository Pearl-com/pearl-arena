import { DOMAINS } from '@/lib/constants'
import type { ExpertJudgment, FlaggedError } from '@/lib/types'
import type { DomainId } from '@/lib/constants'
import { scoreColor } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface ExpertJudgePanelProps {
  domain: DomainId
  judgment: ExpertJudgment | null
  isJudging: boolean
  onRequestJudgment: () => void
  /** True when Pearl API is configured → real licensed human expert */
  usesRealExpert?: boolean
}

export function ExpertJudgePanel({
  domain,
  judgment,
  isJudging,
  onRequestJudgment,
  usesRealExpert = false,
}: ExpertJudgePanelProps) {
  const domainInfo = DOMAINS.find(d => d.id === domain)

  // ── Pre-judgment CTA ──────────────────────────────────────────────────────
  if (!judgment && !isJudging) {
    return (
      <div className="mt-8 text-center space-y-3">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-overlay/[0.04] border border-theme-border text-xs mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {usesRealExpert ? (
            <span className="text-green-400/80">Licensed {domainInfo?.expertShort ?? domainInfo?.expert} available via Pearl API</span>
          ) : (
            <span className="text-theme-muted">{domainInfo?.expert} · AI simulation</span>
          )}
        </div>

        {/* CTA button */}
        <div>
          <button
            onClick={onRequestJudgment}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-black text-base transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-pearl/20"
            style={{ background: 'linear-gradient(135deg, #F5C842 0%, #E8A817 100%)' }}
          >
            <span className="text-xl">{domainInfo?.icon}</span>
            <span>
              {usesRealExpert ? `Ask Licensed ${domainInfo?.expertShort ?? 'Expert'} to Judge` : 'Request Expert Judgment'}
            </span>
            <span className="absolute inset-0 rounded-2xl bg-theme-overlay/0 group-hover:bg-theme-overlay/10 transition-all" />
          </button>
        </div>

        <p className="text-xs text-theme-muted/50">
          {usesRealExpert
            ? `A real licensed ${domainInfo?.expert} will review every response via Pearl's expert network`
            : 'Expert judgment simulated via AI · Connect Pearl API for real licensed expert review'
          }
        </p>
      </div>
    )
  }

  // ── Judging animation ─────────────────────────────────────────────────────
  if (isJudging) {
    return (
      <div className="mt-8 rounded-2xl border border-pearl/20 bg-pearl/[0.04] p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pearl/10 mb-5">
          <div className="w-8 h-8 rounded-full border-2 border-pearl/40 border-t-pearl animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-pearl/90 mb-1">
          {usesRealExpert ? 'Expert is reviewing all responses…' : 'Generating expert judgment…'}
        </h3>
        <p className="text-sm text-theme-muted/70 max-w-sm mx-auto">
          {usesRealExpert
            ? `A licensed ${domainInfo?.expert} is evaluating accuracy, completeness, safety, and trustworthiness via Pearl's expert network`
            : `AI simulation of a ${domainInfo?.expert} — scoring all responses across five dimensions`
          }
        </p>
        {usesRealExpert && (
          <p className="text-[11px] text-pearl/30 mt-2">This may take a few minutes · Please wait</p>
        )}
        <div className="flex items-center justify-center gap-6 mt-6">
          {['Accuracy', 'Safety', 'Completeness', 'Clarity'].map((criterion, i) => (
            <div key={criterion} className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-lg bg-pearl/10 border border-pearl/20 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
              <span className="text-[10px] text-theme-muted/70">{criterion}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!judgment) return null

  // ── Results panel ─────────────────────────────────────────────────────────
  const isHuman = judgment.isRealExpert ?? usesRealExpert
  const hasAvatar = !!judgment.expertAvatarUrl
  const criticalErrors = judgment.flaggedErrors.filter(e => e.severity === 'critical')
  const majorErrors    = judgment.flaggedErrors.filter(e => e.severity === 'major')
  const minorErrors    = judgment.flaggedErrors.filter(e => e.severity === 'minor')

  return (
    <div className="mt-8 rounded-2xl border border-pearl/20 bg-pearl/[0.03] overflow-hidden animate-fade-in shadow-theme-lg">

      {/* Expert identity card */}
      <div className="px-6 py-5 border-b border-pearl/10">
        <div className="flex items-start gap-4">

          {/* Avatar — real photo if available, domain icon fallback */}
          <div className="shrink-0 relative">
            {hasAvatar ? (
              <img
                src={judgment.expertAvatarUrl}
                alt={judgment.expertName}
                className="w-14 h-14 rounded-full object-cover border-2 border-pearl/30 shadow-lg shadow-black/30"
                onError={e => {
                  // Fallback to initials on broken image
                  const target = e.currentTarget
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            {/* Initials / icon fallback */}
            <div
              className={`w-14 h-14 rounded-full bg-pearl/15 border-2 border-pearl/25 flex items-center justify-center text-xl shadow-lg shadow-black/20 ${hasAvatar ? 'hidden' : ''}`}
            >
              {isHuman
                ? (
                  <span className="text-[18px] font-bold text-pearl/80">
                    {judgment.expertName.split(' ').map(p => p[0]).slice(0, 2).join('')}
                  </span>
                )
                : <span>{domainInfo?.icon}</span>
              }
            </div>
            {/* Live indicator for real experts */}
            {isHuman && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-theme-bg flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            )}
          </div>

          {/* Name, credential, expertise */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[15px] font-semibold text-pearl/95">{judgment.expertName}</span>
              {isHuman ? (
                <Badge color="#22C55E" size="sm" dot pulse>Verified Human Expert</Badge>
              ) : (
                <Badge color="#6366F1" size="sm" dot>AI Simulation</Badge>
              )}
            </div>

            <div className="text-[12px] text-pearl/55 leading-snug mb-1">
              {judgment.expertCredential}
            </div>

            {/* Extended expertise bio — only from real experts */}
            {isHuman && judgment.expertExpertise && judgment.expertExpertise !== judgment.expertCredential && (
              <div className="text-[11px] text-theme-muted/70 leading-relaxed mt-1">
                {judgment.expertExpertise}
              </div>
            )}

            {/* Pearl API badge */}
            <div className="flex items-center gap-2 mt-2">
              {isHuman ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-pearl/40 bg-pearl/[0.06] border border-pearl/15 px-2 py-0.5 rounded-full">
                  <span className="text-pearl text-[9px]">✦</span> Pearl Expert Network · API verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-theme-muted/50 bg-theme-overlay/[0.03] border border-theme-border/70 px-2 py-0.5 rounded-full">
                  AI-generated judgment · Connect Pearl API for real expert review
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score overview */}
      {judgment.scores.length > 0 && (
        <div className="px-6 py-4 border-b border-pearl/10 bg-theme-bg/10">
          <div className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-3">
            {usesRealExpert ? 'Expert Scores (Human Verified)' : 'Simulated Expert Scores'}
          </div>
          <div className="space-y-2">
            {[...judgment.scores]
              .sort((a, b) => b.overall - a.overall)
              .map((s, i) => (
                <div key={s.modelId} className="flex items-center gap-3">
                  <span className="text-[11px] text-theme-muted/70 font-mono w-4">{i + 1}</span>
                  <span className="text-[12px] text-theme-text-secondary w-28 truncate font-medium">{s.modelName}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-theme-overlay/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${s.overall * 10}%`, backgroundColor: scoreColor(s.overall) }}
                    />
                  </div>
                  <span className="text-sm font-bold font-mono w-8 text-right" style={{ color: scoreColor(s.overall) }}>
                    {s.overall.toFixed(1)}
                  </span>
                  {s.modelId === judgment.winnerId && <span className="text-[10px]">🏆</span>}
                </div>
              ))}
          </div>

          {/* Breakdown legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-theme-border/50">
            {[
              { label: 'Accuracy', weight: '35%' },
              { label: 'Completeness', weight: '25%' },
              { label: 'Safety', weight: '20%' },
              { label: 'Clarity', weight: '10%' },
              { label: 'Trust', weight: '10%' },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-1">
                <span className="text-[9px] text-theme-muted/70">{c.label}</span>
                <span className="text-[9px] text-theme-muted/30">({c.weight})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expert reasoning */}
      <div className="px-6 py-4">
        <div className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-3">
          {usesRealExpert ? 'Expert Analysis' : 'AI-Simulated Analysis'}
        </div>
        <div className="text-[13px] text-theme-text-secondary leading-relaxed whitespace-pre-wrap">
          {judgment.reasoning}
        </div>
      </div>

      {/* Flagged errors */}
      {judgment.flaggedErrors.length > 0 && (
        <div className="px-6 py-4 border-t border-red-500/10 bg-red-500/[0.03]">
          <div className="text-xs font-semibold text-red-400/80 uppercase tracking-wider mb-3">
            ⚠ Errors & Omissions Flagged
          </div>
          <div className="space-y-2">
            {[...criticalErrors, ...majorErrors, ...minorErrors].map((err: FlaggedError, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-xs bg-red-500/[0.05] rounded-xl px-3 py-2.5 border border-red-500/[0.08]"
              >
                <span className={`shrink-0 font-bold ${
                  err.severity === 'critical' ? 'text-red-400' : err.severity === 'major' ? 'text-orange-400' : 'text-yellow-400/70'
                }`}>
                  {err.severity === 'critical' ? '🔴' : err.severity === 'major' ? '🟠' : '🟡'}
                </span>
                <span className="text-red-300/70">
                  <strong className="text-red-300/90">{err.modelName}:</strong> {err.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winner announcement */}
      <div className="px-6 py-4 border-t border-green-500/10 bg-green-500/[0.03] flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <div>
          <div className="text-xs text-theme-muted mb-0.5">
            {isHuman ? "Expert's Best Response" : "Simulated Expert Pick"}
          </div>
          <div className="text-sm font-semibold text-green-400">{judgment.winnerName}</div>
        </div>
        {isHuman && (
          <div className="ml-auto flex items-center gap-2">
            {hasAvatar && (
              <img
                src={judgment.expertAvatarUrl}
                alt={judgment.expertName}
                className="w-6 h-6 rounded-full object-cover border border-pearl/20 opacity-60"
              />
            )}
            <div className="text-[10px] text-theme-muted/50 text-right leading-tight">
              Judged by {judgment.expertName}<br />
              <span className="text-pearl/30">via Pearl Expert Network</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
