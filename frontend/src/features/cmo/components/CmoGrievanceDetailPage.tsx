import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  addCmoRemark,
  assignDepartment,
  downloadAttachment,
  escalateGrievance,
  getAssignmentHistory,
  getGrievanceById,
  getGrievanceHistory,
  resolveGrievance,
  uploadAttachments,
  type AssignmentHistoryEntry,
} from '../../grievances/grievance.service'
import type { Grievance } from '../../grievances/grievance.types'
import { getDepartments, getDepartmentOfficers, type Department, type DepartmentOfficer } from '../../department/services/department-api.service'
import { getApiErrorMessage } from '../../../lib/axios'
import { Button } from '../../../shared/components/Button'
import { CmoLayout } from '../../../shared/components/cmo/CmoLayout'

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function CmoGrievanceDetailPage() {
  const { reference: grievanceId } = useParams()
  const [grievance, setGrievance] = useState<Grievance>()
  const [departments, setDepartments] = useState<Department[]>([])
  const [officers, setOfficers] = useState<DepartmentOfficer[]>([])
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistoryEntry[]>([])
  const [departmentId, setDepartmentId] = useState('')
  const [officerId, setOfficerId] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [dueAt, setDueAt] = useState('')
  const [resolution, setResolution] = useState('')
  const [publicRemark, setPublicRemark] = useState('')
  const [supplementalFiles, setSupplementalFiles] = useState<FileList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const refresh = async () => {
    if (!grievanceId) return
    const [record, assignments, history] = await Promise.all([
      getGrievanceById(grievanceId),
      getAssignmentHistory(grievanceId),
      getGrievanceHistory(grievanceId),
    ])
    setGrievance({ ...record, statusHistory: history })
    setAssignmentHistory(assignments)
  }

  useEffect(() => {
    if (!grievanceId) return
    Promise.all([getGrievanceById(grievanceId), getAssignmentHistory(grievanceId), getDepartments(), getGrievanceHistory(grievanceId)])
      .then(([record, assignments, departmentList, history]) => {
        setGrievance({ ...record, statusHistory: history })
        setAssignmentHistory(assignments)
        setDepartments(departmentList)
        const normalizedPriority = record.priority.toUpperCase()
        setPriority(normalizedPriority === 'LOW' ? 'Low' : normalizedPriority === 'HIGH' ? 'High' : 'Medium')
      })
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load grievance details.')))
      .finally(() => setIsLoading(false))
  }, [grievanceId])

  useEffect(() => {
    if (!departmentId) {
      return
    }
    getDepartmentOfficers(departmentId)
      .then(setOfficers)
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load department officers.')))
  }, [departmentId])

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setIsSaving(true)
    try {
      await action()
      await refresh()
      toast.success(successMessage)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update the grievance.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAssignment = () => {
    if (!grievanceId || !departmentId) {
      toast.error('Select a department before assigning this grievance.')
      return
    }
    void runAction(
      () => assignDepartment(grievanceId, {
        department: departmentId,
        officer: officerId || undefined,
        priority,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      }),
      'Grievance assigned successfully.',
    )
  }

  const handleAddPublicRemark = async () => {
    if (!grievanceId || publicRemark.trim().length < 3) return
    setIsSaving(true)
    try {
      const remark = await addCmoRemark(grievanceId, publicRemark.trim())
      setGrievance((current) => current ? {
        ...current,
        remarks: [...(current.remarks ?? []), {
          content: remark.content,
          author: 'CMO',
          authorRole: remark.authorRole,
          visibility: remark.visibility,
          createdAt: remark.createdAt,
        }],
      } : current)
      setPublicRemark('')
      toast.success('Public remark added.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to add the public remark.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleResolve = () => {
    if (!grievanceId || resolution.trim().length < 3) return
    void runAction(
      () => resolveGrievance(grievanceId, resolution.trim()),
      'Grievance resolved.',
    )
  }

  const handleDownload = async (filename: string, originalName: string) => {
    if (!grievanceId) return
    try {
      saveBlob(await downloadAttachment(grievanceId, filename), originalName)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to download attachment.'))
    }
  }

  if (isLoading) {
    return <CmoLayout><div className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-700">Loading grievance…</div></CmoLayout>
  }

  if (!grievance) {
    return <CmoLayout><div className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-700">Grievance not found.</div></CmoLayout>
  }

  const isClosed = ['RESOLVED', 'REJECTED'].includes(grievance.status)
  const citizen = typeof grievance.citizen === 'object' ? grievance.citizen?.fullName : undefined

  return (
    <CmoLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">Grievance details</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{grievance.referenceNumber}</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold">Citizen:</span> {citizen ?? 'Citizen'}</p>
              <p><span className="font-semibold">Category:</span> {grievance.category}</p>
              <p><span className="font-semibold">District:</span> {grievance.district}</p>
              <p><span className="font-semibold">Subject:</span> {grievance.subject}</p>
              <p><span className="font-semibold">Description:</span> {grievance.description}</p>
              <p><span className="font-semibold">Priority:</span> {grievance.priority}</p>
              <p><span className="font-semibold">Status:</span> {grievance.status}</p>
              <p><span className="font-semibold">Due date:</span> {grievance.dueAt ? new Date(grievance.dueAt).toLocaleDateString() : 'Not set'}</p>
            </div>
            {grievance.attachments?.length ? (
              <div className="mt-6 border-t border-slate-200 pt-4">
                <h2 className="font-semibold text-slate-900">Attachments</h2>
                {grievance.attachments.map((file) => (
                  <button key={file.id} type="button" className="mt-2 block text-sm text-emerald-700 underline" onClick={() => void handleDownload(file.filename, file.originalName)}>
                    {file.originalName}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-6 border-t border-slate-200 pt-4">
              <label className="block text-sm font-medium text-slate-700">
                Upload supplemental attachments
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setSupplementalFiles(event.target.files)} className="mt-2 block w-full text-sm" />
              </label>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                disabled={isSaving || !supplementalFiles?.length}
                onClick={() => {
                  if (grievanceId && supplementalFiles) {
                    void runAction(() => uploadAttachments(grievanceId, supplementalFiles), 'Attachments uploaded.')
                    setSupplementalFiles(null)
                  }
                }}
              >
                Upload attachments
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {!isClosed ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Assign department</h2>
                <div className="mt-4 space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Department
                    <select value={departmentId} onChange={(event) => { setDepartmentId(event.target.value); setOfficerId('') }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                      <option value="">Select department</option>
                      {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Officer (optional)
                    <select value={officerId} onChange={(event) => setOfficerId(event.target.value)} disabled={!departmentId} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 disabled:bg-slate-100">
                      <option value="">Any available officer</option>
                      {officers.map((officer) => <option key={officer._id} value={officer._id}>{officer.fullName}</option>)}
                    </select>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Priority
                      <select value={priority} onChange={(event) => setPriority(event.target.value as 'Low' | 'Medium' | 'High')} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                        <option>Low</option><option>Medium</option><option>High</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Due date
                      <input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" />
                    </label>
                  </div>
                  <Button type="button" onClick={handleAssignment} disabled={isSaving || !departmentId}>{isSaving ? 'Saving…' : 'Assign grievance'}</Button>
                </div>
              </section>
            ) : null}

            {grievance.status === 'IN_PROGRESS' ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Resolve grievance</h2>
                {grievance.actionReports?.map((report) => (
                  <div key={report.id} className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="whitespace-pre-wrap">{report.details}</p>
                    {report.attachments.map((file) => (
                      <button key={file.id} type="button" className="mt-2 block text-emerald-700 underline" onClick={() => void handleDownload(file.filename, file.originalName)}>
                        {file.originalName}
                      </button>
                    ))}
                  </div>
                ))}
                {!grievance.remarks?.some((remark) => remark.visibility === 'public') ? (
                  <>
                    <label className="mt-4 block text-sm font-medium text-slate-700">
                      Public remark
                      <textarea value={publicRemark} onChange={(event) => setPublicRemark(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                    </label>
                    <Button type="button" className="mt-3" disabled={isSaving || publicRemark.trim().length < 3} onClick={() => void handleAddPublicRemark()}>
                      Add public remark
                    </Button>
                  </>
                ) : (
                  <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">A public CMO remark has been added.</p>
                )}
                <label className="mt-4 block text-sm font-medium text-slate-700">
                  Resolution details
                  <textarea value={resolution} onChange={(event) => setResolution(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                </label>
                <Button
                  type="button"
                  className="mt-3"
                  disabled={isSaving || resolution.trim().length < 3 || !grievance.remarks?.some((remark) => remark.visibility === 'public')}
                  onClick={handleResolve}
                >
                  {isSaving ? 'Saving…' : 'Resolve grievance'}
                </Button>
              </section>
            ) : null}

            {!isClosed ? (
              <Button type="button" variant="secondary" disabled={isSaving} onClick={() => void runAction(
                () => escalateGrievance(grievance.id),
                'Grievance escalated.',
              )}>Escalate grievance</Button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Assignment history</h2>
          <div className="mt-5 space-y-3">
            {assignmentHistory.length ? assignmentHistory.map((entry) => (
              <div key={entry._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold">{typeof entry.department === 'object' ? entry.department.name : 'Department'}</p>
                <p className="mt-1">{typeof entry.officer === 'object' && entry.officer ? entry.officer.fullName : 'No officer assigned'}</p>
                <p className="mt-1 text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            )) : <p className="text-sm text-slate-600">No department assignments yet.</p>}
          </div>
          <h2 className="mt-8 text-xl font-bold text-slate-900">Status history</h2>
          <div className="mt-5 space-y-3">
            {grievance.statusHistory.map((entry, index) => (
              <div key={`${entry.status}-${entry.date}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-slate-800">{entry.status}</span>
                  <span className="text-slate-500">{new Date(entry.date).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {typeof entry.assignedBy === 'object' && entry.assignedBy?.fullName ? `Updated by ${entry.assignedBy.fullName}` : 'Status updated.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CmoLayout>
  )
}
