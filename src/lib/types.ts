import type { DomainId, ModelId } from './constants'

// ─── Core Arena Types ─────────────────────────────────────────────────────

export interface ArenaSession {
  id: string
  domain: DomainId
  question: string
  models: string[] // model IDs that participated
  responses: Record<string, ModelResponse>
  expertJudgment?: ExpertJudgment
  scores?: Record<string, number>
  winner?: string
  timestamp: Date
  duration?: number // ms from start to judgment
}

export interface ModelResponse {
  modelId: string
  modelName: string
  response: string
  responseTime: number // ms to first token
  totalTime: number // ms total
  tokenCount?: number
  streaming: boolean
  error?: string
}

export interface ExpertJudgment {
  expertName: string
  expertCredential: string
  expertAvatarUrl?: string   // Avatar URL from Pearl MCP expert profile
  expertExpertise?: string   // Free-text expertise description (e.g. "Board-certified physician, 12 years")
  isRealExpert?: boolean     // true = came from Pearl MCP (human), false = AI simulation
  domain: DomainId
  scores: ExpertScore[]
  winnerId: string
  winnerName: string
  reasoning: string
  flaggedErrors: FlaggedError[]
  judgedAt: Date
}

export interface ExpertScore {
  modelId: string
  modelName: string
  accuracy: number      // 1-10
  completeness: number  // 1-10
  safety: number        // 1-10
  clarity: number       // 1-10
  trustworthiness: number // 1-10
  overall: number       // weighted composite
  notes?: string
}

export interface FlaggedError {
  modelId: string
  modelName: string
  severity: 'critical' | 'major' | 'minor'
  error: string
}

// ─── Leaderboard Types ────────────────────────────────────────────────────

export interface LeaderboardEntry {
  modelId: ModelId
  modelName: string
  provider: string
  color: string
  rank: number
  totalSessions: number
  wins: number
  winRate: number
  avgScore: number
  avgAccuracy: number
  avgSafety: number
  avgCompleteness: number
  avgClarity: number
  avgTrustworthiness: number
  domainScores: Partial<Record<DomainId, DomainScore>>
  trend: 'up' | 'down' | 'stable' // recent trend
  trendValue: number // change in rank over last 30 days
  lastUpdated: Date
}

export interface DomainScore {
  avgScore: number
  wins: number
  sessions: number
  winRate: number
}

// ─── Analytics Types ──────────────────────────────────────────────────────

export interface AnalyticsDataPoint {
  date: string
  sessions: number
  avgScore: number
  [modelId: string]: string | number
}

export interface ModelTrend {
  modelId: string
  modelName: string
  color: string
  data: { date: string; score: number; sessions: number }[]
}

export interface DomainStats {
  domain: DomainId
  totalSessions: number
  avgScore: number
  topModel: string
  mostContested: string // domain with most close calls
}

export interface WinRateMatrix {
  challenger: string
  [opponent: string]: string | number
}

// ─── Benchmark Types ──────────────────────────────────────────────────────

export interface BenchmarkSuite {
  id: string
  name: string
  domain: DomainId
  description: string
  questionCount: number
  totalSessions: number
  questions: BenchmarkQuestion[]
  createdAt: Date
  updatedAt: Date
}

export interface BenchmarkQuestion {
  id: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  tags: string[]
  expertNote?: string
  avgScores?: Record<string, number>
  sessionCount: number
}

export interface BenchmarkResult {
  suiteId: string
  modelId: string
  modelName: string
  score: number
  accuracy: number
  safety: number
  completeness: number
  sessionCount: number
  lastRun: Date
}

// ─── History Types ────────────────────────────────────────────────────────

export interface HistoryItem {
  id: string
  domain: DomainId
  question: string
  questionPreview: string
  models: string[]
  winner: string
  winnerName: string
  topScore: number
  judgedBy: string
  timestamp: Date
  sessionDuration: number
}

// ─── API Response Types ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  error?: string
  timestamp: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
