import type { LoadingSpinnerProps } from '../types'

export function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-sm font-medium text-slate-600">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
      <span>{label}</span>
    </div>
  )
}
