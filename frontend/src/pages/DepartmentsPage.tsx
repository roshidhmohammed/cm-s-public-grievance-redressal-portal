import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getDepartments, type Department } from '../features/department/services/department-api.service'
import { getApiErrorMessage } from '../lib/http'
import { PublicLayout } from '../shared/components/PublicLayout'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load departments.')))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Departments</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Government departments</h1>

        {isLoading ? <p className="mt-8 text-slate-600">Loading departments…</p> : null}
        {!isLoading && departments.length === 0 ? <p className="mt-8 text-slate-600">No active departments are available.</p> : null}
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <div key={department.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
                {department.name.slice(0, 2).toUpperCase()}
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{department.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{department.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
