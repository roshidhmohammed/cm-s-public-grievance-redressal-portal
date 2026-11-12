import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { AppRouter } from './app/router'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { LoadingSpinner } from './shared/components/LoadingSpinner'

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner label="Loading portal..." />}>
        <main className="min-h-screen bg-slate-50 text-slate-900">
          <AppRouter />
        </main>
        <Toaster richColors position="top-right" closeButton />
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
