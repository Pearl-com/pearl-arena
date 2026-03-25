import type { ProviderId, ModelProviderConfig } from './providers'

// ─── Domain Configuration ──────────────────────────────────────────────────

export const DOMAINS = [
  { id: 'legal',      label: 'Legal',      icon: '⚖️',  color: '#6366F1', bgColor: 'rgba(99,102,241,0.1)',   expert: 'Licensed Attorney',        expertShort: 'Attorney',     description: 'Case law, contracts, regulations, rights',         accent: 'from-indigo-500/20 to-indigo-900/5',   tailwindColor: 'indigo'  },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥',  color: '#06B6D4', bgColor: 'rgba(6,182,212,0.1)',    expert: 'Licensed Physician (MD/DO)', expertShort: 'Physician',     description: 'Symptoms, medications, screenings, procedures',    accent: 'from-cyan-500/20 to-cyan-900/5',       tailwindColor: 'cyan'    },
  { id: 'veterinary', label: 'Veterinary', icon: '🐾',  color: '#10B981', bgColor: 'rgba(16,185,129,0.1)',   expert: 'Licensed Veterinarian (DVM)',expertShort: 'Veterinarian', description: 'Pet health, toxins, nutrition, emergencies',       accent: 'from-emerald-500/20 to-emerald-900/5', tailwindColor: 'emerald' },
  { id: 'automotive', label: 'Automotive', icon: '🔧',  color: '#F59E0B', bgColor: 'rgba(245,158,11,0.1)',   expert: 'ASE-Certified Mechanic',    expertShort: 'Mechanic',      description: 'Repairs, maintenance, diagnostics, safety',        accent: 'from-amber-500/20 to-amber-900/5',     tailwindColor: 'amber'   },
  { id: 'financial',  label: 'Financial',  icon: '📊',  color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.1)',   expert: 'CPA / CFP Financial Advisor',expertShort: 'CPA/CFP',      description: 'Taxes, investments, retirement, planning',         accent: 'from-violet-500/20 to-violet-900/5',   tailwindColor: 'violet'  },
  { id: 'technical',  label: 'Technical',  icon: '💻',  color: '#EF4444', bgColor: 'rgba(239,68,68,0.1)',    expert: 'Senior Software Engineer',  expertShort: 'Engineer',      description: 'Architecture, security, algorithms, DevOps',       accent: 'from-red-500/20 to-red-900/5',         tailwindColor: 'red'     },
] as const

export type DomainId = (typeof DOMAINS)[number]['id']

// ─── Model Configuration ──────────────────────────────────────────────────
// Fields: id, name, shortName, provider (display), color, letter,
//   description, releaseDate, paramCount,
//   apiProvider (routing), apiModelId (API name), group (selector grouping),
//   isNew, isReasoning, hasSearch (UI badges)

export const MODELS = [

  // ── OpenAI ──────────────────────────────────────────────────────────────
  { id:'gpt54',          name:'GPT-5.4',            shortName:'GPT-5.4',    provider:'OpenAI',      color:'#10A37F', letter:'G5',  description:"OpenAI's newest frontier model — 1M context, strongest reasoning and coding",    releaseDate:'2026-03', paramCount:'Unknown',          apiProvider:'openai'     as ProviderId, apiModelId:'gpt-5.4',                                   group:'openai',     isNew:true,  isReasoning:true,  hasSearch:false },
  { id:'gpt54mini',      name:'GPT-5.4 Mini',       shortName:'5.4 Mini',   provider:'OpenAI',      color:'#10A37F', letter:'Gm',  description:'GPT-5.4-class in a faster, cheaper form — 400K context, high-volume ready',      releaseDate:'2026-03', paramCount:'Unknown',          apiProvider:'openai'     as ProviderId, apiModelId:'gpt-5.4-mini',                              group:'openai',     isNew:true,  isReasoning:true,  hasSearch:false },
  { id:'gpt41',          name:'GPT-4.1',            shortName:'GPT-4.1',    provider:'OpenAI',      color:'#10A37F', letter:'G',   description:'1M context, top-tier coding and instruction following — best value workhorse',   releaseDate:'2025-04', paramCount:'~200B',            apiProvider:'openai'     as ProviderId, apiModelId:'gpt-4.1',                                   group:'openai',     isNew:false, isReasoning:false, hasSearch:false },
  { id:'gpt4o',          name:'GPT-4o',             shortName:'GPT-4o',     provider:'OpenAI',      color:'#10A37F', letter:'G',   description:'Multimodal model — vision, voice and text, still widely used and cost-effective', releaseDate:'2024-05', paramCount:'~200B',            apiProvider:'openai'     as ProviderId, apiModelId:'gpt-4o',                                    group:'openai',     isNew:false, isReasoning:false, hasSearch:false },
  { id:'o3',             name:'o3',                 shortName:'o3',         provider:'OpenAI',      color:'#7C3AED', letter:'o3',  description:"OpenAI's frontier reasoning model — chain-of-thought for the hardest problems",  releaseDate:'2025-04', paramCount:'Unknown',          apiProvider:'openai'     as ProviderId, apiModelId:'o3',                                        group:'openai',     isNew:false, isReasoning:true,  hasSearch:false },
  { id:'o4mini',         name:'o4-mini',            shortName:'o4-mini',    provider:'OpenAI',      color:'#6D28D9', letter:'o4m', description:'Fast, cost-efficient reasoning — best AIME benchmark scores, great for STEM',    releaseDate:'2025-04', paramCount:'Unknown',          apiProvider:'openai'     as ProviderId, apiModelId:'o4-mini',                                   group:'openai',     isNew:false, isReasoning:true,  hasSearch:false },

  // ── Anthropic ────────────────────────────────────────────────────────────
  { id:'claude-opus',    name:'Claude Opus 4.6',   shortName:'Opus 4.6',   provider:'Anthropic',   color:'#F59E0B', letter:'Co',  description:"Anthropic's most powerful — deep analysis, nuanced reasoning, 200K context",    releaseDate:'2026-01', paramCount:'Unknown',          apiProvider:'anthropic'  as ProviderId, apiModelId:'claude-opus-4-6',                           group:'anthropic',  isNew:true,  isReasoning:false, hasSearch:false },
  { id:'claude',         name:'Claude Sonnet 4.6', shortName:'Sonnet 4.6', provider:'Anthropic',   color:'#D97706', letter:'C',   description:"Anthropic's balanced model — nuanced, honest, safety-focused, highly capable",   releaseDate:'2026-01', paramCount:'Unknown',          apiProvider:'anthropic'  as ProviderId, apiModelId:'claude-sonnet-4-6',                         group:'anthropic',  isNew:true,  isReasoning:false, hasSearch:false },
  { id:'claude-haiku',   name:'Claude Haiku 4.5',  shortName:'Haiku 4.5',  provider:'Anthropic',   color:'#F59E0B', letter:'Ch',  description:'Lightning-fast Anthropic model — snappy, accurate, low-cost for quick queries',  releaseDate:'2025-10', paramCount:'Unknown',          apiProvider:'anthropic'  as ProviderId, apiModelId:'claude-haiku-4-5',                          group:'anthropic',  isNew:false, isReasoning:false, hasSearch:false },

  // ── Google ───────────────────────────────────────────────────────────────
  { id:'gemini25pro',    name:'Gemini 2.5 Pro',    shortName:'Gemini 2.5', provider:'Google',      color:'#4285F4', letter:'Ge',  description:"Google's most capable — 1M context, Deep Think reasoning, multimodal",          releaseDate:'2025-03', paramCount:'Unknown',          apiProvider:'google'     as ProviderId, apiModelId:'gemini-2.5-pro',                            group:'google',     isNew:false, isReasoning:false, hasSearch:false },
  { id:'gemini25flash',  name:'Gemini 2.5 Flash',  shortName:'Flash 2.5',  provider:'Google',      color:'#34A853', letter:'Gf',  description:'Speed-optimized Gemini 2.5 — near Pro quality at 5× lower cost and latency',    releaseDate:'2025-05', paramCount:'Unknown',          apiProvider:'google'     as ProviderId, apiModelId:'gemini-2.5-flash',                          group:'google',     isNew:false, isReasoning:false, hasSearch:false },
  { id:'gemini20flash',  name:'Gemini 2.0 Flash',  shortName:'Flash 2.0',  provider:'Google',      color:'#0F9D58', letter:'G2',  description:'Rock-solid Google workhorse — proven speed and reliability for everyday tasks',   releaseDate:'2025-02', paramCount:'Unknown',          apiProvider:'google'     as ProviderId, apiModelId:'gemini-2.0-flash',                          group:'google',     isNew:false, isReasoning:false, hasSearch:false },

  // ── Perplexity ───────────────────────────────────────────────────────────
  { id:'sonar-pro',      name:'Sonar Pro',          shortName:'Sonar Pro',  provider:'Perplexity',  color:'#20B2AA', letter:'S',   description:'Real-time web search + LLM synthesis — always up-to-date, cited answers',      releaseDate:'2025-01', paramCount:'Unknown',          apiProvider:'perplexity' as ProviderId, apiModelId:'sonar-pro',                                 group:'perplexity', isNew:false, isReasoning:false, hasSearch:true  },
  { id:'sonar-reasoning',name:'Sonar Reasoning Pro',shortName:'Sonar R',    provider:'Perplexity',  color:'#00CED1', letter:'Sr',  description:'Search-grounded reasoning — chain-of-thought plus live web citations',           releaseDate:'2025-03', paramCount:'Unknown',          apiProvider:'perplexity' as ProviderId, apiModelId:'sonar-reasoning-pro',                       group:'perplexity', isNew:true,  isReasoning:true,  hasSearch:true  },

  // ── DeepSeek ─────────────────────────────────────────────────────────────
  { id:'deepseek',       name:'DeepSeek V3',        shortName:'DeepSeek',   provider:'DeepSeek',    color:'#06B6D4', letter:'D',   description:'671B MoE open-source — top-tier coding and technical reasoning at minimal cost', releaseDate:'2024-12', paramCount:'671B MoE',         apiProvider:'deepseek'   as ProviderId, apiModelId:'deepseek-chat',                             group:'deepseek',   isNew:false, isReasoning:false, hasSearch:false },
  { id:'deepseek-r1',    name:'DeepSeek R1',        shortName:'R1',         provider:'DeepSeek',    color:'#0891B2', letter:'R1',  description:'Open-source reasoning powerhouse — explicit chain-of-thought, elite at math',    releaseDate:'2025-01', paramCount:'671B MoE',         apiProvider:'deepseek'   as ProviderId, apiModelId:'deepseek-reasoner',                         group:'deepseek',   isNew:false, isReasoning:true,  hasSearch:false },

  // ── xAI ──────────────────────────────────────────────────────────────────
  { id:'grok',           name:'Grok 3',             shortName:'Grok 3',     provider:'xAI',         color:'#E5E7EB', letter:'Gr',  description:"xAI's frontier model — direct, no-nonsense, real-time knowledge integration",   releaseDate:'2025-02', paramCount:'Unknown',          apiProvider:'xai'        as ProviderId, apiModelId:'grok-3',                                    group:'xai',        isNew:false, isReasoning:false, hasSearch:false },
  { id:'grok-mini',      name:'Grok 3 Mini',        shortName:'Grok Mini',  provider:'xAI',         color:'#9CA3AF', letter:'Gm',  description:'Lightweight Grok for fast factual lookups — snappy with minimal hedging',       releaseDate:'2025-02', paramCount:'Unknown',          apiProvider:'xai'        as ProviderId, apiModelId:'grok-3-mini',                               group:'xai',        isNew:false, isReasoning:false, hasSearch:false },

  // ── Meta (via Groq fast inference) ───────────────────────────────────────
  { id:'llama',          name:'Llama 4 Scout',      shortName:'Llama 4',    provider:'Meta · Groq', color:'#7C3AED', letter:'Ll',  description:"Meta's latest MoE open-source model served at blazing Groq LPU speed",        releaseDate:'2025-04', paramCount:'17B / 109B MoE',   apiProvider:'groq'       as ProviderId, apiModelId:'meta-llama/llama-4-scout-17b-16e-instruct', group:'meta',       isNew:false, isReasoning:false, hasSearch:false },
  { id:'llama33',        name:'Llama 3.3 70B',      shortName:'Llama 3.3',  provider:'Meta · Groq', color:'#6D28D9', letter:'L3',  description:"Meta's battle-tested 70B — reliable, instruction-tuned, ultra-low latency",     releaseDate:'2024-12', paramCount:'70B',              apiProvider:'groq'       as ProviderId, apiModelId:'llama-3.3-70b-versatile',                  group:'meta',       isNew:false, isReasoning:false, hasSearch:false },

  // ── Mistral ───────────────────────────────────────────────────────────────
  { id:'mistral-large',  name:'Mistral Large',      shortName:'Mistral',    provider:'Mistral AI',  color:'#FF7000', letter:'M',   description:'European flagship — multilingual, strong at coding and STEM reasoning',         releaseDate:'2025-11', paramCount:'~123B',            apiProvider:'mistral'    as ProviderId, apiModelId:'mistral-large-latest',                      group:'mistral',    isNew:false, isReasoning:false, hasSearch:false },
  { id:'magistral',      name:'Magistral Medium',   shortName:'Magistral',  provider:'Mistral AI',  color:'#FF9500', letter:'Mg',  description:"Mistral's reasoning model — slow-thinking, logic-first for hard problems",      releaseDate:'2025-06', paramCount:'Unknown',          apiProvider:'mistral'    as ProviderId, apiModelId:'magistral-medium-latest',                   group:'mistral',    isNew:true,  isReasoning:true,  hasSearch:false },

  // ── Cohere ────────────────────────────────────────────────────────────────
  { id:'command-a',      name:'Command A',          shortName:'Cmd A',      provider:'Cohere',      color:'#39594D', letter:'Ca',  description:"Cohere's latest enterprise model — 256K context, RAG-optimized, highly efficient",releaseDate:'2025-03', paramCount:'111B',             apiProvider:'cohere'     as ProviderId, apiModelId:'command-a-03-2025',                         group:'cohere',     isNew:true,  isReasoning:false, hasSearch:false },

] as const

export type ModelId = (typeof MODELS)[number]['id'] | 'pearl'

// ─── Pearl AI ─────────────────────────────────────────────────────────────

export const PEARL_MODEL = {
  id: 'pearl', name: 'Pearl AI', shortName: 'Pearl', provider: 'Pearl',
  color: '#F5C842', letter: '✦', description: 'RAG-powered AI grounded in millions of real expert Q&As for higher accuracy',
  releaseDate: '2024', paramCount: 'RAG',
  apiProvider: 'anthropic' as ProviderId, apiModelId: 'claude-sonnet-4-6',
  group: 'pearl', isNew: false, isReasoning: false, hasSearch: true,
} as const

// ─── Provider Config Resolver ─────────────────────────────────────────────

export function getModelProviderConfig(modelId: string): ModelProviderConfig {
  if (modelId === 'pearl') {
    return { modelId: 'pearl', apiProvider: 'anthropic', apiModelId: 'claude-sonnet-4-6', maxTokens: 1200 }
  }
  const m = MODELS.find(m => m.id === modelId)
  if (!m) throw new Error(`Unknown model: ${modelId}`)
  return { modelId: m.id, apiProvider: m.apiProvider, apiModelId: m.apiModelId, maxTokens: 1024, supportsSystem: true }
}

// ─── Provider Group UI Labels ─────────────────────────────────────────────

export const PROVIDER_GROUPS: Record<string, { label: string; color: string }> = {
  openai:    { label: 'OpenAI',     color: '#10A37F' },
  anthropic: { label: 'Anthropic',  color: '#D97706' },
  google:    { label: 'Google',     color: '#4285F4' },
  perplexity:{ label: 'Perplexity', color: '#20B2AA' },
  deepseek:  { label: 'DeepSeek',   color: '#06B6D4' },
  xai:       { label: 'xAI',        color: '#E5E7EB' },
  meta:      { label: 'Meta · Groq',color: '#7C3AED' },
  mistral:   { label: 'Mistral AI', color: '#FF7000' },
  cohere:    { label: 'Cohere',     color: '#39594D' },
}

// ─── Example Questions ────────────────────────────────────────────────────

export const EXAMPLE_QUESTIONS: Record<DomainId, string[]> = {
  legal:      [ 'Can a landlord increase rent mid-lease in California?', 'Is a verbal agreement legally binding for amounts over $500?', 'What constitutes fair use for AI-generated content?', 'Can my employer require me to sign a non-compete after being hired?', 'Statute of limitations for personal injury claims in Texas?' ],
  healthcare: [ 'What are warning signs that a headache requires emergency care?', 'Can you take ibuprofen with blood pressure medication?', "What's the recommended screening schedule for colon cancer?", 'What are the early warning signs of type 2 diabetes?', 'Is it safe to take melatonin with SSRIs?' ],
  veterinary: [ 'My dog ate chocolate 2 hours ago — what should I do?', 'Is grain-free food actually harmful for dogs?', 'What causes sudden lethargy in a 3-year-old cat?', 'How often should I take my healthy adult dog to the vet?', 'What human foods are toxic to cats?' ],
  automotive: [ 'My car makes a grinding noise when braking. How urgent is this?', 'Is it safe to drive with the check engine light on?', 'How often should transmission fluid be changed in a 2020 Honda Civic?', 'What causes a car to pull to one side while braking?', 'When should I replace my timing belt vs timing chain?' ],
  financial:  [ 'Can I deduct home office expenses as a W-2 employee?', 'Should I convert my traditional IRA to a Roth at age 55?', "What's the tax implication of selling stock held less than a year?", 'How much should I have in an emergency fund?', 'Is it better to pay off student loans or invest in a 401k?' ],
  technical:  [ "What's the difference between horizontal and vertical scaling?", 'When should I use a message queue vs direct API calls?', 'How do I prevent SQL injection in a Node.js application?', 'What are the tradeoffs between REST and GraphQL?', 'How do I handle distributed transactions across microservices?' ],
}

// ─── Model Personas (Anthropic simulation fallback) ───────────────────────

export const MODEL_PERSONAS: Record<string, string> = {
  // OpenAI
  gpt41:              "You are simulating GPT-4.1. Be precise, detailed, follow instructions exactly. Excel at reasoning and complex coding tasks. Slightly formal but clear. Deliver structured, thorough answers.",
  gpt4o:              "You are simulating GPT-4o. Helpful, balanced, and thorough across text, code, and analysis. Slightly formal but accessible. Provide comprehensive, well-organized answers.",
  o3:                 "You are simulating o3, OpenAI's frontier reasoning model. Take time to reason through problems step by step before answering. Show your chain of thought for complex questions. Methodical, rigorous, and precise.",
  o3mini:             "You are simulating o3-mini, an OpenAI reasoning model. Think step by step. Show reasoning clearly for multi-part problems. Fast and cost-efficient while staying methodical.",
  // Anthropic
  'claude-opus':      "You are simulating Claude Opus 4.6 by Anthropic. Highly analytical and thorough. Handle deep nuance, complexity, and ambiguity with care. Produce long-form reasoning when the question warrants it. Always honest about uncertainty.",
  claude:             "You are simulating Claude Sonnet 4.6 by Anthropic. Thoughtful, nuanced, and honest about uncertainty. Acknowledge limitations proactively. Warm yet direct style. Flag important caveats without being overly cautious.",
  'claude-haiku':     "You are simulating Claude Haiku 4.5 by Anthropic. Fast and snappy. Prioritize conciseness and clarity. Give accurate, direct answers without excessive hedging. Skip preamble and get to the point.",
  // Google
  gemini25pro:        "You are simulating Gemini 2.5 Pro by Google. Informative and well-structured. Use clear sections and headings when helpful. Bring multiple perspectives. Excellent multi-step and logical reasoning.",
  gemini25flash:      "You are simulating Gemini 2.5 Flash by Google. Speed-optimized but highly capable. Balance brevity with accuracy. Use structure when it adds clarity. Near-Pro quality at faster pace.",
  gemini20flash:      "You are simulating Gemini 2.0 Flash by Google. Fast and efficient. Concise without sacrificing correctness. Get to the answer quickly, expand only when truly necessary.",
  // Perplexity
  'sonar-pro':        "You are simulating Perplexity Sonar Pro, search-grounded AI. Reference current, up-to-date information. Note when something may have changed recently. Cite sources naturally in your response.",
  'sonar-reasoning':  "You are simulating Perplexity Sonar Reasoning Pro. Combine live web search with explicit chain-of-thought reasoning. Think through the problem while referencing current knowledge and citing sources.",
  // DeepSeek
  deepseek:           "You are simulating DeepSeek V3. Concise and technically precise. Focus on factual accuracy and correctness. Straightforward, efficient style — especially strong at coding and technical reasoning.",
  'deepseek-r1':      "You are simulating DeepSeek R1. Think step by step and show your reasoning explicitly. Work through problems methodically before stating the final answer. Particularly strong at math and logic.",
  // xAI
  grok:               "You are simulating Grok 3 by xAI. Direct and occasionally opinionated. Don't hedge excessively or add unnecessary disclaimers. Give clear, confident answers. Occasional dry wit. Skeptical of conventional wisdom when warranted.",
  'grok-mini':        "You are simulating Grok 3 Mini by xAI. Fast and factual. Keep answers short unless depth is truly needed. Direct and no-nonsense. Skip the boilerplate.",
  // Meta via Groq
  llama:              "You are simulating Llama 4 Scout by Meta, served via Groq LPUs. Helpful, practical, and well-rounded. Good general knowledge across domains. Accessible explanations. Very fast inference.",
  llama33:            "You are simulating Llama 3.3 70B by Meta, served via Groq LPUs. Reliable and instruction-following. Well-rounded responses. Strong at following complex multi-step instructions precisely.",
  // Mistral
  'mistral-large':    "You are simulating Mistral Large by Mistral AI. Precise and multilingual-aware. Strong at coding and STEM tasks. Bring a European/global data perspective when relevant. Structured and technically rigorous.",
  magistral:          "You are simulating Magistral Medium by Mistral AI. You are a reasoning model — think slowly and carefully before answering. Work through logical steps explicitly. Especially strong at math, logic, and multi-step analysis.",
  // Cohere
  'command-a':        "You are simulating Command A by Cohere. Optimized for retrieval-augmented tasks and enterprise workflows. Cite-style reasoning when presenting multiple facts. Concise, structured, and highly accurate at 256K context.",
}

// ─── Scoring Weights ─────────────────────────────────────────────────────

export const SCORING_WEIGHTS = {
  accuracy: 0.35, completeness: 0.25, safety: 0.20, clarity: 0.10, trustworthiness: 0.10,
}

// ─── Nav Links ───────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { href: '/arena',       label: 'Arena',       icon: '⚔️' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/analytics',   label: 'Analytics',   icon: '📈' },
  { href: '/benchmarks',  label: 'Benchmarks',  icon: '🎯' },
  { href: '/history',     label: 'History',     icon: '📜' },
]
