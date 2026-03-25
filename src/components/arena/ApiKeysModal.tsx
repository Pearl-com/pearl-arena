import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  PROVIDERS,
  getProviderKey,
  setProviderKey,
  getConfiguredProviders,
  isProviderConfigured,
} from '@/lib/providers'
import type { ProviderId } from '@/lib/providers'
import {
  getPearlApiKey,
  setPearlApiKey,
  isPearlConfigured,
} from '@/lib/pearl-api'

const LLM_PROVIDER_ORDER: ProviderId[] = [
  'anthropic', 'openai', 'google', 'perplexity', 'deepseek', 'xai', 'groq', 'mistral', 'cohere',
]

const LLM_KEY_PLACEHOLDERS: Partial<Record<ProviderId, string>> = {
  anthropic:  'sk-ant-api03-...',
  openai:     'sk-proj-...',
  google:     'AIzaSy...',
  perplexity: 'pplx-...',
  deepseek:   'sk-...',
  xai:        'xai-...',
  groq:       'gsk_...',
  mistral:    '...',
  cohere:     '...',
}

interface ApiKeysModalProps {
  onClose: () => void
}

export function ApiKeysModal({ onClose }: ApiKeysModalProps) {
  const [llmKeys, setLlmKeys] = useState<Partial<Record<ProviderId, string>>>(() => {
    const init: Partial<Record<ProviderId, string>> = {}
    LLM_PROVIDER_ORDER.forEach(id => { const k = getProviderKey(id); if (k) init[id] = k })
    return init
  })
  const [pearlKey, setPearlKey] = useState(getPearlApiKey() ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    LLM_PROVIDER_ORDER.forEach(id => {
      const v = llmKeys[id]?.trim()
      if (v) setProviderKey(id, v)
    })
    if (pearlKey.trim()) setPearlApiKey(pearlKey.trim())
    setSaved(true)
    setTimeout(onClose, 700)
  }

  const pearlConfigured = isPearlConfigured() || !!pearlKey.trim()
  const llmConfigured = getConfiguredProviders().length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-theme-surface border border-theme-border rounded-2xl shadow-2xl my-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border/80">
          <div>
            <h2 className="text-[15px] font-semibold text-theme-text">Configure API Keys</h2>
            <p className="text-[11px] text-theme-muted/70 mt-0.5">
              Keys stay in memory — never sent to any server except each provider directly.
            </p>
          </div>
          <button onClick={onClose} className="text-theme-muted/70 hover:text-theme-muted text-lg transition" aria-label="Close">✕</button>
        </div>

        {/* Pearl API section */}
        <div className="px-6 pt-5 pb-4 border-b border-theme-border/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-pearl/20 border border-pearl/30 flex items-center justify-center text-xs text-pearl font-bold">✦</div>
            <span className="text-[13px] font-semibold text-pearl/90">Pearl API</span>
            {pearlConfigured
              ? <span className="text-[10px] text-green-400/70 ml-1">● connected</span>
              : <span className="text-[10px] text-yellow-400/60 ml-1">⚠ required for real expert judgment</span>
            }
          </div>

          <div>
            <label className="block text-[10px] text-theme-muted/70 mb-1 uppercase tracking-wider">Pearl API Key</label>
            <input
              type="password"
              placeholder="Bearer token — contact api@pearl.com"
              value={pearlKey}
              onChange={e => setPearlKey(e.target.value)}
              className="w-full bg-theme-overlay/[0.04] border border-pearl/15 focus:border-pearl/40 rounded-lg px-3.5 py-2 text-[12px] text-theme-text-secondary placeholder:text-theme-muted/50 focus:outline-none transition font-mono"
            />
          </div>

          <p className="text-[10px] text-theme-muted/50 mt-2">
            Pearl AI card → <code className="text-pearl/60">mode: pearl-ai</code> (RAG over expert Q&As) · Expert judge → <code className="text-pearl/60">mode: expert</code> (real licensed human)
          </p>
        </div>

        {/* LLM provider keys */}
        <div className="px-6 py-4 space-y-3 max-h-[40vh] overflow-y-auto">
          <p className="text-[10px] text-theme-muted/50 uppercase tracking-wider">LLM Provider Keys ({llmConfigured}/{LLM_PROVIDER_ORDER.length} configured)</p>
          {LLM_PROVIDER_ORDER.map(id => {
            const meta = PROVIDERS[id]
            const configured = isProviderConfigured(id) || !!(llmKeys[id]?.trim())
            return (
              <div key={id}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: configured ? '#22C55E' : 'rgba(255,255,255,0.15)' }} />
                  <span className="text-[11px] font-medium text-theme-muted">{meta.name}</span>
                  {configured && <span className="text-[9px] text-green-400/60">configured</span>}
                  {!configured && id === 'anthropic' && <span className="text-[9px] text-yellow-400/60">fallback for judging</span>}
                  <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-[9px] text-theme-muted/50 hover:text-theme-muted transition">
                    Get key →
                  </a>
                </div>
                <input
                  type="password"
                  placeholder={LLM_KEY_PLACEHOLDERS[id] ?? '...'}
                  value={llmKeys[id] ?? ''}
                  onChange={e => setLlmKeys(prev => ({ ...prev, [id]: e.target.value }))}
                  className="w-full bg-theme-overlay/[0.04] border border-theme-border/80 rounded-lg px-3 py-1.5 text-[11px] text-theme-text-secondary placeholder:text-theme-muted/30 focus:outline-none focus:border-theme-border transition font-mono"
                />
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border/80 flex items-center justify-between">
          <p className="text-[10px] text-theme-muted/50">
            LLM keys not set → Anthropic simulation fallback.
          </p>
          <Button variant="pearl" size="sm" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save Keys'}
          </Button>
        </div>
      </div>
    </div>
  )
}
