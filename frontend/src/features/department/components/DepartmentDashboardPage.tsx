import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DepartmentLayout } from '../../../shared/components/department/DepartmentLayout'
import { getDepartmentDashboardStats } from '../services/department.service'
import type { DepartmentDashboardStats } from '../types/department.types'
import { getApiErrorMessage } from '../../../lib/axios'

export default function DepartmentDashboardPage() {
  const [stats, setStats] = useState<DepartmentDashboardStats>({
    assignedGrievances: 0,
    pendingInvestigation: 0,
    underReview: 0,
    actionReportsSubmitted: 0,
    resolvedGrievances: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getDepartmentDashboardStats()
      .then(setStats)
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load department statistics.')))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <DepartmentLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Department overview</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Dashboard</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Assigned</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{isLoading ? '…' : stats.assignedGrievances}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending review</p>
            <p className="mt-3 text-3xl font-bold text-amber-600">{isLoading ? '…' : stats.pendingInvestigation}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Under review</p>
            <p className="mt-3 text-3xl font-bold text-sky-600">{isLoading ? '…' : stats.underReview}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Action reports</p>
            <p className="mt-3 text-3xl font-bold text-violet-600">{isLoading ? '…' : stats.actionReportsSubmitted}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{isLoading ? '…' : stats.resolvedGrievances}</p>
          </div>
        </div>
      </div>
    </DepartmentLayout>
  )
}
