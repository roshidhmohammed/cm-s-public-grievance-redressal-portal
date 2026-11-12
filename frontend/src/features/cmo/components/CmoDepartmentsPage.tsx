import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  assignOfficer,
  createDepartment,
  getDepartmentOfficers,
  getDepartments,
  getUnassignedOfficers,
  type Department,
} from '../../department/services/department-api.service'
import { getApiErrorMessage } from '../../../lib/http'
import { Button } from '../../../shared/components/Button'
import { CmoLayout } from '../../../shared/components/cmo/CmoLayout'

const fieldClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm'

export default function CmoDepartmentsPage() {
  const queryClient = useQueryClient()
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  })
  const officersQuery = useQuery({
    queryKey: ['unassigned-department-officers'],
    queryFn: getUnassignedOfficers,
  })
  const assignedOfficersQuery = useQuery({
    queryKey: ['department-officers', selectedDepartmentId],
    queryFn: () => getDepartmentOfficers(selectedDepartmentId),
    enabled: Boolean(selectedDepartmentId),
  })
  const departments = departmentsQuery.data ?? []
  const unassignedOfficers = officersQuery.data ?? []
  const selectedDepartment = departments.find((department) => department._id === selectedDepartmentId)

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: async ({ department, officer }) => {
      toast.success(officer
        ? `Department created and ${officer.fullName} assigned.`
        : 'Department created successfully.')
      setSelectedDepartmentId(department._id)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['departments'] }),
        queryClient.invalidateQueries({ queryKey: ['unassigned-department-officers'] }),
      ])
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to create the department.')),
  })

  const assignMutation = useMutation({
    mutationFn: (input: { departmentId: string; officerId: string }) =>
      assignOfficer(input.departmentId, input.officerId),
    onSuccess: async (officer, { departmentId }) => {
      toast.success(`${officer.fullName} assigned successfully.`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['unassigned-department-officers'] }),
        queryClient.invalidateQueries({ queryKey: ['department-officers', departmentId] }),
      ])
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to assign the officer.')),
  })

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const officerId = String(values.get('officerId') ?? '')
    createMutation.mutate({
      name: String(values.get('name') ?? ''),
      description: String(values.get('description') ?? ''),
      officerId: officerId || undefined,
    }, {
      onSuccess: () => form.reset(),
    })
  }

  const handleAssign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const officerId = String(values.get('officerId') ?? '')
    if (!selectedDepartmentId || !officerId) {
      toast.error('Select both a department and an unassigned officer.')
      return
    }
    assignMutation.mutate({ departmentId: selectedDepartmentId, officerId })
    event.currentTarget.reset()
  }

  return (
    <CmoLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">CMO portal</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Departments and officers</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Create departments and assign unassigned officers. Assignments are verified by the API before they are saved.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Add a department</h2>
            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Department name
                <input name="name" required minLength={2} maxLength={120} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea name="description" required minLength={10} maxLength={500} rows={4} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Assign an unassigned officer (optional)
                <select name="officerId" defaultValue="" className={fieldClass}>
                  <option value="">Create without an officer</option>
                  {unassignedOfficers.map((officer) => (
                    <option key={officer._id} value={officer._id}>
                      {officer.fullName} — {officer.email}
                    </option>
                  ))}
                </select>
                {!officersQuery.isLoading && unassignedOfficers.length === 0 ? (
                  <span className="mt-1 block text-xs text-slate-500">No unassigned officers are currently available.</span>
                ) : null}
                {officersQuery.error ? (
                  <span className="mt-1 block text-xs text-red-600">
                    {getApiErrorMessage(officersQuery.error, 'Could not load unassigned officers.')}
                  </span>
                ) : null}
              </label>
              <Button type="submit" disabled={createMutation.isPending || departmentsQuery.isLoading}>
                {createMutation.isPending ? 'Creating…' : 'Create department'}
              </Button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Assign an unassigned officer</h2>
            <form onSubmit={handleAssign} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Department
                <select
                  required
                  value={selectedDepartmentId}
                  onChange={(event) => setSelectedDepartmentId(event.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select a department</option>
                  {departments.map((department: Department) => (
                    <option key={department._id} value={department._id}>{department.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Unassigned officer
                <select name="officerId" required defaultValue="" className={fieldClass}>
                  <option value="">Select an officer</option>
                  {unassignedOfficers.map((officer) => (
                    <option key={officer._id} value={officer._id}>
                      {officer.fullName} — {officer.email}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="submit"
                disabled={!selectedDepartmentId || !unassignedOfficers.length || assignMutation.isPending}
              >
                {assignMutation.isPending ? 'Assigning…' : 'Assign officer'}
              </Button>
            </form>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Department directory</h2>
              <p className="mt-1 text-sm text-slate-600">Select a department to view its assigned officers.</p>
            </div>
            {departmentsQuery.isLoading ? <p className="text-sm text-slate-500">Loading departments…</p> : null}
          </div>
          {departmentsQuery.error ? (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {getApiErrorMessage(departmentsQuery.error, 'Unable to load departments.')}
            </p>
          ) : departments.length === 0 && !departmentsQuery.isLoading ? (
            <p className="mt-4 text-sm text-slate-600">No departments have been created yet.</p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <button
                  key={department._id}
                  type="button"
                  onClick={() => setSelectedDepartmentId(department._id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedDepartmentId === department._id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="font-semibold text-slate-900">{department.name}</span>
                  <span className="mt-1 block text-sm text-slate-600">{department.description}</span>
                </button>
              ))}
            </div>
          )}

          {selectedDepartment ? (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="font-semibold text-slate-900">{selectedDepartment.name}: assigned officers</h3>
              {assignedOfficersQuery.isLoading ? (
                <p className="mt-3 text-sm text-slate-600">Loading officers…</p>
              ) : assignedOfficersQuery.error ? (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  {getApiErrorMessage(assignedOfficersQuery.error, 'Unable to load department officers.')}
                </p>
              ) : assignedOfficersQuery.data?.length ? (
                <ul className="mt-3 space-y-2">
                  {assignedOfficersQuery.data.map((officer) => (
                    <li key={officer._id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <span className="font-medium text-slate-900">{officer.fullName}</span> · {officer.email}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No officers are assigned to this department yet.</p>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </CmoLayout>
  )
}
