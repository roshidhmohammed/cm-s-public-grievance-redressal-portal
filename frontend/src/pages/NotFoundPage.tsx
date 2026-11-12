import { Link } from 'react-router-dom'
import { Button } from '../shared/components/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">404</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist or has moved.</p>
        <div className="mt-6 flex justify-center">
          <Link to="/">
            <Button variant="primary">Back to home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
