import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-theme-border/70 bg-theme-bg mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-pearl text-sm">✦</span>
            <span className="text-theme-muted sm:text-sm">{/*  */}Pearl Arena</span>
            <span className="text-theme-muted/40 text-sm">—</span>
            <span className="text-theme-muted/60 text-xs">Expert-Judged LLM Benchmark</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/arena" className="text-xs text-theme-muted/60 hover:text-theme-muted transition">Arena</Link>
            <Link to="/leaderboard" className="text-xs text-theme-muted/60 hover:text-theme-muted transition">Leaderboard</Link>
            <Link to="/analytics" className="text-xs text-theme-muted/60 hover:text-theme-muted transition">Analytics</Link>
            <a href="https://pearl.com" target="_blank" rel="noopener noreferrer" className="text-xs text-theme-muted/60 hover:text-pearl/80 transition">
              Pearl.com →
            </a>
          </div>

          <div className="text-xs text-theme-muted/40">
            Powered by 12,000+ licensed experts · © 2025 Pearl
          </div>
        </div>
      </div>
    </footer>
  )
}
