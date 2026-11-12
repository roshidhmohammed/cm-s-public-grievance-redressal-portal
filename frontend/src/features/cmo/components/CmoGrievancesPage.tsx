import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { getGrievances } from '../../grievances/grievance.service'
import type { Grievance } from '../../grievances/grievance.types'
import { getApiErrorMessage } from '../../../lib/axios'
import { Button } from '../../../shared/components/Button'
import { CmoLayout } from '../../../shared/components/cmo/CmoLayout'
import { categories, districts, statuses } from '../../../shared/constants'

export default function CmoGrievancesPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getGrievances({
      status: statusFilter || undefined,
      district: districtFilter || undefined,
      category: categoryFilter || undefined,
      priority: priorityFilter || undefined,
      page,
      limit: 20,
    })
      .then((result) => {
        setGrievances(result.items)
        setTotal(result.total)
      })
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load grievances.')))
      .finally(() => setIsLoading(false))
  }, [statusFilter, districtFilter, categoryFilter, priorityFilter, page])

  const filteredGrievances = useMemo(
    () => grievances.filter((entry) => !search || entry.referenceNumber.toLowerCase().includes(search.toLowerCase())),
    [grievances, search],
  )

  return (
    <CmoLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">CMO portal</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">All grievances</h1>
          </div>
          <Link to="/cmo/dashboard"><Button variant="ghost">Back to dashboard</Button></Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <select
            value={statusFilter}
            onChange={(event) => { setIsLoading(true); setStatusFilter(event.target.value); setPage(1) }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            <option value="">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => { setIsLoading(true); setCategoryFilter(event.target.value); setPage(1) }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => { setIsLoading(true); setPriorityFilter(event.target.value); setPage(1) }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            <option value="">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            value={districtFilter}
            onChange={(event) => { setIsLoading(true); setDistrictFilter(event.target.value); setPage(1) }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            <option value="">All districts</option>
            {districts.map((district) => <option key={district} value={district}>{district}</option>)}
          </select>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reference on this page"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
            {isLoading ? 'Loading…' : `${total} records`}
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Reference ID</th>
                <th className="px-4 py-3 font-semibold text-slate-700">District</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Category</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Priority</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Submitted</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredGrievances.map((grievance) => (
                <tr key={grievance.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{grievance.referenceNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{grievance.district}</td>
                  <td className="px-4 py-3 text-slate-700">{grievance.category}</td>
                  <td className="px-4 py-3 text-slate-700">{grievance.priority}</td>
                  <td className="px-4 py-3 text-slate-700">{grievance.status}</td>
                  <td className="px-4 py-3 text-slate-700">{new Date(grievance.submittedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link to={`/cmo/grievances/${grievance.id}`} className="font-semibold text-emerald-700 hover:text-emerald-800">View record</Link>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredGrievances.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-slate-600" colSpan={7}>No grievances match these filters.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="secondary" disabled={page <= 1 || isLoading} onClick={() => { setIsLoading(true); setPage((value) => value - 1) }}>Previous</Button>
          <span className="text-sm text-slate-600">Page {page} of {Math.max(1, Math.ceil(total / 20))}</span>
          <Button variant="secondary" disabled={page * 20 >= total || isLoading} onClick={() => { setIsLoading(true); setPage((value) => value + 1) }}>Next</Button>
        </div>
      </div>
    </CmoLayout>
  )
}
