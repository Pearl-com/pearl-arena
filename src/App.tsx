import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { HomePage } from '@/pages/HomePage'
import { ArenaPage } from '@/pages/ArenaPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'

const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))
const BenchmarksPage = lazy(() => import('@/pages/BenchmarksPage').then(m => ({ default: m.BenchmarksPage })))
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then(m => ({ default: m.HistoryPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 rounded-full border-2 border-pearl/30 border-t-pearl animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col"
          style={{ fontFamily: '"DM Sans", "Segoe UI", sans-serif' }}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-pearl focus:text-black focus:font-semibold focus:text-sm"
          >
            Skip to content
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/arena" element={<ArenaPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/benchmarks" element={<BenchmarksPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
