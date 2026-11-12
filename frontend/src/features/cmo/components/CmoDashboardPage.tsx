import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CmoLayout } from '../../../shared/components/cmo/CmoLayout'
import { getCmoDashboardStats } from '../services/cmo.service'
import type { CmoDashboardStats } from '../types/cmo.types'
import { getApiErrorMessage } from '../../../lib/axios'

const pieColors = ['#0f172a', '#10b981', '#f59e0b', '#64748b', '#e2e8f0']
const emptyStats: CmoDashboardStats = {
  totalGrievances: 0,
  pendingGrievances: 0,
  resolvedGrievances: 0,
  overdueGrievances: 0,
  districtStats: [],
  departmentStats: [],
  statusDistribution: [],
}

export default function CmoDashboardPage() {
  const [stats, setStats] = useState(emptyStats)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCmoDashboardStats()
      .then(setStats)
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load dashboard statistics.')))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CmoLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">CMO overview</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Dashboard</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total grievances</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{isLoading ? '…' : stats.totalGrievances}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-3 text-3xl font-bold text-amber-600">{isLoading ? '…' : stats.pendingGrievances}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{isLoading ? '…' : stats.resolvedGrievances}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="mt-3 text-3xl font-bold text-rose-600">{isLoading ? '…' : stats.overdueGrievances}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">District-wise statistics</h2>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.districtStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="district" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Status distribution</h2>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="count" data={stats.statusDistribution} nameKey="status" outerRadius={84} innerRadius={28}>
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell key={`${entry.status}-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Department-wise volume</h2>
          <div className="mt-6 space-y-4">
            {stats.departmentStats.map((entry) => (
              <div key={entry.department}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
                  <span>{entry.department}</span>
                  <span>{entry.count}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-emerald-600"
                    style={{ width: `${(entry.count / stats.totalGrievances) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CmoLayout>
  )
}
