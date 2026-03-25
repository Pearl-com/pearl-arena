/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware semantic tokens (CSS custom properties — see index.css)
        'theme-bg':             'rgb(var(--color-bg-primary) / <alpha-value>)',
        'theme-surface':        'rgb(var(--color-bg-surface) / <alpha-value>)',
        'theme-card':           'rgb(var(--color-bg-card) / <alpha-value>)',
        'theme-card-hover':     'rgb(var(--color-bg-card-hover) / <alpha-value>)',
        'theme-text':           'rgb(var(--color-text-primary) / <alpha-value>)',
        'theme-text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'theme-muted':          'rgb(var(--color-text-muted) / <alpha-value>)',
        'theme-border':         'rgb(var(--color-border) / <alpha-value>)',
        'theme-overlay':        'rgb(var(--color-overlay) / <alpha-value>)',

        // Legacy aliases (point to CSS vars for backwards compat)
        'arena-bg':      'rgb(var(--color-bg-primary) / <alpha-value>)',
        'arena-surface': 'rgb(var(--color-bg-surface) / <alpha-value>)',
        'arena-card':    'rgb(var(--color-bg-card) / <alpha-value>)',
        'arena-border':  'rgb(var(--color-bg-card-hover) / <alpha-value>)',
        'arena-muted':   'rgb(var(--color-text-muted) / <alpha-value>)',

        // Domain accents (static — work on both themes)
        legal: '#6366F1',
        healthcare: '#06B6D4',
        veterinary: '#10B981',
        automotive: '#F59E0B',
        financial: '#8B5CF6',
        technical: '#EF4444',

        // Pearl brand (static)
        pearl: '#F5C842',
        'pearl-dark': '#E8A817',
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        display: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'score-bar': 'scoreBar 1s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typing': 'typing 0.1s steps(1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scoreBar: {
          from: { width: '0%' },
          to: { width: 'var(--score-width)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(245, 200, 66, 0.2)' },
          to: { boxShadow: '0 0 30px rgba(245, 200, 66, 0.5)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      gridTemplateColumns: {
        'auto-fill-300': 'repeat(auto-fill, minmax(300px, 1fr))',
      },
    },
  },
  plugins: [],
}
