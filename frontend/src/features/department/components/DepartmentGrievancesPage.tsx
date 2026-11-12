import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { getDepartmentGrievances } from '../services/department.service'
import type { Grievance } from '../../grievances/grievance.types'
import { getApiErrorMessage } from '../../../lib/axios'
import { Button } from '../../../shared/components/Button'
import { DepartmentLayout } from '../../../shared/components/department/DepartmentLayout'

export default function DepartmentGrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getDepartmentGrievances()
      .then(setGrievances)
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load assigned grievances.')))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <DepartmentLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Department officer</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Assigned grievances</h1>
          </div>
          <Link to="/department/dashboard">
            <Button variant="ghost">Back to dashboard</Button>
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Reference</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Subject</th>
                <th className="px-4 py-3 font-semibold text-slate-700">District</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {grievances.map((grievance) => (
                <tr key={grievance.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{grievance.referenceNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{grievance.subject}</td>
                  <td className="px-4 py-3 text-slate-700">{grievance.district}</td>
                  <td className="px-4 py-3 text-slate-700">{grievance.status}</td>
                  <td className="px-4 py-3">
                    <Link to={`/department/grievances/${grievance.id}`} className="font-semibold text-emerald-700 hover:text-emerald-800">
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && grievances.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-slate-600" colSpan={5}>No grievances are assigned to your department.</td></tr>
              ) : null}
              {isLoading ? <tr><td className="px-4 py-8 text-center text-slate-600" colSpan={5}>Loading assigned grievances…</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </DepartmentLayout>
  )
}
