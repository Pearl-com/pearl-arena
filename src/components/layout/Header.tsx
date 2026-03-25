import { Link, useLocation } from 'react-router-dom'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTheme } from '@/lib/theme'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-lg text-theme-muted hover:text-pearl transition-colors duration-200"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

export function Header() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-bg/95 backdrop-blur-xl shadow-theme-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pearl to-pearl-dark flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-pearl/20">
              ✦
            </div>
            <div>
              <span className="font-bold text-theme-text text-[15px] tracking-tight">Pearl Arena</span>
              <span className="ml-2 hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-pearl/10 text-pearl/80 border border-pearl/20 font-medium">
                BETA
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => {
              const active = location.pathname === link.href || location.pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                    active
                      ? 'bg-theme-overlay/[0.08] text-theme-text'
                      : 'text-theme-muted hover:text-theme-text-secondary hover:bg-theme-overlay/[0.04]'
                  )}
                >
                  <span className="text-sm">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <a
              href="https://pearl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-theme-muted hover:text-theme-text-secondary transition border border-theme-border hover:border-pearl/30"
            >
              <span className="text-pearl text-xs">✦</span>
              Pearl.com
            </a>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-theme-muted hover:text-theme-text-secondary hover:bg-theme-overlay/[0.06] transition"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-theme-border bg-theme-bg px-4 py-3 flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV_LINKS.map(link => {
            const active = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                  active ? 'bg-theme-overlay/[0.08] text-theme-text' : 'text-theme-muted hover:text-theme-text-secondary'
                )}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
