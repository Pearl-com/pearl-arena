import { useState, useCallback, useRef, useMemo } from 'react'
import { MODELS, PEARL_MODEL, EXAMPLE_QUESTIONS, getModelProviderConfig } from '@/lib/constants'
import type { DomainId } from '@/lib/constants'
import type { ExpertJudgment } from '@/lib/types'
import { DomainSelector } from '@/components/arena/DomainSelector'
import { ModelSelector } from '@/components/arena/ModelSelector'
import { ResponseCard } from '@/components/arena/ResponseCard'
import { ExpertJudgePanel } from '@/components/arena/ExpertJudgePanel'
import { ApiKeysModal } from '@/components/arena/ApiKeysModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  buildModelSystemPrompt,
  buildPearlSystemPrompt,
  generateExpertJudgment,
} from '@/lib/anthropic'
import {
  streamModelResponse,
  getConfiguredProviders,
  isProviderConfigured,
} from '@/lib/providers'
import type { ProviderId } from '@/lib/providers'
import {
  askPearlAi,
  isPearlConfigured,
} from '@/lib/pearl-api'
import { getDomain } from '@/lib/utils'

type Phase = 'setup' | 'arena' | 'results'

interface ResponseState {
  text: string
  done: boolean
  error?: string
  responseTime?: number
  isRealPearl?: boolean  // true = came from Pearl API (RAG-grounded response)
}

// ─── Typewriter reveal helper ────────────────────────────────────────────────
// Gradually reveals full text for non-streaming sources (Pearl API)

async function revealText(
  fullText: string,
  onChunk: (partial: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const CHUNK = 18   // chars per step
  const DELAY = 20   // ms between steps
  for (let i = CHUNK; i <= fullText.length; i += CHUNK) {
    if (signal?.aborted) return
    onChunk(fullText.slice(0, i))
    await new Promise<void>(res => setTimeout(res, DELAY))
  }
  onChunk(fullText)  // ensure full text is always shown
}

// ─── Arena Page ───────────────────────────────────────────────────────────────

export function ArenaPage() {
  const [domain, setDomain] = useState<DomainId | null>(null)
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt4o', 'claude'])
  const [question, setQuestion] = useState('')
  const [phase, setPhase] = useState<Phase>('setup')
  const [responses, setResponses] = useState<Record<string, ResponseState>>({})
  const [judgment, setJudgment] = useState<ExpertJudgment | null>(null)
  const [judgmentError, setJudgmentError] = useState<string | null>(null)
  const [pearlError, setPearlError] = useState<string | null>(null)
  const [isJudging, setIsJudging] = useState(false)
  const [showKeysModal, setShowKeysModal] = useState(false)

  const arenaRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const domainInfo = domain ? getDomain(domain) : null
  const allModelIds = useMemo(() => [...selectedModels, 'pearl'], [selectedModels])
  const allModels = allModelIds
    .map(id => (id === 'pearl' ? PEARL_MODEL : MODELS.find(m => m.id === id)!))
    .filter(Boolean)

  const configuredLlmCount = getConfiguredProviders().length
  const pearlReady = isPearlConfigured()

  const toggleModel = (id: string) => {
    setSelectedModels(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const runArena = useCallback(async () => {
    if (!domain || !question.trim()) return

    abortControllerRef.current = new AbortController()
    setPhase('arena')
    setResponses({})
    setJudgment(null)

    const initial: Record<string, ResponseState> = {}
    allModelIds.forEach(id => { initial[id] = { text: '', done: false } })
    setResponses(initial)

    setTimeout(() => {
      arenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      arenaRef.current?.focus()
    }, 100)

    const startTimes: Record<string, number> = {}

    const promises = allModelIds.map(async modelId => {
      const isPearl = modelId === 'pearl'
      startTimes[modelId] = Date.now()

      // ── Pearl AI: use Pearl API (direct REST, mode: pearl-ai) ───────────
      if (isPearl && pearlReady) {
        try {
          const result = await askPearlAi(question)
          const elapsed = Date.now() - startTimes[modelId]

          // Animate text reveal (typewriter) since Pearl API isn't streaming
          await revealText(
            result.content,
            partial => setResponses(prev => ({
              ...prev,
              pearl: { text: partial, done: false, isRealPearl: true },
            })),
            abortControllerRef.current?.signal,
          )

          setResponses(prev => ({
            ...prev,
            pearl: { text: result.content, done: true, responseTime: elapsed, isRealPearl: true },
          }))
        } catch (err: any) {
          if (err.name === 'AbortError') return
          // Fallback to Anthropic simulation if Pearl API errors; surface error in UI
          console.error('Pearl API error (falling back to simulation):', err)
          setPearlError(err.message ?? 'Unknown error')
          await runModelViaStream('pearl', domain, question, startTimes, abortControllerRef.current?.signal)
        }
        return
      }

      // ── All other models (+ Pearl fallback): provider streaming ──────
      await runModelViaStream(modelId, domain, question, startTimes, abortControllerRef.current?.signal)
    })

    await Promise.all(promises)
  }, [domain, question, allModelIds, pearlReady])

  // Helper: streams a model response via the multi-provider client
  const runModelViaStream = async (
    modelId: string,
    domain: DomainId,
    question: string,
    startTimes: Record<string, number>,
    signal?: AbortSignal,
  ) => {
    const isPearl = modelId === 'pearl'
    const systemPrompt = isPearl
      ? buildPearlSystemPrompt(domain)
      : buildModelSystemPrompt(modelId, domain)

    try {
      const providerConfig = getModelProviderConfig(modelId)
      const result = await streamModelResponse(
        providerConfig,
        systemPrompt,
        question,
        partial => setResponses(prev => ({ ...prev, [modelId]: { text: partial, done: false } })),
        signal,
      )
      const elapsed = Date.now() - startTimes[modelId]
      setResponses(prev => ({
        ...prev,
        [modelId]: { text: result.text, done: true, responseTime: elapsed },
      }))
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setResponses(prev => ({
        ...prev,
        [modelId]: { text: `[Error: ${err.message || 'Failed to get response'}]`, done: true, error: err.message },
      }))
    }
  }

  const requestJudgment = useCallback(async () => {
    if (!domain) return
    setIsJudging(true)

    try {
      const responseMap: Record<string, { modelId: string; modelName: string; response: string }> = {}
      allModelIds.forEach(id => {
        const model = id === 'pearl' ? PEARL_MODEL : MODELS.find(m => m.id === id)
        if (model && responses[id]?.text && !responses[id].error) {
          responseMap[id] = { modelId: id, modelName: model.name, response: responses[id].text }
        }
      })

      // generateExpertJudgment auto-selects Pearl MCP → Anthropic fallback
      const result = await generateExpertJudgment(domain, question, responseMap)
      setJudgment(result)
      setPhase('results')
    } catch (err: any) {
      console.error('Judgment error:', err)
      setJudgmentError(err.message ?? 'Expert judgment failed. Please try again.')
    } finally {
      setIsJudging(false)
    }
  }, [domain, question, allModelIds, responses])

  const resetArena = () => {
    abortControllerRef.current?.abort()
    setPhase('setup')
    setResponses({})
    setJudgment(null)
    setJudgmentError(null)
    setQuestion('')
  }

  const allResponsesDone = allModelIds.every(id => responses[id]?.done)
  const domainColor = domainInfo?.color ?? '#6366F1'
  const getScore = (modelId: string): ExpertScore | undefined =>
    judgment?.scores.find(s => s.modelId === modelId)

  return (
    <div className="min-h-screen bg-theme-bg">
      {showKeysModal && <ApiKeysModal onClose={() => setShowKeysModal(false)} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ─── Setup Phase ────────────────────────────────────────────────── */}
        {phase === 'setup' && (
          <div className="space-y-10 animate-fade-in">

            {/* Hero */}
            <div className="text-center pt-8 pb-2">
              <Badge color="#F5C842" size="md" dot pulse className="mb-4">Live Arena · Expert Judges Online</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-theme-text to-theme-text/50 bg-clip-text text-transparent">
                Which AI gets it right?
              </h1>
              <p className="text-theme-muted max-w-xl mx-auto text-[15px] leading-relaxed">
                Pit top AI models against each other on real professional questions.
                A licensed expert judges every response — no popularity contests, no automated metrics.
              </p>

              {/* Connection status bar */}
              <div className="mt-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-full border border-theme-border/80 bg-theme-overlay/[0.03]">
                {/* Pearl API indicator */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pearlReady ? '#F5C842' : 'rgba(255,255,255,0.15)' }} />
                  <span className="text-[10px]" style={{ color: pearlReady ? 'rgba(245,200,66,0.7)' : 'rgba(255,255,255,0.25)' }}>
                    {pearlReady ? 'Pearl API live' : 'Pearl API offline'}
                  </span>
                </div>
                <div className="w-px h-3 bg-theme-overlay/[0.08]" />
                {/* LLM provider dots */}
                <div className="flex items-center gap-1">
                  {['anthropic', 'openai', 'google', 'groq'].map(id => (
                    <div key={id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isProviderConfigured(id as ProviderId) ? '#22C55E' : 'rgba(255,255,255,0.12)' }} title={id} />
                  ))}
                </div>
                <span className="text-[10px] text-theme-muted/70">{configuredLlmCount}/9 LLMs</span>
                <button onClick={() => setShowKeysModal(true)} className="text-[10px] text-yellow-400/65 hover:text-yellow-400 transition">
                  Configure →
                </button>
              </div>

              {/* Pearl API error toast — visible when a call fails */}
              {pearlError && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-400/80 max-w-sm">
                  <span className="shrink-0 mt-px">⚠</span>
                  <span><strong className="text-red-400">Pearl API error:</strong> {pearlError} — using AI simulation instead.</span>
                  <button onClick={() => setPearlError(null)} className="shrink-0 ml-auto text-red-400/40 hover:text-red-400">✕</button>
                </div>
              )}
            </div>

            {/* Step 1 — Domain */}
            <DomainSelector selected={domain} onSelect={setDomain} />

            {/* Step 2 — Models */}
            <ModelSelector selected={selectedModels} onToggle={toggleModel} />

            {/* Step 3 — Question */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-theme-overlay/10 flex items-center justify-center text-[11px] font-bold text-theme-muted">3</span>
                <span className="text-sm font-medium text-theme-muted">Ask your question</span>
              </div>
              <textarea
                value={question}
                onChange={e => { if (e.target.value.length <= 1000) setQuestion(e.target.value) }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    if (domain && question.trim()) runArena()
                  }
                }}
                maxLength={1000}
                placeholder={domain ? `Ask a ${domainInfo?.label.toLowerCase()} question… (⌘+Enter to submit)` : 'Select a domain first…'}
                className="w-full bg-theme-overlay/[0.04] border border-theme-border rounded-xl px-5 py-4 text-[15px] text-theme-text-secondary placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-border/20 focus:bg-theme-overlay/[0.06] transition resize-none"
                rows={3}
                disabled={!domain}
              />
              {question.length > 900 && (
                <div className="text-right mt-1">
                  <span className={`text-[11px] font-mono ${question.length >= 1000 ? 'text-red-400' : 'text-theme-muted/50'}`}>
                    {question.length}/1000
                  </span>
                </div>
              )}
              {domain && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[11px] text-theme-muted/50 py-1">Try:</span>
                  {EXAMPLE_QUESTIONS[domain]?.slice(0, 3).map((eq, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(eq)}
                      className="text-[11px] text-theme-muted hover:text-theme-text-secondary bg-theme-overlay/[0.03] hover:bg-theme-overlay/[0.07] border border-theme-border/70 hover:border-theme-border px-3 py-1 rounded-lg transition"
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Launch */}
            <div className="text-center pt-4 pb-10">
              <button
                onClick={runArena}
                disabled={!domain || !question.trim() || selectedModels.length === 0}
                className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed hover:scale-[1.03] hover:shadow-2xl"
                style={{
                  background: domain && question.trim()
                    ? `linear-gradient(135deg, ${domainColor}CC 0%, ${domainColor}88 100%)`
                    : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  boxShadow: domain && question.trim() ? `0 8px 40px ${domainColor}30` : 'none',
                }}
              >
                <span>⚡</span>
                <span>Start the Arena</span>
              </button>
              <p className="mt-3 text-xs text-theme-muted/50">
                {selectedModels.length} challenger{selectedModels.length !== 1 ? 's' : ''} + Pearl AI · ⌘+Enter to start
              </p>
            </div>
          </div>
        )}

        {/* ─── Arena / Results Phase ───────────────────────────────────────── */}
        {(phase === 'arena' || phase === 'results') && (
          <div ref={arenaRef} tabIndex={-1} aria-label="Arena responses" className="outline-none">
            {/* Question Banner */}
            <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-theme-border/80 bg-theme-overlay/[0.03] px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{domainInfo?.icon}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: domainColor }}>
                    {domainInfo?.label}
                  </span>
                  {pearlReady && (
                    <span className="text-[10px] text-pearl/50">· Pearl API active</span>
                  )}
                  {phase === 'results' && judgment && (
                    <Badge color="#22C55E" size="sm" dot>Judged</Badge>
                  )}
                </div>
                <p className="text-theme-text-secondary text-[15px] leading-snug">{question}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetArena}>← New Arena</Button>
            </div>

            {/* Response Cards Grid */}
            <div className={`grid gap-4 ${
              allModels.length <= 2 ? 'grid-cols-1 md:grid-cols-2'
              : allModels.length <= 3 ? 'grid-cols-1 md:grid-cols-3'
              : allModels.length <= 4 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            }`}>
              {allModels.map(model => (
                <ResponseCard
                  key={model.id}
                  model={model}
                  response={responses[model.id]?.text ?? ''}
                  isLoading={!responses[model.id]?.done}
                  isPearl={model.id === 'pearl'}
                  score={getScore(model.id)}
                  isWinner={judgment?.winnerId === model.id}
                  responseTime={responses[model.id]?.responseTime}
                />
              ))}
            </div>

            {/* Expert Judgment Panel */}
            {allResponsesDone && !judgmentError && (
              <ExpertJudgePanel
                domain={domain!}
                judgment={judgment}
                isJudging={isJudging}
                onRequestJudgment={requestJudgment}
                usesRealExpert={pearlReady}
              />
            )}

            {/* Judgment error state */}
            {judgmentError && (
              <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                  <span className="text-2xl">⚠</span>
                </div>
                <h3 className="text-lg font-semibold text-red-400/90 mb-2">Expert Judgment Unavailable</h3>
                <p className="text-sm text-theme-muted/70 max-w-md mx-auto mb-1">{judgmentError}</p>
                <p className="text-xs text-theme-muted/50 mb-5">This can happen if the API is temporarily unavailable or the response couldn't be parsed.</p>
                <button
                  onClick={() => { setJudgmentError(null); requestJudgment() }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-theme-text-secondary border border-theme-border hover:bg-theme-overlay/[0.06] transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Pearl CTA */}
            {phase === 'results' && (
              <div className="mt-12 text-center border-t border-theme-border/60 pt-10 pb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pearl/10 border border-pearl/20 text-2xl mb-4">✦</div>
                <p className="text-theme-muted/70 text-sm mb-2 max-w-sm mx-auto">
                  Pearl AI is grounded in millions of real expert Q&As — RAG-powered answers with higher accuracy, judged by 12,000+ licensed experts
                </p>
                <div className="flex items-center justify-center gap-5 mt-4">
                  <a href="https://www.pearl.com/enterprise" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-pearl/70 hover:text-pearl transition underline underline-offset-2">
                    Pearl Enterprise →
                  </a>
                  <button onClick={resetArena}
                    className="text-xs text-theme-muted hover:text-theme-text-secondary transition border border-theme-border hover:border-theme-border px-4 py-1.5 rounded-lg">
                    Run another battle
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
