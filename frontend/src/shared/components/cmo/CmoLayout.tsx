import { Link, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '../../../features/auth/auth.slice'
import { useAppDispatch } from '../../../app/store'
import { Button } from '../Button'
import { logout } from '../../../features/auth/auth.service'
import { getApiErrorMessage } from '../../../lib/axios'
import { toast } from 'sonner'
import type { LayoutProps } from '../../types'

const navItems = [
  { label: 'Dashboard', to: '/cmo/dashboard' },
  { label: 'All Grievances', to: '/cmo/grievances' },
  { label: 'Departments', to: '/cmo/departments' },
  { label: 'Administration', to: '/cmo/administration' },
]

export function CmoLayout({ children }: LayoutProps) {
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
          <Link to="/cmo/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
              CMO
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">Chief Minister</p>
              <p className="text-sm font-bold text-slate-900">Office</p>
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

          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
