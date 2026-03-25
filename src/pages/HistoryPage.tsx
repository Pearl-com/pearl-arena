import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { DOMAINS, MODELS, PEARL_MODEL } from '@/lib/constants'
import type { DomainId } from '@/lib/constants'
import { MOCK_HISTORY } from '@/lib/mock-data'
import { scoreColor, formatDuration, formatNumber } from '@/lib/utils'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const ALL_MODELS = [...MODELS, PEARL_MODEL]

export function HistoryPage() {
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState<DomainId | 'all'>('all')
  const [winnerFilter, setWinnerFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const PER_PAGE = 15

  const filtered = useMemo(() => {
    let list = [...MOCK_HISTORY]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(h => h.question.toLowerCase().includes(q) || h.winnerName.toLowerCase().includes(q))
    }
    if (domainFilter !== 'all') {
      list = list.filter(h => h.domain === domainFilter)
    }
    if (winnerFilter !== 'all') {
      list = list.filter(h => h.winner === winnerFilter)
    }
    return list
  }, [search, domainFilter, winnerFilter])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  // Stats
  const pearlWins = MOCK_HISTORY.filter(h => h.winner === 'pearl').length
  const avgScore = MOCK_HISTORY.reduce((s, h) => s + h.topScore, 0) / MOCK_HISTORY.length
  const avgDuration = MOCK_HISTORY.reduce((s, h) => s + h.sessionDuration, 0) / MOCK_HISTORY.length

  return (
    <div className="min-h-screen bg-theme-bg">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📜</span>
            <h1 className="text-3xl font-bold text-theme-text tracking-tight">Session History</h1>
          </div>
          <p className="text-theme-muted text-sm">Browse all completed arena battles with expert judgments.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Battles"
            value={formatNumber(MOCK_HISTORY.length * 250)}
            subLabel="all time"
            icon="⚔️"
            color="#6366F1"
          />
          <StatCard
            label="Pearl Wins"
            value={`${Math.round(pearlWins / MOCK_HISTORY.length * 100)}%`}
            subLabel="of judged battles"
            icon="✦"
            color="#F5C842"
          />
          <StatCard
            label="Avg Top Score"
            value={avgScore.toFixed(1)}
            subLabel="expert score"
            icon="⭐"
            color="#22C55E"
          />
          <StatCard
            label="Avg Session Time"
            value={formatDuration(avgDuration)}
            subLabel="start to judgment"
            icon="⏱️"
            color="#06B6D4"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted/70 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search questions…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full bg-theme-overlay/[0.04] border border-theme-border rounded-xl pl-9 pr-4 py-2 text-sm text-theme-text-secondary placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-border/20"
            />
          </div>

          {/* Domain filter */}
          <select
            value={domainFilter}
            onChange={e => { setDomainFilter(e.target.value as DomainId | 'all'); setPage(1) }}
            className="bg-theme-overlay/[0.04] border border-theme-border rounded-xl px-4 py-2 text-sm text-theme-text-secondary focus:outline-none focus:border-theme-border/20"
          >
            <option value="all">All Domains</option>
            {DOMAINS.map(d => (
              <option key={d.id} value={d.id}>{d.icon} {d.label}</option>
            ))}
          </select>

          {/* Winner filter */}
          <select
            value={winnerFilter}
            onChange={e => { setWinnerFilter(e.target.value); setPage(1) }}
            className="bg-theme-overlay/[0.04] border border-theme-border rounded-xl px-4 py-2 text-sm text-theme-text-secondary focus:outline-none focus:border-theme-border/20"
          >
            <option value="all">All Winners</option>
            <option value="pearl">Pearl AI</option>
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <div className="text-xs text-theme-muted/70 self-center ml-auto shrink-0">
            {filtered.length} sessions
          </div>
        </div>

        {/* Session List */}
        <Card padding="none" className="overflow-hidden mb-6">
          <div className="divide-y divide-theme-border/50">
            {paginated.map(session => {
              const domain = DOMAINS.find(d => d.id === session.domain)
              const winnerModel = session.winner === 'pearl'
                ? PEARL_MODEL
                : ALL_MODELS.find(m => m.id === session.winner)
              const isExpanded = expanded === session.id

              return (
                <div key={session.id}>
                  <button
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-theme-overlay/[0.02] transition text-left"
                    onClick={() => setExpanded(isExpanded ? null : session.id)}
                  >
                    {/* Domain badge */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${domain?.color}15`, border: `1px solid ${domain?.color}25` }}
                    >
                      {domain?.icon}
                    </div>

                    {/* Question */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-theme-text-secondary truncate leading-snug font-medium">
                        {session.question}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: domain?.color }}
                        >
                          {domain?.label}
                        </span>
                        <span className="text-[10px] text-theme-muted/50">
                          {session.models.length} models
                        </span>
                        <span className="text-[10px] text-theme-muted/50">
                          {formatDistanceToNow(session.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Winner */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm">🏆</span>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                        style={{
                          backgroundColor: `${winnerModel?.color}20`,
                          color: winnerModel?.color,
                          border: `1px solid ${winnerModel?.color}35`,
                        }}
                      >
                        {session.winner === 'pearl' ? '✦' : session.winnerName.slice(0, 2)}
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-[12px] font-medium text-theme-text-secondary">{session.winnerName}</div>
                        <div
                          className="text-[11px] font-mono font-bold"
                          style={{ color: scoreColor(session.topScore) }}
                        >
                          {session.topScore.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Expand indicator */}
                    <span className="text-theme-muted/50 text-sm ml-2 shrink-0">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-theme-border/50 bg-theme-overlay/[0.02]">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {/* Session info */}
                        <div className="col-span-2">
                          <div className="text-xs text-theme-muted/70 font-medium uppercase tracking-wider mb-2">Question</div>
                          <p className="text-sm text-theme-text-secondary leading-relaxed">{session.question}</p>
                        </div>
                        <div>
                          <div className="text-xs text-theme-muted/70 font-medium uppercase tracking-wider mb-2">Models</div>
                          <div className="flex flex-wrap gap-1.5">
                            {session.models.map(id => {
                              const model = id === 'pearl' ? PEARL_MODEL : ALL_MODELS.find(m => m.id === id)
                              return model ? (
                                <Badge key={id} color={model.color} size="sm">
                                  {id === 'pearl' ? '✦ Pearl' : model.name.split(' ')[0]}
                                </Badge>
                              ) : null
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-theme-muted/70 font-medium uppercase tracking-wider mb-2">Session Details</div>
                          <div className="space-y-1 text-xs text-theme-muted">
                            <div>Judged by: <span className="text-theme-text-secondary">{session.judgedBy}</span></div>
                            <div>Duration: <span className="text-theme-text-secondary">{formatDuration(session.sessionDuration)}</span></div>
                            <div>Date: <span className="text-theme-text-secondary">{format(session.timestamp, 'MMM d, yyyy h:mm a')}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-theme-border/50">
                        <span className="text-xs text-theme-muted/70">Share this battle:</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/arena?session=${session.id}`)}
                          className="text-xs text-blue-400/70 hover:text-blue-400 transition border border-blue-400/20 hover:border-blue-400/40 px-3 py-1 rounded-lg"
                        >
                          Copy Link
                        </button>
                        <Link
                          to="/arena"
                          className="text-xs text-pearl/70 hover:text-pearl transition border border-pearl/20 hover:border-pearl/40 px-3 py-1 rounded-lg"
                        >
                          Run Similar →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {paginated.length === 0 && (
              <div className="px-5 py-12 text-center text-theme-muted/70">
                <div className="text-3xl mb-3">🔍</div>
                <p>No sessions match your filters.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm text-theme-muted hover:text-theme-text-secondary border border-theme-border hover:border-theme-border disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      page === p
                        ? 'bg-theme-overlay/[0.12] text-theme-text'
                        : 'text-theme-muted hover:text-theme-text-secondary hover:bg-theme-overlay/[0.04]'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              {totalPages > 7 && <span className="text-theme-muted/50 px-1">…</span>}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg text-sm text-theme-muted hover:text-theme-text-secondary border border-theme-border hover:border-theme-border disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
