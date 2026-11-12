import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  downloadAttachment,
  getGrievanceById,
  getGrievanceHistory,
  submitActionReport,
  uploadAttachments,
  updateGrievanceStatus,
} from '../../grievances/grievance.service'
import type { Grievance } from '../../grievances/grievance.types'
import { getApiErrorMessage } from '../../../lib/http'
import { Button } from '../../../shared/components/Button'
import { DepartmentLayout } from '../../../shared/components/department/DepartmentLayout'

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function DepartmentGrievanceDetailPage() {
  const { reference: grievanceId } = useParams()
  const [grievance, setGrievance] = useState<Grievance>()
  const [reportDetails, setReportDetails] = useState('')
  const [reportAttachments, setReportAttachments] = useState<FileList | null>(null)
  const [supplementalFiles, setSupplementalFiles] = useState<FileList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const refresh = async () => {
    if (!grievanceId) return
    const [record, history] = await Promise.all([
      getGrievanceById(grievanceId),
      getGrievanceHistory(grievanceId),
    ])
    setGrievance({ ...record, statusHistory: history })
  }

  useEffect(() => {
    if (!grievanceId) return
    Promise.all([getGrievanceById(grievanceId), getGrievanceHistory(grievanceId)])
      .then(([record, history]) => setGrievance({ ...record, statusHistory: history }))
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load grievance details.')))
      .finally(() => setIsLoading(false))
  }, [grievanceId])

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

  const handleReport = () => {
    if (!grievanceId || reportDetails.trim().length < 10) {
      toast.error('The action report must contain at least 10 characters.')
      return
    }
    void runAction(async () => {
      await submitActionReport(grievanceId, reportDetails.trim(), reportAttachments ?? undefined)
      setReportDetails('')
      setReportAttachments(null)
    }, 'Action report submitted to the CMO.')
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
    return <DepartmentLayout><div className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-700">Loading grievance…</div></DepartmentLayout>
  }

  if (!grievance) {
    return <DepartmentLayout><div className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-700">Grievance not found.</div></DepartmentLayout>
  }

  const canStartInvestigation = ['UNDER_REVIEW', 'RETURNED_FOR_FURTHER_ACTION'].includes(grievance.status)
  const canSubmitReport = ['UNDER_REVIEW', 'UNDER_DEPARTMENT_REVIEW', 'RETURNED_FOR_FURTHER_ACTION'].includes(grievance.status)

  return (
    <DepartmentLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Assigned case</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{grievance.referenceNumber}</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold">Subject:</span> {grievance.subject}</p>
              <p><span className="font-semibold">District:</span> {grievance.district}</p>
              <p><span className="font-semibold">Category:</span> {grievance.category}</p>
              <p><span className="font-semibold">Description:</span> {grievance.description}</p>
              <p><span className="font-semibold">Current status:</span> {grievance.status}</p>
              <p><span className="font-semibold">Priority:</span> {grievance.priority}</p>
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
            {grievance.actionReports?.length ? (
              <div className="mt-6 border-t border-slate-200 pt-4">
                <h2 className="font-semibold text-slate-900">Previous action reports</h2>
                {grievance.actionReports.map((report) => (
                  <div key={report.id} className="mt-3 rounded-xl bg-slate-50 p-4 text-sm">
                    <p className="whitespace-pre-wrap text-slate-700">{report.details}</p>
                    {report.attachments.map((file) => (
                      <button key={file.id} type="button" className="mt-2 block text-emerald-700 underline" onClick={() => void handleDownload(file.filename, file.originalName)}>
                        {file.originalName}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Department workflow</h2>
              {canStartInvestigation ? (
                <Button type="button" className="mt-5 w-full" disabled={isSaving} onClick={() => void runAction(
                  () => updateGrievanceStatus(grievance.id, 'IN_PROGRESS', 'Investigation started.'),
                  'Investigation started.',
                )}>Start investigation</Button>
              ) : null}
              {canSubmitReport ? (
                <div className="mt-5 space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Action report
                    <textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} rows={6} minLength={10} maxLength={5000} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" placeholder="Describe the investigation and action taken (minimum 10 characters)." />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Report attachments (up to 5 files, 10 MB each)
                    <input type="file" multiple onChange={(event) => setReportAttachments(event.target.files)} className="mt-2 block w-full text-sm" />
                  </label>
                  <Button type="button" className="w-full" disabled={isSaving || reportDetails.trim().length < 10} onClick={handleReport}>
                    {isSaving ? 'Submitting…' : 'Submit action report'}
                  </Button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">No department action is available at the current grievance stage.</p>
              )}
            </section>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Status history</h2>
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
    </DepartmentLayout>
  )
}
