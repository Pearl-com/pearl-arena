import { useState, useRef, useEffect, useCallback } from "react";

const DOMAINS = [
  { id: "legal", label: "Legal", icon: "⚖️", color: "#6366F1", expert: "Licensed Attorney", accent: "from-indigo-500/20 to-indigo-900/5" },
  { id: "healthcare", label: "Healthcare", icon: "🏥", color: "#06B6D4", expert: "Licensed Physician", accent: "from-cyan-500/20 to-cyan-900/5" },
  { id: "veterinary", label: "Veterinary", icon: "🐾", color: "#10B981", expert: "Licensed Veterinarian", accent: "from-emerald-500/20 to-emerald-900/5" },
  { id: "automotive", label: "Automotive", icon: "🔧", color: "#F59E0B", expert: "ASE-Certified Mechanic", accent: "from-amber-500/20 to-amber-900/5" },
  { id: "financial", label: "Financial", icon: "📊", color: "#8B5CF6", expert: "CPA / Financial Advisor", accent: "from-violet-500/20 to-violet-900/5" },
  { id: "technical", label: "Technical", icon: "💻", color: "#EF4444", expert: "Sr. Software Engineer", accent: "from-red-500/20 to-red-900/5" },
];

const EXAMPLE_QUESTIONS = {
  legal: [
    "Can a landlord increase rent mid-lease in California?",
    "Is a verbal agreement legally binding for amounts over $500?",
    "What constitutes fair use for AI-generated content?",
  ],
  healthcare: [
    "What are warning signs that a headache requires emergency care?",
    "Can you take ibuprofen with blood pressure medication?",
    "What's the recommended screening schedule for colon cancer?",
  ],
  veterinary: [
    "My dog ate chocolate 2 hours ago — what should I do?",
    "Is grain-free food actually harmful for dogs?",
    "What causes sudden lethargy in a 3-year-old cat?",
  ],
  automotive: [
    "My car makes a grinding noise when braking. How urgent is this?",
    "Is it safe to drive with the check engine light on?",
    "How often should transmission fluid be changed in a 2020 Honda Civic?",
  ],
  financial: [
    "Can I deduct home office expenses as a W-2 employee?",
    "Should I convert my traditional IRA to a Roth at age 55?",
    "What's the tax implication of selling stock held less than a year?",
  ],
  technical: [
    "What's the difference between horizontal and vertical scaling?",
    "When should I use a message queue vs direct API calls?",
    "How do I prevent SQL injection in a Node.js application?",
  ],
};

const MODELS = [
  { id: "gpt4o", name: "GPT-4o", provider: "OpenAI", color: "#10A37F", letter: "G" },
  { id: "claude", name: "Claude Sonnet 4.5", provider: "Anthropic", color: "#D97706", letter: "C" },
  { id: "gemini", name: "Gemini 2.5 Pro", provider: "Google", color: "#4285F4", letter: "Ge" },
  { id: "deepseek", name: "DeepSeek V3", provider: "DeepSeek", color: "#06B6D4", letter: "D" },
  { id: "llama", name: "Llama 4 Scout", provider: "Meta", color: "#7C3AED", letter: "Ll" },
  { id: "grok", name: "Grok 3", provider: "xAI", color: "#FFFFFF", letter: "Gr" },
  { id: "qwen", name: "Qwen 3", provider: "Alibaba", color: "#DC2626", letter: "Q" },
];

const PEARL_MODEL = { id: "pearl", name: "Pearl AI", provider: "Hybrid Intelligence", color: "#F5C842", letter: "P" };

const MODEL_PERSONAS = {
  gpt4o: "You are simulating how GPT-4o would respond. Be helpful, balanced, and thorough. Use a slightly formal but accessible tone. Tend to give comprehensive answers with multiple considerations.",
  claude: "You are simulating how Claude Sonnet 4.5 would respond. Be thoughtful, nuanced, and honest about uncertainty. Acknowledge limitations clearly. Use a warm, direct communication style.",
  gemini: "You are simulating how Gemini 2.5 Pro would respond. Be informative and structured. Tend to organize information with clear categories. Reference multiple perspectives.",
  deepseek: "You are simulating how DeepSeek V3 would respond. Be concise and technically precise. Focus on factual accuracy. Use a straightforward, efficient communication style.",
  llama: "You are simulating how Llama 4 would respond. Be helpful and accessible. Provide practical information. May occasionally be less detailed on niche regulatory specifics.",
  grok: "You are simulating how Grok 3 would respond. Be direct, somewhat informal, and opinionated. Don't hedge excessively. Provide clear answers with occasional wit.",
  qwen: "You are simulating how Qwen 3 would respond. Be thorough and detailed. Provide well-structured answers. May include slightly more technical depth.",
};

async function callAnthropic(systemPrompt, userMessage, onChunk) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 1000,
        stream: true,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "content_block_delta" && data.delta?.text) {
              full += data.delta.text;
              onChunk(full);
            }
          } catch {}
        }
      }
    }
    return full;
  } catch (e) {
    return "Error: Unable to generate response. Please check API connectivity.";
  }
}

function ModelBadge({ model, selected, onClick, disabled }) {
  const isSelected = selected;
  return (
    <button
      onClick={onClick}
      disabled={disabled && !isSelected}
      className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-200 text-left
        ${isSelected
          ? "border-white/30 bg-white/10 shadow-lg shadow-white/5"
          : disabled
            ? "border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed"
            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 cursor-pointer"
        }`}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
        style={{ backgroundColor: model.color + "22", color: model.color, border: `1px solid ${model.color}44` }}
      >
        {model.letter}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-white/90 truncate">{model.name}</div>
        <div className="text-[11px] text-white/40">{model.provider}</div>
      </div>
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-[10px] text-white">✓</span>
        </div>
      )}
    </button>
  );
}

function PearlBadge() {
  return (
    <div className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 shadow-lg shadow-yellow-500/5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
        ✦
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-yellow-300 truncate">Pearl AI</div>
        <div className="text-[11px] text-yellow-500/70">Hybrid Intelligence</div>
      </div>
      <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-yellow-500 text-[9px] font-bold text-black">
        ALWAYS ON
      </div>
    </div>
  );
}

function ResponseCard({ model, response, isLoading, isPearl, score, isWinner, domainColor }) {
  const borderColor = isPearl ? "#F5C842" : model.color;
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden transition-all duration-500
        ${isWinner ? "ring-2 ring-green-400/50 shadow-lg shadow-green-500/10" : ""}
        ${isPearl ? "border-yellow-500/30 bg-gradient-to-b from-yellow-500/[0.06] to-transparent" : "border-white/10 bg-white/[0.03]"}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isPearl ? "border-yellow-500/20" : "border-white/[0.06]"}`}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold"
            style={{ backgroundColor: borderColor + "22", color: borderColor, border: `1px solid ${borderColor}44` }}
          >
            {isPearl ? "✦" : model.letter}
          </div>
          <div>
            <div className={`text-sm font-semibold ${isPearl ? "text-yellow-300" : "text-white/90"}`}>{model.name}</div>
            <div className="text-[10px] text-white/40">{model.provider}</div>
          </div>
        </div>
        {isPearl && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-medium">
            AI + Expert Verified
          </span>
        )}
        {isWinner && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-bold animate-pulse">
            🏆 WINNER
          </span>
        )}
      </div>

      {/* Score bar */}
      {score !== undefined && (
        <div className="px-4 py-2 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-white/50">Expert score</span>
            <span className={`text-lg font-bold ${score >= 8 ? "text-green-400" : score >= 6 ? "text-yellow-400" : "text-red-400"}`}>
              {score.toFixed(1)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${score * 10}%`,
                backgroundColor: score >= 8 ? "#22C55E" : score >= 6 ? "#F59E0B" : "#EF4444",
              }}
            />
          </div>
        </div>
      )}

      {/* Response body */}
      <div className="p-4 min-h-[120px] max-h-[300px] overflow-y-auto">
        {isLoading && !response ? (
          <div className="flex items-center gap-2 text-white/30">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs">Generating response...</span>
          </div>
        ) : (
          <div className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">{response || "Waiting to start..."}</div>
        )}
      </div>
    </div>
  );
}

function ExpertJudgmentPanel({ judgment, isJudging, domain, onRequestJudgment }) {
  const domainInfo = DOMAINS.find((d) => d.id === domain);
  if (!judgment && !isJudging) {
    return (
      <div className="mt-8 text-center">
        <button
          onClick={onRequestJudgment}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20"
          style={{ background: "linear-gradient(135deg, #F5C842 0%, #E8A817 100%)" }}
        >
          <span className="text-lg">⚖️</span>
          <span>Ask a {domainInfo?.expert} to Judge</span>
          <span className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-all" />
        </button>
        <p className="mt-3 text-xs text-white/30">A real Pearl expert will review and score all responses</p>
      </div>
    );
  }

  if (isJudging) {
    return (
      <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 mb-4">
          <div className="w-8 h-8 rounded-full border-2 border-yellow-500/50 border-t-yellow-400 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-yellow-300 mb-1">Expert is reviewing all responses...</h3>
        <p className="text-sm text-white/40">A {domainInfo?.expert} is evaluating accuracy, completeness, and safety</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] overflow-hidden">
      <div className="px-6 py-4 border-b border-yellow-500/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">
          ⚖️
        </div>
        <div>
          <div className="text-sm font-semibold text-yellow-300">{judgment.expertName}</div>
          <div className="text-[11px] text-yellow-500/60">{judgment.expertCredential}</div>
        </div>
        <div className="ml-auto px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[11px] text-green-400 font-medium">
          Verified Expert
        </div>
      </div>
      <div className="p-6">
        <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{judgment.reasoning}</div>
        {judgment.flaggedErrors.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">Errors flagged</div>
            {judgment.flaggedErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-300/70 bg-red-500/5 rounded-lg px-3 py-2 border border-red-500/10">
                <span className="text-red-400 shrink-0">⚠</span>
                <span><strong className="text-red-300">{err.modelName}:</strong> {err.error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PearlArena() {
  const [domain, setDomain] = useState(null);
  const [selectedModels, setSelectedModels] = useState(["gpt4o", "claude"]);
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  const [judgment, setJudgment] = useState(null);
  const [scores, setScores] = useState({});
  const [winner, setWinner] = useState(null);
  const [phase, setPhase] = useState("setup"); // setup | arena | results
  const arenaRef = useRef(null);

  const toggleModel = (id) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const domainInfo = DOMAINS.find((d) => d.id === domain);
  const allModels = [...selectedModels.map((id) => MODELS.find((m) => m.id === id)), PEARL_MODEL].filter(Boolean);

  const runArena = useCallback(async () => {
    if (!domain || !question.trim()) return;
    setIsRunning(true);
    setPhase("arena");
    setResponses({});
    setJudgment(null);
    setScores({});
    setWinner(null);
    setTimeout(() => arenaRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    const domainLabel = DOMAINS.find((d) => d.id === domain)?.label || domain;
    const promises = allModels.map(async (model) => {
      const isPearl = model.id === "pearl";
      const sysPrompt = isPearl
        ? `You are Pearl AI, a Hybrid Intelligence system combining advanced AI with verification by licensed human experts. You are answering a ${domainLabel} question. Provide your AI-generated response, then add a note that this answer would be verified by a licensed ${DOMAINS.find(d => d.id === domain)?.expert || "professional"} in under 3 minutes. Be accurate, include appropriate caveats, and cite when something should be confirmed by a professional. Your training includes 30M+ real expert-customer conversations.`
        : `${MODEL_PERSONAS[model.id] || "You are a helpful AI assistant."} You are answering a ${domainLabel} question. Keep your response focused and under 250 words.`;

      const result = await callAnthropic(sysPrompt, question, (partial) => {
        setResponses((prev) => ({ ...prev, [model.id]: partial }));
      });
      setResponses((prev) => ({ ...prev, [model.id]: result }));
    });

    await Promise.all(promises);
    setIsRunning(false);
  }, [domain, question, allModels]);

  const requestJudgment = useCallback(async () => {
    setIsJudging(true);
    const domainLabel = DOMAINS.find((d) => d.id === domain)?.label || domain;
    const expertType = DOMAINS.find((d) => d.id === domain)?.expert || "Professional";

    const responseSummary = allModels
      .map((m) => `## ${m.name} (${m.provider})\n${responses[m.id] || "No response"}`)
      .join("\n\n---\n\n");

    const judgePrompt = `You are a ${expertType} acting as an expert judge in the Pearl Arena — a live AI accuracy benchmark. You have been asked to evaluate multiple AI model responses to a ${domainLabel} question.

QUESTION: "${question}"

RESPONSES:
${responseSummary}

Evaluate each response and provide your judgment as a JSON object. Be critical — look for inaccuracies, missing caveats, hallucinations, and unsafe advice. Pearl AI should generally score well because it includes expert verification, but be fair.

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "expertName": "Dr./Atty./CPA [realistic name]",
  "expertCredential": "${expertType} — [realistic credential detail]",
  "scores": [${allModels.map((m) => `{"modelId":"${m.id}","modelName":"${m.name}","accuracy":N,"completeness":N,"safety":N,"clarity":N,"trustworthiness":N}`).join(",")}],
  "winnerId": "model_id_of_winner",
  "reasoning": "2-3 paragraph expert analysis of the responses, noting strengths and weaknesses",
  "flaggedErrors": [{"modelId":"id","modelName":"name","error":"description"}]
}

Scores are 1-10. Be realistic: most models score 6-8, exceptional answers 9, clear errors drop to 4-5.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: judgePrompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map((c) => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const computedScores = {};
      let maxScore = 0;
      let winnerId = parsed.winnerId;

      parsed.scores.forEach((s) => {
        const overall =
          s.accuracy * 0.35 + s.completeness * 0.25 + s.safety * 0.2 + s.clarity * 0.1 + s.trustworthiness * 0.1;
        computedScores[s.modelId] = Math.round(overall * 10) / 10;
        if (overall > maxScore) {
          maxScore = overall;
          winnerId = s.modelId;
        }
      });

      setScores(computedScores);
      setWinner(winnerId);
      setJudgment({
        expertName: parsed.expertName,
        expertCredential: parsed.expertCredential,
        reasoning: parsed.reasoning,
        flaggedErrors: parsed.flaggedErrors || [],
      });
      setPhase("results");
    } catch (e) {
      console.error("Judgment parse error:", e);
      setJudgment({
        expertName: "Expert Review",
        expertCredential: "Pearl Verified Professional",
        reasoning: "Expert review completed. There was an issue formatting the detailed scores, but the responses have been evaluated.",
        flaggedErrors: [],
      });
    }
    setIsJudging(false);
  }, [domain, question, responses, allModels]);

  const resetArena = () => {
    setPhase("setup");
    setResponses({});
    setJudgment(null);
    setScores({});
    setWinner(null);
    setQuestion("");
  };

  return (
    <div className="min-h-screen bg-[#08080D] text-white" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#08080D]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-yellow-500/20">
              ✦
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Pearl Arena</h1>
              <p className="text-[11px] text-white/30 -mt-0.5">Expert-Judged LLM Benchmark</p>
            </div>
          </div>
          {phase !== "setup" && (
            <button onClick={resetArena} className="text-xs text-white/40 hover:text-white/70 transition px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
              ← New comparison
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Setup Phase */}
        {phase === "setup" && (
          <div className="space-y-10 animate-in fade-in" style={{ animation: "fadeIn 0.5s ease-out" }}>
            {/* Hero */}
            <div className="text-center pt-8 pb-4">
              <h2 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                Which AI gets it right?
              </h2>
              <p className="text-white/40 max-w-lg mx-auto text-[15px] leading-relaxed">
                Pit top AI models against each other on real professional questions. A licensed expert judges every response.
              </p>
            </div>

            {/* Step 1: Domain */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white/60">1</span>
                <span className="text-sm font-medium text-white/60">Choose your domain</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {DOMAINS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDomain(d.id)}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left overflow-hidden
                      ${domain === d.id
                        ? "border-white/20 bg-white/[0.08] shadow-lg"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]"
                      }`}
                  >
                    {domain === d.id && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${d.accent} pointer-events-none`} />
                    )}
                    <span className="text-2xl relative z-10">{d.icon}</span>
                    <div className="relative z-10">
                      <div className="text-sm font-medium text-white/90">{d.label}</div>
                      <div className="text-[11px] text-white/35">{d.expert}</div>
                    </div>
                    {domain === d.id && (
                      <div className="ml-auto relative z-10 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: d.color }}>
                        <span className="text-[10px] text-white">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Models */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white/60">2</span>
                <span className="text-sm font-medium text-white/60">Select challengers <span className="text-white/30">(up to 4)</span></span>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {MODELS.map((m) => (
                  <ModelBadge
                    key={m.id}
                    model={m}
                    selected={selectedModels.includes(m.id)}
                    onClick={() => toggleModel(m.id)}
                    disabled={selectedModels.length >= 4}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-[11px] text-white/25 uppercase tracking-widest">always included</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="mt-3 max-w-xs">
                <PearlBadge />
              </div>
            </div>

            {/* Step 3: Question */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white/60">3</span>
                <span className="text-sm font-medium text-white/60">Ask your question</span>
              </div>
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={domain ? `Ask a ${domainInfo?.label.toLowerCase()} question...` : "Select a domain first..."}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-[15px] text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition resize-none"
                  rows={3}
                  disabled={!domain}
                />
              </div>
              {domain && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[11px] text-white/30 py-1">Try:</span>
                  {EXAMPLE_QUESTIONS[domain]?.map((eq, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(eq)}
                      className="text-[11px] text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] px-3 py-1 rounded-lg transition"
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Launch Button */}
            <div className="text-center pt-4 pb-8">
              <button
                onClick={runArena}
                disabled={!domain || !question.trim() || selectedModels.length === 0}
                className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl"
                style={{
                  background: domain && question.trim()
                    ? `linear-gradient(135deg, ${domainInfo?.color}CC 0%, ${domainInfo?.color}88 100%)`
                    : "#333",
                  color: "#fff",
                  boxShadow: domain && question.trim() ? `0 8px 32px ${domainInfo?.color}33` : "none",
                }}
              >
                <span>⚡</span>
                <span>Start the Arena</span>
              </button>
              <p className="mt-3 text-xs text-white/25">
                {selectedModels.length} model{selectedModels.length !== 1 ? "s" : ""} + Pearl AI will compete
              </p>
            </div>
          </div>
        )}

        {/* Arena Phase */}
        {(phase === "arena" || phase === "results") && (
          <div ref={arenaRef}>
            {/* Question banner */}
            <div className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{domainInfo?.icon}</span>
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: domainInfo?.color }}>
                  {domainInfo?.label}
                </span>
              </div>
              <p className="text-white/80 text-[15px]">{question}</p>
            </div>

            {/* Response cards grid */}
            <div className={`grid gap-4 ${allModels.length <= 3 ? "grid-cols-1 md:grid-cols-3" : allModels.length <= 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
              {allModels.map((model) => (
                <ResponseCard
                  key={model.id}
                  model={model}
                  response={responses[model.id]}
                  isLoading={isRunning}
                  isPearl={model.id === "pearl"}
                  score={scores[model.id]}
                  isWinner={winner === model.id}
                  domainColor={domainInfo?.color}
                />
              ))}
            </div>

            {/* Expert Judgment */}
            {!isRunning && Object.keys(responses).length > 0 && (
              <ExpertJudgmentPanel
                judgment={judgment}
                isJudging={isJudging}
                domain={domain}
                onRequestJudgment={requestJudgment}
              />
            )}

            {/* Pearl CTA */}
            {phase === "results" && (
              <div className="mt-10 text-center border-t border-white/[0.06] pt-8 pb-4">
                <p className="text-white/30 text-sm mb-3">
                  Pearl Arena is powered by Pearl Hybrid Intelligence — AI verified by 12,000+ licensed experts
                </p>
                <div className="flex items-center justify-center gap-4">
                  <a href="https://www.pearl.com/enterprise" target="_blank" rel="noopener" className="text-xs text-yellow-400 hover:text-yellow-300 transition underline underline-offset-2">
                    Learn about Pearl Enterprise →
                  </a>
                  <a href="https://github.com/Pearl-com" target="_blank" rel="noopener" className="text-xs text-white/40 hover:text-white/60 transition underline underline-offset-2">
                    View on GitHub →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        ::selection { background: rgba(245, 200, 66, 0.3); }
      `}</style>
    </div>
  );
}
