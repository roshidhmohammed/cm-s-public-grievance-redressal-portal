import { Link } from 'react-router-dom'
import { Button } from '../shared/components/Button'

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Access denied</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">You do not have permission to view this page.</h1>
        <p className="mt-3 text-slate-600">Your account role is not allowed to access the requested portal section.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/">
            <Button variant="primary">Return home</Button>
          </Link>
          <Link to="/citizen/login">
            <Button variant="ghost">Login</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
