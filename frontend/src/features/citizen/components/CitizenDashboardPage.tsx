import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { getGrievances } from '../../grievances/grievance.service'
import type { Grievance } from '../../grievances/grievance.types'
import { getApiErrorMessage } from '../../../lib/http'
import { Button } from '../../../shared/components/Button'
import { CitizenLayout } from '../../../shared/components/citizen/CitizenLayout'

export default function CitizenDashboardPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getGrievances({ page: 1, limit: 100 })
      .then(({ items }) => setGrievances(items))
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load your grievances.')))
      .finally(() => setIsLoading(false))
  }, [])

  const total = grievances.length
  const pending = grievances.filter((entry) => !['RESOLVED', 'REJECTED'].includes(entry.status)).length
  const resolved = grievances.filter((entry) => entry.status === 'RESOLVED').length

  return (
    <CitizenLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Citizen dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Your grievances</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/citizen/submit"><Button>Submit grievance</Button></Link>
            <Link to="/citizen/track"><Button variant="secondary">Track grievance</Button></Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total submitted</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{isLoading ? '…' : total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-3 text-3xl font-bold text-amber-600">{isLoading ? '…' : pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{isLoading ? '…' : resolved}</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Recent grievances</h2>
            <Link to="/citizen/track" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">View all</Link>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-600">Loading grievances…</p>
          ) : grievances.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-600">You have not submitted any grievances yet.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Reference</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Subject</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {grievances.map((grievance) => (
                    <tr key={grievance.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">{grievance.referenceNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{grievance.subject}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{grievance.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{new Date(grievance.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CitizenLayout>
  )
}
