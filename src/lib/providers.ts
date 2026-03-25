/**
 * Pearl Arena — Multi-Provider LLM Streaming Client
 *
 * Supports: Anthropic · OpenAI · Google Gemini · Perplexity
 *           DeepSeek · xAI · Groq · Mistral · Cohere
 *
 * All providers share a common interface:
 *   streamModelResponse(config, systemPrompt, userMessage, onChunk, signal?) → Promise<string>
 *
 * In-browser direct mode: uses VITE_*_API_KEY env vars.
 */

// ─── Provider IDs ──────────────────────────────────────────────────────────

export type ProviderId =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'perplexity'
  | 'deepseek'
  | 'xai'
  | 'groq'
  | 'mistral'
  | 'cohere'

// ─── Provider Metadata ────────────────────────────────────────────────────

export interface ProviderMeta {
  id: ProviderId
  name: string
  color: string               // Brand color
  website: string
  envKey: string              // VITE_*_API_KEY variable name
  baseUrl: string             // API base URL
  docsUrl: string
  browserDirect: boolean      // Whether direct browser calls are officially supported
  notes?: string
}

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    color: '#D97706',
    website: 'https://anthropic.com',
    envKey: 'VITE_ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com',
    docsUrl: 'https://console.anthropic.com',
    browserDirect: true,
    notes: 'Requires anthropic-dangerous-direct-browser-access header',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    color: '#10A37F',
    website: 'https://openai.com',
    envKey: 'VITE_OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com',
    docsUrl: 'https://platform.openai.com/api-keys',
    browserDirect: true,
    notes: 'CORS allowed from browser',
  },
  google: {
    id: 'google',
    name: 'Google AI',
    color: '#4285F4',
    website: 'https://ai.google.dev',
    envKey: 'VITE_GOOGLE_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    browserDirect: true,
    notes: 'API key passed as URL param; CORS allowed',
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    color: '#20B2AA',
    website: 'https://perplexity.ai',
    envKey: 'VITE_PERPLEXITY_API_KEY',
    baseUrl: 'https://api.perplexity.ai',
    docsUrl: 'https://www.perplexity.ai/settings/api',
    browserDirect: false,
    notes: 'OpenAI-compatible; CORS restricted — use backend proxy in production',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    color: '#06B6D4',
    website: 'https://deepseek.com',
    envKey: 'VITE_DEEPSEEK_API_KEY',
    baseUrl: 'https://api.deepseek.com',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    browserDirect: false,
    notes: 'OpenAI-compatible; use proxy for browser',
  },
  xai: {
    id: 'xai',
    name: 'xAI',
    color: '#E5E7EB',
    website: 'https://x.ai',
    envKey: 'VITE_XAI_API_KEY',
    baseUrl: 'https://api.x.ai',
    docsUrl: 'https://console.x.ai',
    browserDirect: false,
    notes: 'OpenAI-compatible',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    color: '#F55036',
    website: 'https://groq.com',
    envKey: 'VITE_GROQ_API_KEY',
    baseUrl: 'https://api.groq.com/openai',
    docsUrl: 'https://console.groq.com/keys',
    browserDirect: true,
    notes: 'OpenAI-compatible; browser CORS allowed',
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    color: '#FF7000',
    website: 'https://mistral.ai',
    envKey: 'VITE_MISTRAL_API_KEY',
    baseUrl: 'https://api.mistral.ai',
    docsUrl: 'https://console.mistral.ai/api-keys',
    browserDirect: false,
    notes: 'OpenAI-compatible',
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    color: '#39594D',
    website: 'https://cohere.com',
    envKey: 'VITE_COHERE_API_KEY',
    baseUrl: 'https://api.cohere.ai',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
    browserDirect: false,
    notes: 'Uses its own chat format (not OpenAI-compatible)',
  },
}

// ─── API Key Store ────────────────────────────────────────────────────────
// Keys from .env (VITE_ vars) and runtime injection (in-app settings panel)

type KeyStore = Partial<Record<ProviderId, string>>

const runtimeKeys: KeyStore = {}

/** Set a provider API key at runtime (from the settings panel). */
export function setProviderKey(provider: ProviderId, key: string) {
  runtimeKeys[provider] = key
}

/** Get a provider API key (runtime > env var > undefined). */
export function getProviderKey(provider: ProviderId): string | undefined {
  if (runtimeKeys[provider]) return runtimeKeys[provider]
  const meta = PROVIDERS[provider]
  const envVal = (import.meta as any).env?.[meta.envKey]
  if (envVal) return envVal
  // Legacy: check window globals for backwards compatibility
  const windowKey = (window as any)[`__${meta.envKey}`]
  if (windowKey) return windowKey
  return undefined
}

/** Returns which providers currently have a key configured. */
export function getConfiguredProviders(): ProviderId[] {
  return (Object.keys(PROVIDERS) as ProviderId[]).filter(id => !!getProviderKey(id))
}

/** Returns true if a key is configured for the given provider. */
export function isProviderConfigured(provider: ProviderId): boolean {
  return !!getProviderKey(provider)
}

// ─── Model Config ─────────────────────────────────────────────────────────

export interface ModelProviderConfig {
  modelId: string      // Pearl Arena ID (e.g. 'gpt4o')
  apiProvider: ProviderId
  apiModelId: string   // API-level model name (e.g. 'gpt-4o')
  maxTokens?: number
  supportsSystem?: boolean  // Does the API have a system prompt param?
}

// ─── Streaming Result ────────────────────────────────────────────────────

export interface StreamResult {
  text: string
  responseTime: number  // ms to first token
  totalTime: number
  provider: ProviderId
  apiModel: string
  tokensUsed?: number
}

// ─── Main Streaming Dispatcher ────────────────────────────────────────────

/**
 * Universal model response streamer.
 * Routes to the correct provider client based on `config.apiProvider`.
 * Falls back to Anthropic simulation if provider key is unavailable.
 */
export async function streamModelResponse(
  config: ModelProviderConfig,
  systemPrompt: string,
  userMessage: string,
  onChunk: (partial: string) => void,
  signal?: AbortSignal,
): Promise<StreamResult> {
  const start = Date.now()
  const apiKey = getProviderKey(config.apiProvider)

  // Fallback: if key not available, simulate via Anthropic
  if (!apiKey) {
    const anthropicKey = getProviderKey('anthropic')
    if (!anthropicKey) {
      throw new Error(
        `No API key for ${PROVIDERS[config.apiProvider].name}. ` +
        `Set ${PROVIDERS[config.apiProvider].envKey} in your .env file or via the Settings panel.`
      )
    }
    const text = await streamViaAnthropicSimulation(
      config, systemPrompt, userMessage, anthropicKey, onChunk, signal
    )
    return { text, responseTime: Date.now() - start, totalTime: Date.now() - start, provider: 'anthropic', apiModel: 'claude-sonnet-4-5-20250514 (simulation)' }
  }

  let text: string

  switch (config.apiProvider) {
    case 'anthropic':
      text = await streamAnthropic(config, systemPrompt, userMessage, apiKey, onChunk, signal)
      break
    case 'openai':
      text = await streamOpenAICompat('https://api.openai.com/v1/chat/completions', config, systemPrompt, userMessage, apiKey, onChunk, signal)
      break
    case 'google':
      text = await streamGoogle(config, systemPrompt, userMessage, apiKey, onChunk, signal)
      break
    case 'perplexity':
      text = await streamOpenAICompat('https://api.perplexity.ai/chat/completions', config, systemPrompt, userMessage, apiKey, onChunk, signal)
      break
    case 'deepseek':
      text = await streamOpenAICompat('https://api.deepseek.com/chat/completions', config, systemPrompt, userMessage, apiKey, onChunk, signal)
      break
    case 'xai':
      text = await streamOpenAICompat('https://api.x.ai/v1/chat/completions', config, systemPrompt, userMessage, apiKey, onChunk, signal)
      break
    case 'groq':
      text = await streamOpenAICompat('https://api.groq.com/openai/v1/chat/completions', config, systemPrompt, userMessage, apiKey, onChunk, signal)
      break
    case 'mistral':
      text = await streamOpenAICompat('https://api.mistral.ai/v1/chat/completions', config, systemPrompt, userMessage, apiKey, onChunk, signal)
      break
    case 'cohere':
      text = await streamCohere(config, systemPrompt, userMessage, apiKey, onChunk, signal)
      break
    default:
      throw new Error(`Unknown provider: ${config.apiProvider}`)
  }

  return {
    text,
    responseTime: Date.now() - start,
    totalTime: Date.now() - start,
    provider: config.apiProvider,
    apiModel: config.apiModelId,
  }
}

// ─── Anthropic Client ─────────────────────────────────────────────────────

async function streamAnthropic(
  config: ModelProviderConfig,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  onChunk: (partial: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.apiModelId,
      max_tokens: config.maxTokens ?? 1024,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Anthropic API error: ${response.status}`)
  }

  return readOpenAIStyleSSE(response, onChunk, 'anthropic')
}

// ─── OpenAI-Compatible Client ────────────────────────────────────────────
// Used by: OpenAI, Perplexity, DeepSeek, xAI, Groq, Mistral

async function streamOpenAICompat(
  endpoint: string,
  config: ModelProviderConfig,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  onChunk: (partial: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const messages: { role: string; content: string }[] = []
  if (systemPrompt && config.supportsSystem !== false) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: userMessage })

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.apiModelId,
      messages,
      max_tokens: config.maxTokens ?? 1024,
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${response.status} from ${endpoint}`)
  }

  return readOpenAIStyleSSE(response, onChunk, 'openai')
}

// ─── Google Gemini Client ────────────────────────────────────────────────

async function streamGoogle(
  config: ModelProviderConfig,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  onChunk: (partial: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.apiModelId}:streamGenerateContent?key=${apiKey}&alt=sse`

  const body: Record<string, any> = {
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: {
      maxOutputTokens: config.maxTokens ?? 1024,
      temperature: 0.7,
    },
  }

  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = err?.error?.message ?? `Google AI API error: ${response.status}`
    throw new Error(msg)
  }

  return readGeminiSSE(response, onChunk)
}

// ─── Cohere Client ────────────────────────────────────────────────────────

async function streamCohere(
  config: ModelProviderConfig,
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  onChunk: (partial: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const messages: { role: string; content: string }[] = []
  if (systemPrompt) {
    messages.push({ role: 'SYSTEM', content: systemPrompt })
  }
  messages.push({ role: 'USER', content: userMessage })

  const response = await fetch('https://api.cohere.ai/v2/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.apiModelId,
      messages,
      stream: true,
      max_tokens: config.maxTokens ?? 1024,
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.message ?? `Cohere API error: ${response.status}`)
  }

  return readCohereSSE(response, onChunk)
}

// ─── Anthropic Simulation Fallback ────────────────────────────────────────
// When a provider key is missing, simulate via Claude with model persona

async function streamViaAnthropicSimulation(
  config: ModelProviderConfig,
  systemPrompt: string,
  userMessage: string,
  anthropicKey: string,
  onChunk: (partial: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const simulationSystem = `${systemPrompt}\n\n[Note: This response is being simulated by Claude on behalf of ${config.apiModelId} because no API key is available for ${config.apiProvider}. Stay in character.]`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 1024,
      stream: true,
      system: simulationSystem,
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Anthropic simulation error: ${response.status}`)
  }

  return readOpenAIStyleSSE(response, onChunk, 'anthropic')
}

// ─── SSE Stream Readers ───────────────────────────────────────────────────

/** Reads OpenAI-style SSE (used by Anthropic, OpenAI, Perplexity, DeepSeek, xAI, Groq, Mistral). */
async function readOpenAIStyleSSE(
  response: Response,
  onChunk: (partial: string) => void,
  format: 'openai' | 'anthropic',
): Promise<string> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') continue

        try {
          const data = JSON.parse(payload)
          let token = ''

          if (format === 'anthropic') {
            // Anthropic format: content_block_delta
            if (data.type === 'content_block_delta' && data.delta?.text) {
              token = data.delta.text
            }
          } else {
            // OpenAI format: choices[0].delta.content
            token = data.choices?.[0]?.delta?.content ?? ''
          }

          if (token) {
            full += token
            onChunk(full)
          }
        } catch {
          // ignore malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return full
}

/** Reads Google Gemini SSE format. */
async function readGeminiSSE(
  response: Response,
  onChunk: (partial: string) => void,
): Promise<string> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (!payload || payload === '[DONE]') continue

        try {
          const data = JSON.parse(payload)
          const token: string =
            data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
          if (token) {
            full += token
            onChunk(full)
          }
        } catch {
          // ignore
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return full
}

/** Reads Cohere v2 streaming format. */
async function readCohereSSE(
  response: Response,
  onChunk: (partial: string) => void,
): Promise<string> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const data = JSON.parse(line)
          // Cohere v2: type="content-delta", delta.message.content.text
          if (data.type === 'content-delta') {
            const token: string = data.delta?.message?.content?.text ?? ''
            if (token) {
              full += token
              onChunk(full)
            }
          }
          // Cohere v1 stream_end: message.text
          if (data.event_type === 'text-generation') {
            const token: string = data.text ?? ''
            if (token) {
              full += token
              onChunk(full)
            }
          }
        } catch {
          // ignore
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return full
}

// ─── Non-Streaming Request (for expert judgment) ──────────────────────────

export async function callProviderNonStreaming(
  provider: ProviderId,
  apiModelId: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 3000,
): Promise<string> {
  const apiKey = getProviderKey(provider)
  if (!apiKey) throw new Error(`No API key for ${provider}`)

  if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: apiModelId,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err?.error?.message ?? `Anthropic error ${response.status}`)
    }
    const data = await response.json()
    return data.content?.map((c: any) => c.text ?? '').join('') ?? ''
  }

  // OpenAI-compatible (includes OpenAI for judgment)
  const endpoint = provider === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : provider === 'groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : provider === 'mistral'
    ? 'https://api.mistral.ai/v1/chat/completions'
    : provider === 'deepseek'
    ? 'https://api.deepseek.com/chat/completions'
    : 'https://api.openai.com/v1/chat/completions'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: apiModelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ''
}
