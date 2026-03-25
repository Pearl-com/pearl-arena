import { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { DOMAINS, MODELS, PEARL_MODEL } from '@/lib/constants'
import type { DomainId } from '@/lib/constants'
import {
  generateTrendData, generateSessionsByDomain, generateDailySessionCounts, MOCK_LEADERBOARD, PLATFORM_STATS
} from '@/lib/mock-data'
import { scoreColor, formatNumber } from '@/lib/utils'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const ALL_MODELS_LIST = [...MODELS, PEARL_MODEL]
const TREND_DATA = generateTrendData(30)
const DOMAIN_STATS = generateSessionsByDomain()
const DAILY_SESSIONS = generateDailySessionCounts(30)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-theme-card border border-theme-border rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <div className="text-theme-muted mb-2 font-medium">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-theme-muted">{p.name}:</span>
          <span className="text-theme-text font-semibold">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30)
  const [visibleModels, setVisibleModels] = useState<Set<string>>(
    new Set(['pearl', 'gpt4o', 'claude', 'gemini'])
  )
  const [_domainView, _setDomainView] = useState<DomainId | 'all'>('all')

  const toggleModel = (id: string) => {
    setVisibleModels(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Slice data based on time range
  const trendDataSliced = TREND_DATA.map(t => ({
    ...t,
    data: t.data.slice(-timeRange),
  }))

  // Build chart-ready format for line chart
  const lineChartData = useMemo(() => {
    const dates = trendDataSliced[0]?.data.map(d => d.date) ?? []
    return dates.map((date, i) => {
      const row: Record<string, any> = { date }
      trendDataSliced.forEach(t => {
        row[t.modelId] = t.data[i]?.score
      })
      return row
    })
  }, [trendDataSliced])

  // Daily sessions slice
  const dailySliced = DAILY_SESSIONS.slice(-timeRange)

  // Win rate bar data
  const winRateData = MOCK_LEADERBOARD.slice(0, 8).map(e => ({
    name: e.modelName.length > 10 ? e.modelName.slice(0, 9) + '…' : e.modelName,
    fullName: e.modelName,
    winRate: Math.round(e.winRate * 100),
    color: e.color,
  }))

  // Radar chart — per model across domains
  const radarModel = MOCK_LEADERBOARD[0] // Pearl AI
  const radarData = DOMAINS.map(d => ({
    domain: d.label,
    score: Math.round((radarModel.domainScores[d.id]?.avgScore ?? 0) * 10) / 10,
    fullMark: 10,
  }))

  // Domain session pie data
  const domainBarData = DOMAIN_STATS.map(ds => {
    const domain = DOMAINS.find(d => d.id === ds.domain)
    return {
      name: domain?.label ?? ds.domain,
      sessions: ds.totalSessions,
      avgScore: ds.avgScore,
      color: domain?.color ?? '#6366F1',
    }
  })

  // Sub-score breakdown
  const scoreBreakdownData = MOCK_LEADERBOARD.slice(0, 6).map(e => ({
    name: e.modelName.length > 10 ? e.modelName.slice(0, 9) + '…' : e.modelName,
    Accuracy: e.avgAccuracy,
    Safety: e.avgSafety,
    Completeness: e.avgCompleteness,
    Clarity: e.avgClarity,
    Trustworthiness: e.avgTrustworthiness,
  }))

  const totalSessions = DAILY_SESSIONS.reduce((s, d) => s + d.sessions, 0)
  const avgDaily = Math.round(totalSessions / DAILY_SESSIONS.length)

  return (
    <div className="min-h-screen bg-theme-bg">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📈</span>
            <h1 className="text-3xl font-bold text-theme-text tracking-tight">Analytics</h1>
            <Badge color="#6366F1" size="sm">Last {timeRange} days</Badge>
          </div>
          <p className="text-theme-muted text-sm">Deep performance insights across all models, domains, and sessions.</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 mb-8">
          {([7, 14, 30] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                timeRange === range
                  ? 'bg-theme-overlay/[0.10] text-theme-text border border-theme-border'
                  : 'text-theme-muted hover:text-theme-text-secondary border border-theme-border/70'
              }`}
            >
              {range}d
            </button>
          ))}
          <div className="h-4 w-px bg-theme-overlay/10 mx-2" />
          <span className="text-xs text-theme-muted/70">Last updated: just now</span>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Sessions"
            value={formatNumber(totalSessions)}
            subLabel={`~${avgDaily}/day avg`}
            icon="⚔️"
            color="#6366F1"
            trend={PLATFORM_STATS.trendTotalSessions}
            trendUp={PLATFORM_STATS.trendTotalSessionsUp}
          />
          <StatCard
            label="Avg Expert Score"
            value={PLATFORM_STATS.avgExpertScore.toFixed(1)}
            subLabel="across all models"
            icon="⭐"
            color="#F5C842"
            trend={PLATFORM_STATS.trendAvgExpertScore}
            trendUp={PLATFORM_STATS.trendAvgExpertScoreUp}
          />
          <StatCard
            label="Questions Judged"
            value={formatNumber(PLATFORM_STATS.questionsAnswered)}
            subLabel="unique prompts"
            icon="❓"
            color="#06B6D4"
          />
          <StatCard
            label="Expert Reviews"
            value={formatNumber(PLATFORM_STATS.expertReviewsCompleted)}
            subLabel="completed"
            icon="✅"
            color="#10B981"
            trend={PLATFORM_STATS.trendExpertReviews}
            trendUp={PLATFORM_STATS.trendExpertReviewsUp}
          />
        </div>

        {/* Score Trends Chart */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-theme-text">Model Score Trends</h2>
              <p className="text-xs text-theme-muted/70 mt-0.5">Expert-judged overall scores over time</p>
            </div>
            {/* Model toggles */}
            <div className="flex flex-wrap gap-2">
              {ALL_MODELS_LIST.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleModel(m.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                    visibleModels.has(m.id)
                      ? 'border-theme-border bg-theme-overlay/[0.06]'
                      : 'border-theme-border/50 bg-transparent opacity-40'
                  }`}
                  style={visibleModels.has(m.id) ? { borderColor: `${m.color}40`, color: m.color } : undefined}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.id === 'pearl' ? 'Pearl AI' : m.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[5, 10]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {ALL_MODELS_LIST.filter(m => visibleModels.has(m.id)).map(m => (
                <Line
                  key={m.id}
                  type="monotone"
                  dataKey={m.id}
                  name={m.id === 'pearl' ? 'Pearl AI' : m.name}
                  stroke={m.color}
                  strokeWidth={m.id === 'pearl' ? 2.5 : 1.5}
                  dot={false}
                  strokeDasharray={m.id === 'pearl' ? undefined : undefined}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 2-col charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Sessions */}
          <Card padding="lg">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-theme-text">Daily Arena Activity</h2>
              <p className="text-xs text-theme-muted/70 mt-0.5">Sessions and unique questions per day</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailySliced} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false}
                  interval={timeRange === 7 ? 0 : timeRange === 14 ? 1 : 4}
                />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" name="Sessions" fill="#6366F1" radius={[3,3,0,0]} fillOpacity={0.8} />
                <Bar dataKey="uniqueQuestions" name="Unique Questions" fill="#8B5CF6" radius={[3,3,0,0]} fillOpacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Win Rate Bar */}
          <Card padding="lg">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-theme-text">Win Rate by Model</h2>
              <p className="text-xs text-theme-muted/70 mt-0.5">% of battles where model scored highest</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={winRateData} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" domain={[0, 50]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.50)', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} formatter={(v: any) => `${v}%`} />
                <Bar dataKey="winRate" name="Win Rate" radius={[0, 4, 4, 0]}>
                  {winRateData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Domain Distribution */}
          <Card padding="lg">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-theme-text">Sessions by Domain</h2>
              <p className="text-xs text-theme-muted/70 mt-0.5">Battle volume across professional domains</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={domainBarData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" name="Sessions" radius={[4,4,0,0]}>
                  {domainBarData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} fillOpacity={0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pearl AI Domain Radar */}
          <Card padding="lg">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-theme-text">Pearl AI Domain Mastery</h2>
              <p className="text-xs text-theme-muted/70 mt-0.5">Average expert score across all 6 domains</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="domain" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
                <Radar name="Pearl AI" dataKey="score" stroke="#F5C842" fill="#F5C842" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Score Breakdown Stacked Bar */}
        <Card padding="lg" className="mb-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-theme-text">Scoring Dimension Breakdown</h2>
            <p className="text-xs text-theme-muted/70 mt-0.5">Accuracy, Safety, Completeness, Clarity, Trustworthiness — averaged per model</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={scoreBreakdownData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, paddingTop: 12 }} />
              <Bar dataKey="Accuracy" fill="#6366F1" stackId="a" radius={[0,0,0,0]} />
              <Bar dataKey="Safety" fill="#10B981" stackId="a" />
              <Bar dataKey="Completeness" fill="#06B6D4" stackId="a" />
              <Bar dataKey="Clarity" fill="#F59E0B" stackId="a" />
              <Bar dataKey="Trustworthiness" fill="#8B5CF6" stackId="a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Domain Score Summary Table */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-theme-border/70">
            <h2 className="text-base font-semibold text-theme-text">Domain Score Matrix</h2>
            <p className="text-xs text-theme-muted/70 mt-0.5">Average expert scores by model and domain</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-theme-border/70 bg-theme-overlay/[0.02]">
                  <th className="text-left px-5 py-3 text-theme-muted/70 font-semibold uppercase tracking-wider">Model</th>
                  {DOMAINS.map(d => (
                    <th key={d.id} className="text-center px-4 py-3 text-theme-muted/70 font-semibold">
                      <span className="mr-1">{d.icon}</span>{d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border/50">
                {MOCK_LEADERBOARD.map(entry => (
                  <tr key={entry.modelId} className={`hover:bg-theme-overlay/[0.02] transition ${entry.modelId === 'pearl' ? 'bg-pearl/[0.03]' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold"
                          style={{ backgroundColor: `${entry.color}20`, color: entry.color, border: `1px solid ${entry.color}35` }}
                        >
                          {entry.modelId === 'pearl' ? '✦' : entry.modelName.slice(0, 2)}
                        </div>
                        <span className={`font-medium ${entry.modelId === 'pearl' ? 'text-pearl/90' : 'text-theme-text-secondary'}`}>
                          {entry.modelName}
                        </span>
                      </div>
                    </td>
                    {DOMAINS.map(d => {
                      const ds = entry.domainScores[d.id]
                      const score = ds?.avgScore ?? 0
                      return (
                        <td key={d.id} className="text-center px-4 py-3">
                          <span className="font-mono font-semibold" style={{ color: scoreColor(score) }}>
                            {score.toFixed(1)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
