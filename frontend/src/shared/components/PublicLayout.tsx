import { Link, NavLink } from 'react-router-dom'
import { navItems } from '../constants'
import type { LayoutProps } from '../types'

export function PublicLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-sm">
              CM
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Kerala</p>
              <p className="text-sm font-bold text-slate-900">Grievance Portal</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
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
            <Link
              to="/citizen/login"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              Citizen Login
            </Link>
            <Link
              to="/track"
              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Track Status
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 bg-slate-900 text-slate-200">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-3 md:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">CM Kerala</p>
            <p className="mt-4 max-w-sm text-sm text-slate-300">
              A transparent, responsive grievance redressal platform designed to bring citizen concerns to the right offices quickly and fairly.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Chief Minister&apos;s Office</li>
              <li>Thiruvananthapuram, Kerala</li>
              <li>support@cmkerala.gov.in</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
