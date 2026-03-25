import { useState } from 'react'
import { DOMAINS, MODELS, PEARL_MODEL } from '@/lib/constants'
import { MOCK_BENCHMARKS, MOCK_LEADERBOARD } from '@/lib/mock-data'
import { scoreColor, difficultyColor, formatNumber } from '@/lib/utils'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const ALL_MODELS = [...MODELS, PEARL_MODEL]

export function BenchmarksPage() {
  const [activeSuite, setActiveSuite] = useState(MOCK_BENCHMARKS[0].id)
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  const suite = MOCK_BENCHMARKS.find(b => b.id === activeSuite)!
  const domain = DOMAINS.find(d => d.id === suite.domain)

  const filteredQuestions = suite.questions.filter(q =>
    difficultyFilter === 'all' || q.difficulty === difficultyFilter
  )

  const topModels = MOCK_LEADERBOARD
    .filter(e => e.domainScores[suite.domain])
    .sort((a, b) => (b.domainScores[suite.domain]?.avgScore ?? 0) - (a.domainScores[suite.domain]?.avgScore ?? 0))
    .slice(0, 5)

  const totalSessions = MOCK_BENCHMARKS.reduce((s, b) => s + b.totalSessions, 0)
  const totalQuestions = MOCK_BENCHMARKS.reduce((s, b) => s + b.questionCount, 0)

  return (
    <div className="min-h-screen bg-theme-bg">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <h1 className="text-3xl font-bold text-theme-text tracking-tight">Benchmarks</h1>
            <Badge color="#8B5CF6" size="sm">Curated</Badge>
          </div>
          <p className="text-theme-muted text-sm max-w-xl">
            Curated professional question suites vetted by licensed experts. Each question is carefully selected
            for difficulty, real-world relevance, and potential for model differentiation.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Question Suites" value={MOCK_BENCHMARKS.length} subLabel="professional domains" icon="📋" color="#8B5CF6" />
          <StatCard label="Total Questions" value={totalQuestions} subLabel="expert-verified" icon="❓" color="#6366F1" />
          <StatCard label="Total Runs" value={formatNumber(totalSessions)} subLabel="across all suites" icon="🏃" color="#06B6D4" />
          <StatCard label="Avg Difficulty" value="Medium" subLabel="across all suites" icon="⚡" color="#F59E0B" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Suite Selector Sidebar */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-theme-muted/70 uppercase tracking-wider mb-3">
              Question Suites
            </div>
            {MOCK_BENCHMARKS.map(bench => {
              const d = DOMAINS.find(dom => dom.id === bench.domain)
              const isActive = activeSuite === bench.id
              return (
                <button
                  key={bench.id}
                  onClick={() => setActiveSuite(bench.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
                    isActive
                      ? 'border-theme-border bg-theme-overlay/[0.07] shadow-md shadow-black/30'
                      : 'border-theme-border/70 bg-theme-overlay/[0.02] hover:bg-theme-overlay/[0.05] hover:border-theme-border'
                  }`}
                  style={isActive && d ? { borderColor: `${d.color}35`, backgroundColor: `${d.color}0f` } : undefined}
                >
                  <span className="text-2xl">{d?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${isActive ? 'text-theme-text' : 'text-theme-text-secondary'}`}>
                      {d?.label}
                    </div>
                    <div className="text-[11px] text-theme-muted/70">{bench.questionCount} questions</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-theme-muted/50">{formatNumber(bench.totalSessions)}</div>
                    <div className="text-[10px] text-theme-muted/30">runs</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Suite Detail */}
          <div className="space-y-5">
            {/* Suite Header */}
            <Card padding="lg">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ backgroundColor: `${domain?.color}15`, border: `1px solid ${domain?.color}25` }}
                >
                  {domain?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-theme-text">{suite.name}</h2>
                  <p className="text-sm text-theme-muted mt-1">{suite.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <Badge color={domain?.color ?? '#6366F1'} size="sm">{suite.questionCount} Questions</Badge>
                    <Badge color="#06B6D4" size="sm">{formatNumber(suite.totalSessions)} Runs</Badge>
                    <Badge color="#10B981" size="sm">Expert Verified</Badge>
                  </div>
                </div>
              </div>

              {/* Top models for this domain */}
              <div className="mt-5 pt-5 border-t border-theme-border/70">
                <div className="text-xs font-semibold text-theme-muted/70 uppercase tracking-wider mb-3">Top Performers</div>
                <div className="flex flex-wrap gap-3">
                  {topModels.map((m, i) => (
                    <div key={m.modelId} className="flex items-center gap-2">
                      <span className="text-sm">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold"
                        style={{ backgroundColor: `${m.color}20`, color: m.color, border: `1px solid ${m.color}35` }}
                      >
                        {m.modelId === 'pearl' ? '✦' : m.modelName.slice(0, 2)}
                      </div>
                      <span className="text-xs text-theme-muted">{m.modelName}</span>
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{ color: scoreColor(m.domainScores[suite.domain]?.avgScore ?? 0) }}
                      >
                        {(m.domainScores[suite.domain]?.avgScore ?? 0).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Question List */}
            <Card padding="none" className="overflow-hidden">
              {/* Filter bar */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-theme-border/70 bg-theme-overlay/[0.02]">
                <span className="text-xs text-theme-muted/70 font-medium">Difficulty:</span>
                {['all', 'easy', 'medium', 'hard', 'expert'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(d)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium transition ${
                      difficultyFilter === d
                        ? 'bg-theme-overlay/[0.10] text-theme-text'
                        : 'text-theme-muted/70 hover:text-theme-muted'
                    }`}
                    style={difficultyFilter === d && d !== 'all' ? { color: difficultyColor(d) } : undefined}
                  >
                    {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
                <span className="ml-auto text-[11px] text-theme-muted/50">{filteredQuestions.length} questions</span>
              </div>

              <div className="divide-y divide-theme-border/50">
                {filteredQuestions.map((q, i) => (
                  <div key={q.id} className="px-5 py-4 hover:bg-theme-overlay/[0.02] transition">
                    <div className="flex items-start gap-4">
                      <span className="text-xs font-mono text-theme-muted/50 mt-1 w-6 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                            style={{
                              color: difficultyColor(q.difficulty),
                              backgroundColor: `${difficultyColor(q.difficulty)}15`,
                            }}
                          >
                            {q.difficulty}
                          </span>
                          <span className="text-[10px] text-theme-muted/50">{q.sessionCount} runs</span>
                        </div>
                        <p className="text-[13px] text-theme-text-secondary leading-snug">{q.question}</p>
                        {q.expertNote && (
                          <p className="text-[11px] text-theme-muted/70 italic mt-1.5">
                            Expert note: "{q.expertNote}"
                          </p>
                        )}
                        {/* Mini score bars */}
                        {q.avgScores && (
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {Object.entries(q.avgScores).slice(0, 4).map(([modelId, score]) => {
                              const model = ALL_MODELS.find(m => m.id === modelId)
                              if (!model) return null
                              return (
                                <div key={modelId} className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-theme-muted/70">{model.id === 'pearl' ? 'Pearl' : model.name.split(' ')[0]}</span>
                                  <span className="text-[10px] font-mono font-semibold" style={{ color: scoreColor(score) }}>
                                    {(score as number).toFixed(1)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Methodology */}
        <Card padding="lg" className="mt-8">
          <div className="flex items-start gap-4">
            <div className="text-3xl shrink-0">🔬</div>
            <div>
              <h3 className="text-base font-semibold text-theme-text mb-2">Benchmark Methodology</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-theme-muted leading-relaxed">
                <div>
                  <div className="text-theme-text-secondary font-medium mb-1.5">Question Selection</div>
                  <p>Questions are curated by licensed professionals in each domain. They're selected for real-world relevance, differentiation potential, and coverage of common errors AI models make. No public benchmark datasets are used — every question is original or drawn from real user queries.</p>
                </div>
                <div>
                  <div className="text-theme-text-secondary font-medium mb-1.5">Scoring Process</div>
                  <p>Each response is scored by a domain expert on 5 dimensions: Accuracy (35%), Completeness (25%), Safety (20%), Clarity (10%), and Trustworthiness (10%). The weighted composite is the "Expert Score" shown in rankings.</p>
                </div>
                <div>
                  <div className="text-theme-text-secondary font-medium mb-1.5">Preventing Gaming</div>
                  <p>Questions are never pre-published. Models cannot be "tuned" to known benchmark questions because the questions don't exist until a user asks them. This ensures benchmark integrity and prevents the dataset contamination that plagues public leaderboards.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
