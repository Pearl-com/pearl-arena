import { Link } from 'react-router-dom'
import { DOMAINS } from '@/lib/constants'
import { MOCK_LEADERBOARD, PLATFORM_STATS } from '@/lib/mock-data'
import { scoreColor, formatNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

const HOW_IT_WORKS = [
  { step: 1, icon: '🎯', title: 'Pick your domain', desc: 'Select from Legal, Healthcare, Veterinary, Automotive, Financial, or Technical — each with its own expert pool.' },
  { step: 2, icon: '🤖', title: 'Choose challengers', desc: 'Select up to 4 models: GPT-4o, Claude, Gemini, DeepSeek, Llama, Grok, or Qwen. Pearl AI always competes.' },
  { step: 3, icon: '❓', title: 'Ask your question', desc: 'Type any professional question. Use our curated examples or submit your own — every question is original.' },
  { step: 4, icon: '⚡', title: 'Watch the arena', desc: 'All models answer simultaneously with live streaming. See responses arrive side-by-side in real time.' },
  { step: 5, icon: '⚖️', title: 'Expert judgment', desc: 'A licensed professional reviews all responses and scores them on accuracy, safety, completeness, clarity, and trustworthiness.' },
  { step: 6, icon: '🏆', title: 'See the results', desc: 'Animated score reveal with expert reasoning. Results feed into the public leaderboard and analytics.' },
]

const DOMAINS_DISPLAY = DOMAINS.map(d => ({
  ...d,
  fact: {
    legal: '3 bar examinations required for our legal experts',
    healthcare: 'Board-certified MDs & DOs across 12 specialties',
    veterinary: 'DVMs with emergency & small animal specializations',
    automotive: 'ASE Master Technicians with 10+ years experience',
    financial: 'CPAs, CFPs & CFAs with fiduciary standards',
    technical: 'Senior engineers from FAANG & leading tech companies',
  }[d.id] ?? '',
}))

export function HomePage() {
  const topModels = MOCK_LEADERBOARD.slice(0, 4)

  return (
    <div className="min-h-screen bg-theme-bg">
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-pearl/[0.06] to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center relative">
          <Badge color="#F5C842" size="md" dot pulse className="mb-6">Expert Judges Online · Live Arena</Badge>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[1.0]">
            <span className="bg-gradient-to-b from-theme-text to-theme-text/60 bg-clip-text text-transparent">
              The benchmark<br />you can't game.
            </span>
          </h1>

          <p className="text-theme-muted max-w-2xl mx-auto text-lg leading-relaxed mb-8">
            Pearl Arena is the only AI benchmark where real licensed professionals judge every response.
            No popularity contests. No public datasets. No optimization targets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/arena"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-black text-lg transition hover:scale-[1.03] hover:shadow-2xl hover:shadow-pearl/20"
              style={{ background: 'linear-gradient(135deg, #F5C842 0%, #E8A817 100%)' }}
            >
              <span>⚡</span> Start the Arena
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-theme-text-secondary text-lg border border-theme-border hover:bg-theme-overlay/[0.06] hover:border-theme-border transition"
            >
              <span>🏆</span> View Leaderboard
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: formatNumber(PLATFORM_STATS.totalSessions), label: 'Battles Completed', icon: '⚔️' },
              { value: `${formatNumber(PLATFORM_STATS.totalExperts)}+`, label: 'Licensed Experts', icon: '👩‍⚕️' },
              { value: PLATFORM_STATS.modelsTracked.toString(), label: 'AI Models Ranked', icon: '🤖' },
              { value: `${PLATFORM_STATS.pearlWinRate}%`, label: 'Pearl Win Rate', icon: '✦' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-theme-border/80 bg-theme-overlay/[0.03] p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xl font-bold text-theme-text">{stat.value}</div>
                <div className="text-xs text-theme-muted/70 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Current Leaders ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-theme-border/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-theme-text">Current Rankings</h2>
            <p className="text-theme-muted/70 text-sm mt-1">Top models by expert-judged score · updated continuously</p>
          </div>
          <Link to="/leaderboard" className="text-sm text-theme-muted hover:text-theme-text-secondary transition border border-theme-border hover:border-theme-border px-4 py-2 rounded-xl">
            Full Leaderboard →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topModels.map((model, i) => (
            <Card key={model.modelId} hover padding="md"
              glow={i === 0}
              glowColor={model.color}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{['🥇','🥈','🥉','4️⃣'][i]}</span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${model.color}20`, color: model.color, border: `1px solid ${model.color}35` }}
                >
                  {model.modelId === 'pearl' ? '✦' : model.modelName.slice(0, 2)}
                </div>
              </div>
              <div className={`text-base font-bold mb-0.5 ${model.modelId === 'pearl' ? 'text-pearl/90' : 'text-theme-text-secondary'}`}>
                {model.modelName}
              </div>
              <div className="text-xs text-theme-muted/70 mb-3">{model.provider}</div>
              <div className="flex items-end justify-between">
                <div>
                  <div
                    className="text-2xl font-black font-mono"
                    style={{ color: scoreColor(model.avgScore) }}
                  >
                    {model.avgScore.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-theme-muted/70">avg score</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-theme-text-secondary">{Math.round(model.winRate * 100)}%</div>
                  <div className="text-[10px] text-theme-muted/70">win rate</div>
                </div>
              </div>
              <div className="mt-3 h-1 rounded-full bg-theme-overlay/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${model.avgScore * 10}%`, backgroundColor: model.color, opacity: 0.7 }}
                />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-theme-border/60">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-theme-text mb-3">How Pearl Arena works</h2>
          <p className="text-theme-muted max-w-lg mx-auto">
            A 6-step process from question to expert verdict
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map(step => (
            <div key={step.step} className="relative p-5 rounded-2xl border border-theme-border/70 bg-theme-overlay/[0.02] hover:bg-theme-overlay/[0.04] transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-theme-overlay/[0.08] border border-theme-border flex items-center justify-center text-[12px] font-bold text-theme-muted">
                  {step.step}
                </div>
                <span className="text-2xl">{step.icon}</span>
              </div>
              <h3 className="text-sm font-semibold text-theme-text-secondary mb-1">{step.title}</h3>
              <p className="text-xs text-theme-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Domains ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-theme-border/60">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-theme-text mb-3">6 Professional Domains</h2>
          <p className="text-theme-muted max-w-lg mx-auto">
            Each domain has a dedicated pool of licensed experts who review and score AI responses
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DOMAINS_DISPLAY.map(domain => (
            <Link
              key={domain.id}
              to={`/arena`}
              className="relative group p-5 rounded-2xl border border-theme-border/70 bg-theme-overlay/[0.02] hover:bg-theme-overlay/[0.05] hover:border-theme-border transition overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${domain.accent} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{domain.icon}</span>
                  <div>
                    <div className="font-semibold text-theme-text-secondary">{domain.label}</div>
                    <div className="text-[11px] text-theme-muted/70">{domain.expert}</div>
                  </div>
                </div>
                <p className="text-xs text-theme-muted leading-relaxed">{domain.fact}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-theme-border/60 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-5">✦</div>
          <h2 className="text-3xl font-bold text-theme-text mb-4">
            Ready to see who gets it right?
          </h2>
          <p className="text-theme-muted mb-8">
            Ask a real professional question. Watch top AI models compete.
            Get an expert verdict in seconds.
          </p>
          <Link
            to="/arena"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-black text-lg transition hover:scale-[1.03] hover:shadow-2xl hover:shadow-pearl/20"
            style={{ background: 'linear-gradient(135deg, #F5C842 0%, #E8A817 100%)' }}
          >
            <span>⚡</span> Enter the Arena
          </Link>
        </div>
      </section>
    </div>
  )
}
