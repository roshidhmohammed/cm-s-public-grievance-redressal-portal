import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '../../../features/auth/auth.slice'
import { useAppDispatch } from '../../../app/store'
import { Button } from '../Button'
import { logout } from '../../../features/auth/auth.service'
import { getApiErrorMessage } from '../../../lib/http'
import { toast } from 'sonner'

const navItems = [
  { label: 'Dashboard', to: '/citizen/dashboard' },
  { label: 'Submit Grievance', to: '/citizen/submit' },
  { label: 'Track Grievance', to: '/citizen/track' },
  { label: 'Feedback', to: '/citizen/feedback' },
]

export function CitizenLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      dispatch(signOut())
      navigate('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to sign out.'))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/citizen/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white">
              CM
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Citizen</p>
              <p className="text-sm font-bold text-slate-900">Portal</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-emerald-700' : 'text-slate-700 hover:text-slate-900'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/" className="hidden text-sm font-medium text-slate-700 hover:text-slate-900 sm:inline">
              Visit public portal
            </Link>
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
