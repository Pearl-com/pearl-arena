import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DOMAINS } from '@/lib/constants'
import type { DomainId } from '@/lib/constants'
import { MOCK_LEADERBOARD, PLATFORM_STATS } from '@/lib/mock-data'
import { scoreColor, winRateColor, trendIcon, trendColor, formatNumber } from '@/lib/utils'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

type SortKey = 'rank' | 'avgScore' | 'winRate' | 'totalSessions' | 'avgAccuracy' | 'avgSafety'

const SORT_LABELS: Record<SortKey, string> = {
  rank: 'Overall Rank',
  avgScore: 'Avg Score',
  winRate: 'Win Rate',
  totalSessions: 'Battles',
  avgAccuracy: 'Accuracy',
  avgSafety: 'Safety',
}

export function LeaderboardPage() {
  const [domainFilter, setDomainFilter] = useState<DomainId | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortKey>('avgScore')
  const [ascending, setAscending] = useState(false)
  const [search, setSearch] = useState('')

  const entries = useMemo(() => {
    let list = [...MOCK_LEADERBOARD]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.modelName.toLowerCase().includes(q) || e.provider.toLowerCase().includes(q))
    }

    // Domain filter
    if (domainFilter !== 'all') {
      list = list.map(e => ({
        ...e,
        avgScore: e.domainScores[domainFilter]?.avgScore ?? e.avgScore,
        winRate: e.domainScores[domainFilter]?.winRate ?? e.winRate,
        wins: e.domainScores[domainFilter]?.wins ?? e.wins,
        totalSessions: e.domainScores[domainFilter]?.sessions ?? e.totalSessions,
      }))
    }

    // Sort
    list.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as number
      const bVal = b[sortBy as keyof typeof b] as number
      return ascending ? aVal - bVal : bVal - aVal
    })

    return list.map((e, i) => ({ ...e, displayRank: i + 1 }))
  }, [domainFilter, sortBy, ascending, search])

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setAscending(!ascending)
    else { setSortBy(key); setAscending(false) }
  }

  const topModel = MOCK_LEADERBOARD[0]
  const totalSessions = MOCK_LEADERBOARD.reduce((s, e) => s + e.totalSessions, 0)
  const avgPearlWinRate = MOCK_LEADERBOARD.find(e => e.modelId === 'pearl')?.winRate ?? 0

  return (
    <div className="min-h-screen bg-theme-bg">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏆</span>
            <h1 className="text-3xl font-bold text-theme-text tracking-tight">Leaderboard</h1>
            <Badge color="#22C55E" size="sm" dot pulse>Live</Badge>
          </div>
          <p className="text-theme-muted text-sm max-w-xl">
            Overall model rankings based on expert-judged scores across all domains and sessions.
            Updated in real-time as battles complete.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="#1 Model"
            value={topModel.modelName}
            subLabel={`${topModel.avgScore} avg score`}
            icon="🥇"
            color="#F5C842"
          />
          <StatCard
            label="Total Battles"
            value={formatNumber(totalSessions)}
            subLabel="across all domains"
            icon="⚔️"
            color="#6366F1"
            trend={PLATFORM_STATS.trendTotalSessions}
            trendUp={PLATFORM_STATS.trendTotalSessionsUp}
          />
          <StatCard
            label="Models Ranked"
            value={MOCK_LEADERBOARD.length}
            subLabel="active competitors"
            icon="🤖"
            color="#06B6D4"
          />
          <StatCard
            label="Pearl Win Rate"
            value={`${Math.round(avgPearlWinRate * 100)}%`}
            subLabel="across all domains"
            icon="✦"
            color="#F5C842"
            trend={PLATFORM_STATS.trendPearlWinRate}
            trendUp={PLATFORM_STATS.trendPearlWinRateUp}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted/70 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search models…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-theme-overlay/[0.04] border border-theme-border rounded-xl pl-9 pr-4 py-2 text-sm text-theme-text-secondary placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-border/20"
            />
          </div>

          {/* Domain filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setDomainFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                domainFilter === 'all'
                  ? 'bg-theme-overlay/[0.12] text-theme-text border border-theme-border'
                  : 'text-theme-muted hover:text-theme-text-secondary border border-theme-border/70 hover:border-theme-border'
              }`}
            >
              All Domains
            </button>
            {DOMAINS.map(d => (
              <button
                key={d.id}
                onClick={() => setDomainFilter(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  domainFilter === d.id
                    ? 'text-theme-text border'
                    : 'text-theme-muted hover:text-theme-text-secondary border border-theme-border/70 hover:border-theme-border'
                }`}
                style={domainFilter === d.id ? {
                  backgroundColor: `${d.color}20`,
                  borderColor: `${d.color}40`,
                  color: d.color,
                } : undefined}
              >
                <span>{d.icon}</span>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Table */}
        <Card padding="none" className="overflow-hidden mb-8">
          {/* Table Header */}
          <div className="grid grid-cols-[auto,1fr,repeat(5,auto)] gap-4 px-5 py-3 border-b border-theme-border/70 bg-theme-overlay/[0.02] text-[11px] text-theme-muted/70 font-semibold uppercase tracking-wider">
            <div className="text-center w-8">#</div>
            <div>Model</div>
            {(Object.keys(SORT_LABELS) as SortKey[]).filter(k => k !== 'rank').map(key => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`text-right hover:text-theme-muted transition flex items-center gap-1 justify-end ${sortBy === key ? 'text-theme-text-secondary' : ''}`}
              >
                {SORT_LABELS[key]}
                {sortBy === key && <span>{ascending ? '↑' : '↓'}</span>}
              </button>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-theme-border/50">
            {entries.map((entry) => {
              const isPearl = entry.modelId === 'pearl'

              return (
                <div
                  key={entry.modelId}
                  className={`grid grid-cols-[auto,1fr,repeat(5,auto)] gap-4 px-5 py-4 items-center transition-colors hover:bg-theme-overlay/[0.02] ${
                    isPearl ? 'bg-pearl/[0.03]' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {entry.displayRank <= 3 ? (
                      <span className="text-lg">{['🥇', '🥈', '🥉'][entry.displayRank - 1]}</span>
                    ) : (
                      <span className="text-sm font-mono text-theme-muted">{entry.displayRank}</span>
                    )}
                  </div>

                  {/* Model info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        backgroundColor: `${entry.color}20`,
                        color: entry.color,
                        border: `1px solid ${entry.color}35`,
                      }}
                    >
                      {isPearl ? '✦' : entry.modelName.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-semibold truncate ${isPearl ? 'text-pearl/90' : 'text-theme-text-secondary'}`}>
                        {entry.modelName}
                        {isPearl && <span className="ml-2 text-[10px] text-pearl/50">Hybrid Intelligence</span>}
                      </div>
                      <div className="text-[11px] text-theme-muted/70">{entry.provider}</div>
                    </div>
                    {/* Trend */}
                    <span
                      className="text-[11px] font-medium ml-1"
                      style={{ color: trendColor(entry.trend) }}
                    >
                      {trendIcon(entry.trend)}{Math.abs(entry.trendValue) > 0 ? Math.abs(entry.trendValue) : ''}
                    </span>
                  </div>

                  {/* Avg Score */}
                  <div className="text-right">
                    <div
                      className="text-sm font-bold font-mono"
                      style={{ color: scoreColor(entry.avgScore) }}
                    >
                      {entry.avgScore.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-theme-muted/50">/ 10.0</div>
                  </div>

                  {/* Win Rate */}
                  <div className="text-right">
                    <div
                      className="text-sm font-bold"
                      style={{ color: winRateColor(entry.winRate) }}
                    >
                      {Math.round(entry.winRate * 100)}%
                    </div>
                    <div className="text-[10px] text-theme-muted/50">{entry.wins} wins</div>
                  </div>

                  {/* Sessions */}
                  <div className="text-right">
                    <div className="text-sm font-semibold text-theme-text-secondary">
                      {formatNumber(entry.totalSessions)}
                    </div>
                    <div className="text-[10px] text-theme-muted/50">sessions</div>
                  </div>

                  {/* Accuracy */}
                  <div className="text-right">
                    <div
                      className="text-sm font-mono"
                      style={{ color: scoreColor(entry.avgAccuracy) }}
                    >
                      {entry.avgAccuracy.toFixed(1)}
                    </div>
                  </div>

                  {/* Safety */}
                  <div className="text-right">
                    <div
                      className="text-sm font-mono"
                      style={{ color: scoreColor(entry.avgSafety) }}
                    >
                      {entry.avgSafety.toFixed(1)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Domain Breakdown */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-theme-text mb-4">Domain Champions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {DOMAINS.map(domain => {
              const domainEntries = [...MOCK_LEADERBOARD]
                .map(e => ({
                  ...e,
                  domainScore: e.domainScores[domain.id]?.avgScore ?? 0,
                }))
                .sort((a, b) => b.domainScore - a.domainScore)
              const champion = domainEntries[0]

              return (
                <button
                  key={domain.id}
                  onClick={() => setDomainFilter(domain.id)}
                  className={`rounded-xl border p-4 text-left transition hover:scale-[1.02] ${
                    domainFilter === domain.id
                      ? 'border-theme-border bg-theme-overlay/[0.06]'
                      : 'border-theme-border/70 bg-theme-overlay/[0.02] hover:bg-theme-overlay/[0.05]'
                  }`}
                  style={domainFilter === domain.id ? {
                    borderColor: `${domain.color}40`,
                    backgroundColor: `${domain.color}10`,
                  } : undefined}
                >
                  <div className="text-2xl mb-2">{domain.icon}</div>
                  <div className="text-xs font-semibold text-theme-text-secondary mb-1">{domain.label}</div>
                  <div className="text-[11px] text-theme-muted/70 mb-3">{domain.expert}</div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: `${champion.color}20`, color: champion.color, border: `1px solid ${champion.color}35` }}
                  >
                    {champion.modelId === 'pearl' ? '✦' : champion.modelName.slice(0, 2)}
                  </div>
                  <div className="text-[11px] text-theme-muted mt-1 font-medium truncate">{champion.modelName}</div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: scoreColor(champion.domainScore) }}>
                    {champion.domainScore.toFixed(1)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8 border-t border-theme-border/70">
          <p className="text-theme-muted/70 text-sm mb-4">
            Rankings update as battles complete. Run your own comparison to contribute.
          </p>
          <Link
            to="/arena"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-black text-sm transition hover:scale-[1.02] hover:shadow-lg hover:shadow-pearl/20"
            style={{ background: 'linear-gradient(135deg, #F5C842 0%, #E8A817 100%)' }}
          >
            <span>⚡</span> Run a Battle
          </Link>
        </div>
      </main>
    </div>
  )
}
