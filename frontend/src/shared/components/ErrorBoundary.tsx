import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <div>
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="mt-2 text-sm">Please refresh the page or return later.</p>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
