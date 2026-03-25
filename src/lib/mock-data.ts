/**
 * @file mock-data.ts
 * @description ALL scores, metrics, leaderboard entries, history, benchmarks, and platform
 * statistics used throughout the Pearl Arena UI are defined here as MOCK / DEMO DATA.
 *
 * ⚠️  THIS IS PLACEHOLDER DATA FOR DEMO PURPOSES ONLY ⚠️
 *
 * Before deploying to production you will need to replace every export in this
 * file with calls to your own persistent data store (e.g. a database, an API
 * endpoint, or a real-time analytics service).  The shape of each export is
 * documented alongside its definition so you know exactly what schema to match.
 *
 * Key exports and where they are consumed:
 *   • PLATFORM_STATS       → HomePage (hero stats), AnalyticsPage (overview cards)
 *   • MOCK_LEADERBOARD     → LeaderboardPage, HomePage (top-4 rankings), AnalyticsPage
 *   • MOCK_HISTORY         → HistoryPage
 *   • MOCK_BENCHMARKS      → BenchmarksPage
 *   • generateTrendData()  → AnalyticsPage (score-over-time line chart)
 *   • generateSessionsByDomain() → AnalyticsPage (domain bar chart)
 *   • generateDailySessionCounts() → AnalyticsPage (daily activity chart)
 */

import type { LeaderboardEntry, HistoryItem, BenchmarkSuite, ModelTrend, DomainStats } from './types'
import type { DomainId } from './constants'
import { MODELS, PEARL_MODEL } from './constants'
import { subDays, format } from 'date-fns'

// ─── Seeded Random ────────────────────────────────────────────────────────

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 4294967296
  }
}

// ─── Leaderboard Mock Data ────────────────────────────────────────────────

const ALL_MODELS = [...MODELS, PEARL_MODEL]

const BASE_SCORES: Record<string, number> = {
  pearl: 8.6,
  // OpenAI
  gpt54: 8.4, gpt54mini: 8.0, gpt41: 8.1, gpt4o: 7.9, o3: 8.3, o4mini: 8.0,
  // Anthropic
  'claude-opus': 8.5, claude: 8.2, 'claude-haiku': 7.6,
  // Google
  gemini25pro: 8.0, gemini25flash: 7.7, gemini20flash: 7.4,
  // Perplexity
  'sonar-pro': 7.8, 'sonar-reasoning': 7.9,
  // DeepSeek
  deepseek: 7.5, 'deepseek-r1': 7.8,
  // xAI
  grok: 7.3, 'grok-mini': 7.0,
  // Meta via Groq
  llama: 7.2, llama33: 7.1,
  // Mistral
  'mistral-large': 7.6, magistral: 7.5,
  // Cohere
  'command-a': 7.4,
}

const WIN_RATES: Record<string, number> = {
  pearl: 0.38,
  gpt54: 0.22, gpt54mini: 0.14, gpt41: 0.16, gpt4o: 0.13, o3: 0.20, o4mini: 0.15,
  'claude-opus': 0.24, claude: 0.18, 'claude-haiku': 0.08,
  gemini25pro: 0.15, gemini25flash: 0.10, gemini20flash: 0.07,
  'sonar-pro': 0.11, 'sonar-reasoning': 0.13,
  deepseek: 0.09, 'deepseek-r1': 0.12,
  grok: 0.08, 'grok-mini': 0.05,
  llama: 0.07, llama33: 0.06,
  'mistral-large': 0.09, magistral: 0.08,
  'command-a': 0.07,
}

const DOMAIN_STRENGTHS: Record<string, DomainId[]> = {
  pearl: ['legal', 'healthcare', 'veterinary', 'automotive', 'financial', 'technical'],
  gpt54: ['technical', 'financial', 'legal', 'healthcare'],
  gpt54mini: ['technical', 'financial'],
  gpt41: ['technical', 'financial', 'legal'],
  gpt4o: ['technical', 'financial'],
  o3: ['technical', 'financial', 'legal'],
  o4mini: ['technical'],
  'claude-opus': ['healthcare', 'legal', 'financial', 'technical'],
  claude: ['healthcare', 'legal', 'financial'],
  'claude-haiku': ['technical'],
  gemini25pro: ['technical', 'healthcare'],
  gemini25flash: ['technical'],
  gemini20flash: ['technical'],
  'sonar-pro': ['financial', 'legal', 'healthcare'],
  'sonar-reasoning': ['technical', 'financial'],
  deepseek: ['technical', 'financial'],
  'deepseek-r1': ['technical'],
  grok: ['financial', 'technical'],
  'grok-mini': ['technical'],
  llama: ['technical'],
  llama33: ['technical'],
  'mistral-large': ['technical', 'financial'],
  magistral: ['technical'],
  'command-a': ['technical', 'financial'],
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = ALL_MODELS.map((model, i) => {
  const rand = seededRand(i * 42)
  const baseScore = BASE_SCORES[model.id] ?? 7.0
  const winRate = WIN_RATES[model.id] ?? 0.05
  const sessions = Math.floor(1200 + rand() * 800)

  const domainScores: Partial<Record<DomainId, { avgScore: number; wins: number; sessions: number; winRate: number }>> = {}
  const domains: DomainId[] = ['legal', 'healthcare', 'veterinary', 'automotive', 'financial', 'technical']
  domains.forEach(domain => {
    const isStrong = DOMAIN_STRENGTHS[model.id]?.includes(domain)
    const dSessions = Math.floor(100 + rand() * 200)
    const dScore = baseScore + (isStrong ? rand() * 0.6 : -rand() * 0.8)
    const dWinRate = winRate * (isStrong ? 1.4 : 0.7)
    domainScores[domain] = {
      avgScore: Math.round(Math.min(10, Math.max(1, dScore)) * 10) / 10,
      wins: Math.floor(dSessions * dWinRate),
      sessions: dSessions,
      winRate: Math.round(dWinRate * 100) / 100,
    }
  })

  return {
    modelId: model.id as any,
    modelName: model.name,
    provider: model.provider,
    color: model.color,
    rank: i + 1,
    totalSessions: sessions,
    wins: Math.floor(sessions * winRate),
    winRate: Math.round(winRate * 100) / 100,
    avgScore: Math.round(baseScore * 10) / 10,
    avgAccuracy: Math.round((baseScore + (rand() - 0.5) * 0.6) * 10) / 10,
    avgSafety: Math.round((baseScore + (rand() - 0.3) * 0.5) * 10) / 10,
    avgCompleteness: Math.round((baseScore - rand() * 0.4) * 10) / 10,
    avgClarity: Math.round((baseScore + rand() * 0.3) * 10) / 10,
    avgTrustworthiness: Math.round((baseScore + (rand() - 0.4) * 0.5) * 10) / 10,
    domainScores,
    trend: (rand() > 0.6 ? 'up' : rand() > 0.3 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
    trendValue: Math.floor((rand() - 0.5) * 6),
    lastUpdated: new Date(),
  }
}).sort((a, b) => b.avgScore - a.avgScore).map((e, i) => ({ ...e, rank: i + 1 }))

// ─── Analytics Mock Data ──────────────────────────────────────────────────

export function generateTrendData(days = 30): ModelTrend[] {
  return [...MODELS, PEARL_MODEL].map((model, mi) => {
    const rand = seededRand(mi * 13)
    const base = BASE_SCORES[model.id] ?? 7.0
    let score = base - rand() * 0.5
    return {
      modelId: model.id,
      modelName: model.name,
      color: model.color,
      data: Array.from({ length: days }, (_, i) => {
        score = Math.min(10, Math.max(4, score + (rand() - 0.48) * 0.15))
        return {
          date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
          score: Math.round(score * 100) / 100,
          sessions: Math.floor(20 + rand() * 50),
        }
      }),
    }
  })
}

export function generateSessionsByDomain(): DomainStats[] {
  const domains: DomainId[] = ['legal', 'healthcare', 'veterinary', 'automotive', 'financial', 'technical']
  const rand = seededRand(777)
  return domains.map(domain => ({
    domain,
    totalSessions: Math.floor(300 + rand() * 700),
    avgScore: Math.round((6.5 + rand() * 2) * 10) / 10,
    topModel: ['pearl', 'claude', 'gpt4o'][Math.floor(rand() * 3)],
    mostContested: domains[Math.floor(rand() * domains.length)],
  }))
}

export function generateDailySessionCounts(days = 30): { date: string; sessions: number; uniqueQuestions: number }[] {
  const rand = seededRand(99)
  let base = 80
  return Array.from({ length: days }, (_, i) => {
    base = Math.max(20, base + (rand() - 0.45) * 20)
    return {
      date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
      sessions: Math.floor(base),
      uniqueQuestions: Math.floor(base * 0.7),
    }
  })
}

// ─── History Mock Data ────────────────────────────────────────────────────

const SAMPLE_QUESTIONS: Record<DomainId, string[]> = {
  legal: [
    'Can a landlord increase rent mid-lease?',
    'Is a verbal agreement legally binding for $600?',
    'What constitutes fair use for AI content?',
    "Can my employer enforce a non-compete I didn't sign at hiring?",
  ],
  healthcare: [
    'Warning signs headache needs emergency care?',
    'Can I take ibuprofen with lisinopril?',
    'Colon cancer screening schedule?',
    'Early signs of type 2 diabetes?',
  ],
  veterinary: [
    'Dog ate dark chocolate 2 hours ago — what to do?',
    'Is grain-free food harmful for dogs?',
    'Sudden lethargy in 3-year-old cat?',
    'How often to vet visit for healthy adult dog?',
  ],
  automotive: [
    'Grinding noise when braking — how urgent?',
    'Safe to drive with check engine light?',
    'Transmission fluid change interval 2020 Civic?',
    'Car pulls right while braking — cause?',
  ],
  financial: [
    'Home office deduction for W-2 employee?',
    'Traditional IRA to Roth conversion at 55?',
    'Tax on stock sold under 1 year?',
    'Emergency fund size recommendation?',
  ],
  technical: [
    'Horizontal vs vertical scaling tradeoffs?',
    'Message queue vs direct API calls — when?',
    'SQL injection prevention in Node.js?',
    'REST vs GraphQL tradeoffs?',
  ],
}

const DOMAIN_IDS: DomainId[] = ['legal', 'healthcare', 'veterinary', 'automotive', 'financial', 'technical']
const EXPERT_NAMES = [
  'Dr. Sarah Chen, MD', 'Atty. James Rivera', 'Dr. Emily Walsh, DVM',
  'CPA Robert Kim', 'Michael Torres, ASE', 'Dr. Priya Sharma, MD',
  'Atty. David Park', 'Dr. Lisa Johnson, DVM', 'CFP Amanda Lee',
  'Jesse Martinez, ASE', 'Dr. Kevin Wu, MD', 'Atty. Rachel Gold',
]

export const MOCK_HISTORY: HistoryItem[] = Array.from({ length: 50 }, (_, i) => {
  const rand = seededRand(i * 31 + 7)
  const domain = DOMAIN_IDS[Math.floor(rand() * DOMAIN_IDS.length)]
  const questions = SAMPLE_QUESTIONS[domain]
  const question = questions[Math.floor(rand() * questions.length)]
  const modelCount = 2 + Math.floor(rand() * 3)
  const shuffledModels = [...MODELS].sort(() => rand() - 0.5).slice(0, modelCount)
  const allParticipants = [...shuffledModels.map(m => m.id), 'pearl']
  const winnerIdx = rand() < 0.45 ? allParticipants.length - 1 : Math.floor(rand() * (allParticipants.length - 1))
  const winner = allParticipants[winnerIdx]
  const winnerName = winner === 'pearl' ? 'Pearl AI' : MODELS.find(m => m.id === winner)?.name ?? winner

  return {
    id: `session-${i + 1}`,
    domain,
    question,
    questionPreview: question.length > 60 ? question.slice(0, 57) + '...' : question,
    models: allParticipants,
    winner,
    winnerName,
    topScore: Math.round((7.5 + rand() * 2) * 10) / 10,
    judgedBy: EXPERT_NAMES[Math.floor(rand() * EXPERT_NAMES.length)],
    timestamp: subDays(new Date(), Math.floor(rand() * 30)),
    sessionDuration: Math.floor(30000 + rand() * 90000),
  }
}).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

// ─── Benchmark Mock Data ──────────────────────────────────────────────────

export const MOCK_BENCHMARKS: BenchmarkSuite[] = DOMAIN_IDS.map((domain, i) => {
  const rand = seededRand(i * 17)
  const questionCount = 10 + Math.floor(rand() * 10)
  return {
    id: `bench-${domain}`,
    name: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Professional Suite`,
    domain,
    description: `Curated set of ${questionCount} professional-grade questions vetted by licensed experts in the ${domain} domain.`,
    questionCount,
    totalSessions: Math.floor(200 + rand() * 400),
    questions: Array.from({ length: questionCount }, (_, qi) => {
      const qRand = seededRand(i * 100 + qi)
      return {
        id: `q-${domain}-${qi}`,
        question: (SAMPLE_QUESTIONS[domain] ?? [])[qi % (SAMPLE_QUESTIONS[domain]?.length ?? 1)] ?? 'Sample question',
        difficulty: (['easy', 'medium', 'hard', 'expert'] as const)[Math.floor(qRand() * 4)],
        tags: [domain, 'professional', 'verified'],
        sessionCount: Math.floor(20 + qRand() * 80),
        avgScores: Object.fromEntries(
          ALL_MODELS.map(m => [m.id, Math.round((6 + qRand() * 4) * 10) / 10])
        ),
      }
    }),
    createdAt: subDays(new Date(), 60),
    updatedAt: subDays(new Date(), rand() * 5),
  }
})

// ─── Stats for Homepage & Analytics ──────────────────────────────────────
//
// Replace these hard-coded numbers with real aggregates from your data store.
// All values here are plausible-looking demo figures only.

export const PLATFORM_STATS = {
  // Core counters
  totalSessions: 12847,
  totalExperts: 12000,
  modelsTracked: ALL_MODELS.length,
  domainsActive: 6,
  avgJudgmentTime: '< 3 min',
  questionsAnswered: 38540,
  expertReviewsCompleted: 9312,
  pearlWinRate: 38,           // % of battles Pearl AI wins

  // Score averages
  avgExpertScore: 7.8,        // overall mean expert score across all models/sessions

  // Trend indicators displayed in stat cards (mock week-over-week growth for demo)
  trendTotalSessions: '+12%',
  trendTotalSessionsUp: true,
  trendPearlWinRate: '+3%',
  trendPearlWinRateUp: true,
  trendAvgExpertScore: '+0.2',
  trendAvgExpertScoreUp: true,
  trendExpertReviews: '+15%',
  trendExpertReviewsUp: true,
}
