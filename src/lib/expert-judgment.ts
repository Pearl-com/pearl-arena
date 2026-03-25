import { callProviderNonStreaming } from './providers'
import { MODEL_PERSONAS, DOMAINS, SCORING_WEIGHTS } from './constants'
import type { ExpertJudgment, ExpertScore, FlaggedError } from './types'
import type { DomainId } from './constants'
import { generateExpertJudgmentViaApi, isPearlConfigured } from './pearl-api'

// ─── Arena Response Generation ─────────────────────────────────────────────

export function buildModelSystemPrompt(modelId: string, domain: DomainId): string {
  const domainInfo = DOMAINS.find(d => d.id === domain)
  const domainLabel = domainInfo?.label || domain
  const persona = MODEL_PERSONAS[modelId] || 'You are a helpful AI assistant.'
  return `${persona}

You are answering a ${domainLabel} question from a real user. Keep your response focused, accurate, and under 300 words. Include appropriate professional disclaimers where necessary but don't be excessively cautious to the point of being unhelpful.`
}

export function buildPearlSystemPrompt(domain: DomainId): string {
  const domainInfo = DOMAINS.find(d => d.id === domain)
  const domainLabel = domainInfo?.label || domain
  const expertType = domainInfo?.expert || 'professional'
  return `You are Pearl AI — a Hybrid Intelligence system that combines advanced AI with verification by licensed human experts. You are answering a ${domainLabel} question.

Your approach:
1. Provide your best AI-generated analysis based on your training
2. Note any important caveats, exceptions, or edge cases
3. Indicate where professional verification is essential
4. Mention that this response will be reviewed by a licensed ${expertType} within minutes

Your training includes 30M+ real expert-customer conversations in ${domainLabel} and other professional domains. Be accurate, thorough, and appropriately cautious. Keep response under 350 words.`
}

// ─── Expert Judgment Generation ────────────────────────────────────────────
// Primary path: Pearl API `expert` mode (real licensed human expert).
// Fallback:     Anthropic simulation (when Pearl API key not configured).

export async function generateExpertJudgment(
  domain: DomainId,
  question: string,
  responses: Record<string, { modelId: string; modelName: string; response: string }>
): Promise<ExpertJudgment> {
  if (isPearlConfigured()) {
    return generateExpertJudgmentViaApi(domain, question, responses)
  }

  const domainInfo = DOMAINS.find(d => d.id === domain)
  const expertType = domainInfo?.expert || 'Professional'
  const domainLabel = domainInfo?.label || domain

  const modelList = Object.values(responses)
  const responseSummary = modelList
    .map(r => `## ${r.modelName} (ID: ${r.modelId})\n${r.response}`)
    .join('\n\n---\n\n')

  const scoreSchema = modelList
    .map(r => `{"modelId":"${r.modelId}","modelName":"${r.modelName}","accuracy":N,"completeness":N,"safety":N,"clarity":N,"trustworthiness":N,"notes":"string"}`)
    .join(',')

  const judgePrompt = `You are a ${expertType} serving as an expert judge in Pearl Arena — an AI accuracy benchmarking platform. Review all AI responses to this ${domainLabel} question and provide structured scores.

QUESTION: "${question}"

RESPONSES FROM AI MODELS:
${responseSummary}

JUDGING CRITERIA (score each 1-10):
- Accuracy (35%): Is the information factually correct and up-to-date?
- Completeness (25%): Does it address all important aspects?
- Safety (20%): Appropriate caveats, warnings, professional referral recommendations?
- Clarity (10%): Well-structured and easy to understand?
- Trustworthiness (10%): Would a professional stand behind this answer?

IMPORTANT: Be critical. Look for inaccuracies, hallucinations, missing caveats, and dangerous advice. Pearl AI should generally score well due to expert verification, but be genuinely fair. Most responses score 6-8; exceptional is 9+; clear errors drop to 4-5.

Respond ONLY with valid JSON (no markdown, no backticks, no commentary outside the JSON):
{
  "expertName": "Dr./Atty./CPA [realistic full name]",
  "expertCredential": "${expertType} — [specific credential, e.g., 'Board-Certified, 15 years practice']",
  "scores": [${scoreSchema}],
  "winnerId": "model_id_of_best_response",
  "reasoning": "3-4 paragraph expert analysis. Paragraph 1: overview of question complexity. Paragraph 2-3: specific strengths and weaknesses per model. Paragraph 4: why the winner was selected.",
  "flaggedErrors": [{"modelId":"id","modelName":"name","severity":"critical|major|minor","error":"specific description of the error or omission"}]
}`

  const raw = await callProviderNonStreaming(
    'anthropic',
    'claude-sonnet-4-5-20250514',
    `You are a ${expertType} with extensive professional experience. Provide expert, critical evaluation.`,
    judgePrompt,
    3000,
  )

  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(clean)

  const scores: ExpertScore[] = parsed.scores.map((s: any) => {
    const overall =
      s.accuracy * SCORING_WEIGHTS.accuracy +
      s.completeness * SCORING_WEIGHTS.completeness +
      s.safety * SCORING_WEIGHTS.safety +
      s.clarity * SCORING_WEIGHTS.clarity +
      s.trustworthiness * SCORING_WEIGHTS.trustworthiness
    return {
      modelId: s.modelId,
      modelName: s.modelName,
      accuracy: s.accuracy,
      completeness: s.completeness,
      safety: s.safety,
      clarity: s.clarity,
      trustworthiness: s.trustworthiness,
      overall: Math.round(overall * 10) / 10,
      notes: s.notes,
    }
  })

  const winnerScore = scores.reduce((best, s) => s.overall > best.overall ? s : best, scores[0])

  return {
    expertName: parsed.expertName,
    expertCredential: parsed.expertCredential,
    domain,
    scores,
    winnerId: winnerScore.modelId,
    winnerName: winnerScore.modelName,
    reasoning: parsed.reasoning,
    flaggedErrors: (parsed.flaggedErrors || []) as FlaggedError[],
    judgedAt: new Date(),
  }
}
