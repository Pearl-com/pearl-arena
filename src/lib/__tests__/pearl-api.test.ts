import { describe, it, expect } from 'vitest'
import { parseExpertResponse, buildExpertRequest } from '../pearl-api'

const MODELS_FIXTURE = {
  gpt4o: { modelId: 'gpt4o', modelName: 'GPT-4o', response: 'GPT response text' },
  claude: { modelId: 'claude', modelName: 'Claude Sonnet 4.6', response: 'Claude response text' },
  pearl: { modelId: 'pearl', modelName: 'Pearl AI', response: 'Pearl response text' },
}

describe('parseExpertResponse', () => {
  it('parses a well-formatted expert response', () => {
    const raw = `SCORES:
GPT-4o:
  Accuracy=7  Completeness=8  Safety=7  Clarity=8  Trustworthiness=7

Claude Sonnet 4.6:
  Accuracy=8  Completeness=8  Safety=9  Clarity=8  Trustworthiness=8

Pearl AI:
  Accuracy=9  Completeness=9  Safety=9  Clarity=8  Trustworthiness=9

WINNER: Pearl AI

ANALYSIS:
All three models provided helpful responses. Pearl AI demonstrated the strongest accuracy and safety.

FLAGGED ERRORS:
GPT-4o [minor]: Did not mention important caveat about jurisdiction`

    const result = parseExpertResponse(raw, MODELS_FIXTURE)

    expect(result.scores).toHaveLength(3)
    expect(result.winnerId).toBe('pearl')
    expect(result.winnerName).toBe('Pearl AI')
    expect(result.reasoning).toContain('All three models')
    expect(result.flaggedErrors).toHaveLength(1)
    expect(result.flaggedErrors[0].severity).toBe('minor')
    expect(result.flaggedErrors[0].modelId).toBe('gpt4o')
  })

  it('parses scores with colon separators', () => {
    const raw = `SCORES:
GPT-4o: Accuracy: 6 Completeness: 7 Safety: 8 Clarity: 7 Trustworthiness: 6
Claude Sonnet 4.6: Accuracy: 8 Completeness: 8 Safety: 9 Clarity: 9 Trustworthiness: 8
Pearl AI: Accuracy: 9 Completeness: 9 Safety: 8 Clarity: 8 Trustworthiness: 9

WINNER: Claude Sonnet 4.6

ANALYSIS:
Claude and Pearl performed well.

FLAGGED ERRORS:
None`

    const result = parseExpertResponse(raw, MODELS_FIXTURE)
    expect(result.scores).toHaveLength(3)
    const claudeScore = result.scores.find(s => s.modelId === 'claude')
    expect(claudeScore?.accuracy).toBe(8)
    expect(claudeScore?.safety).toBe(9)
  })

  it('handles markdown-formatted expert response', () => {
    const raw = `**SCORES:**
**GPT-4o:** Accuracy=7 Completeness=7 Safety=6 Clarity=8 Trustworthiness=7
**Claude Sonnet 4.6:** Accuracy=8 Completeness=8 Safety=8 Clarity=9 Trustworthiness=8
**Pearl AI:** Accuracy=9 Completeness=9 Safety=9 Clarity=9 Trustworthiness=9

**WINNER:** Pearl AI

**ANALYSIS:**
Strong performance across the board.

**FLAGGED ERRORS:**
None.`

    const result = parseExpertResponse(raw, MODELS_FIXTURE)
    expect(result.scores).toHaveLength(3)
    expect(result.winnerId).toBe('pearl')

    const pearlScore = result.scores.find(s => s.modelId === 'pearl')
    expect(pearlScore?.accuracy).toBe(9)
    expect(pearlScore?.overall).toBeGreaterThan(0)
  })

  it('computes weighted overall score correctly', () => {
    const raw = `SCORES:
GPT-4o: Accuracy=10 Completeness=10 Safety=10 Clarity=10 Trustworthiness=10
Claude Sonnet 4.6: Accuracy=5 Completeness=5 Safety=5 Clarity=5 Trustworthiness=5
Pearl AI: Accuracy=8 Completeness=7 Safety=9 Clarity=6 Trustworthiness=7

WINNER: GPT-4o

ANALYSIS:
GPT-4o was perfect.

FLAGGED ERRORS:
None`

    const result = parseExpertResponse(raw, MODELS_FIXTURE)

    const gptScore = result.scores.find(s => s.modelId === 'gpt4o')
    expect(gptScore?.overall).toBe(10)

    const claudeScore = result.scores.find(s => s.modelId === 'claude')
    expect(claudeScore?.overall).toBe(5)

    // Pearl: 8*0.35 + 7*0.25 + 9*0.20 + 6*0.10 + 7*0.10 = 2.8+1.75+1.8+0.6+0.7 = 7.65
    const pearlScore = result.scores.find(s => s.modelId === 'pearl')
    expect(pearlScore?.overall).toBeCloseTo(7.7, 0)
  })

  it('uses expert metadata when provided', () => {
    const raw = `SCORES:
GPT-4o: Accuracy=7 Completeness=7 Safety=7 Clarity=7 Trustworthiness=7
Claude Sonnet 4.6: Accuracy=7 Completeness=7 Safety=7 Clarity=7 Trustworthiness=7
Pearl AI: Accuracy=7 Completeness=7 Safety=7 Clarity=7 Trustworthiness=7

WINNER: Pearl AI
ANALYSIS: Tie.
FLAGGED ERRORS: None`

    const result = parseExpertResponse(raw, MODELS_FIXTURE, {
      name: 'Dr. Jane Smith',
      jobDescription: 'Board-Certified MD, 20 years',
      avatarUrl: 'https://example.com/avatar.jpg',
    })

    expect(result.expertName).toBe('Dr. Jane Smith')
    expect(result.expertCredential).toBe('Board-Certified MD, 20 years')
    expect(result.expertAvatarUrl).toBe('https://example.com/avatar.jpg')
  })

  it('falls back to highest-scoring model when WINNER line is unparseable', () => {
    const raw = `SCORES:
GPT-4o: Accuracy=9 Completeness=9 Safety=9 Clarity=9 Trustworthiness=9
Claude Sonnet 4.6: Accuracy=6 Completeness=6 Safety=6 Clarity=6 Trustworthiness=6
Pearl AI: Accuracy=7 Completeness=7 Safety=7 Clarity=7 Trustworthiness=7

WINNER: SomeUnknownModel

ANALYSIS: Test.
FLAGGED ERRORS: None`

    const result = parseExpertResponse(raw, MODELS_FIXTURE)
    expect(result.winnerId).toBe('gpt4o')
  })
})

describe('buildExpertRequest', () => {
  it('includes all model responses in the request', () => {
    const request = buildExpertRequest('legal', 'Is a verbal agreement binding?', MODELS_FIXTURE)

    expect(request).toContain('PEARL ARENA')
    expect(request).toContain('Legal')
    expect(request).toContain('GPT-4o')
    expect(request).toContain('Claude Sonnet 4.6')
    expect(request).toContain('Pearl AI')
    expect(request).toContain('Is a verbal agreement binding?')
    expect(request).toContain('Accuracy (35%)')
    expect(request).toContain('MODEL 1 of 3')
  })
})
