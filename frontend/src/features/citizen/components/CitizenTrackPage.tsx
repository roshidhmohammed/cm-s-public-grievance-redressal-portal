import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { EmptyState } from '../../../shared/components/EmptyState'
import { CitizenLayout } from '../../../shared/components/citizen/CitizenLayout'
import { searchGrievanceByReference } from '../../grievances/grievance.service'
import type { Grievance } from '../../grievances/grievance.types'
import { getApiErrorMessage } from '../../../lib/axios'

export default function CitizenTrackPage() {
  const [searchParams] = useSearchParams()
  const initialReference = searchParams.get('reference') ?? ''
  const [reference, setReference] = useState(initialReference)
  const [grievance, setGrievance] = useState<Grievance>()
  const [isLoading, setIsLoading] = useState(Boolean(initialReference))
  const [hasSearched, setHasSearched] = useState(false)

  const search = async (value: string) => {
    if (!value.trim()) return
    setIsLoading(true)
    setHasSearched(true)
    setGrievance(undefined)
    try {
      setGrievance(await searchGrievanceByReference(value))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to find that grievance.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!initialReference) return
    let active = true
    searchGrievanceByReference(initialReference)
      .then((record) => {
        if (active) setGrievance(record)
      })
      .catch((error: unknown) => {
        if (active) toast.error(getApiErrorMessage(error, 'Unable to find that grievance.'))
      })
      .finally(() => {
        if (active) {
          setHasSearched(true)
          setIsLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [initialReference])

  return (
    <CitizenLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Citizen portal</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Track grievance</h1>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void search(reference)
            }}
            className="flex flex-col gap-3 md:flex-row"
          >
            <div className="flex-1">
              <Input
                label="Reference number"
                placeholder="CMK-2026-1001"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>{isLoading ? 'Searching...' : 'Search'}</Button>
            </div>
          </form>
        </div>

        {!reference ? (
          <div className="mt-8">
            <EmptyState
              title="Search by reference number"
              description="Enter the grievance number issued at the time of submission to review the latest status and remarks."
            />
          </div>
        ) : isLoading ? (
          <div className="mt-8"><EmptyState title="Searching…" description="Looking up the grievance status and history." /></div>
        ) : grievance ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Reference</p>
                <h2 className="text-2xl font-bold text-slate-900">{grievance.referenceNumber}</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {grievance.status}
              </span>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="space-y-2 text-sm text-slate-700">
                <p><span className="font-semibold">District:</span> {grievance.district}</p>
                <p><span className="font-semibold">Category:</span> {grievance.category}</p>
                <p><span className="font-semibold">Assigned department:</span> {grievance.assignedDepartment ?? 'CMO review'}</p>
                <p><span className="font-semibold">Submission date:</span> {grievance.submittedAt}</p>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <p><span className="font-semibold">Current status:</span> {grievance.status}</p>
                <p><span className="font-semibold">Priority:</span> {grievance.priority}</p>
                <p><span className="font-semibold">Resolution:</span> {grievance.resolution || 'No resolution yet.'}</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900">Status history</h3>
              <div className="mt-4 space-y-3">
                {grievance.statusHistory.map((entry) => (
                  <div key={`${entry.status}-${entry.date}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800">{entry.status}</p>
                      <span className="text-xs text-slate-500">{new Date(entry.date).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {entry.note ?? (typeof entry.assignedBy === 'object' && entry.assignedBy?.fullName
                        ? `Updated by ${entry.assignedBy.fullName}`
                        : 'Status updated.')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="mt-8">
            <EmptyState
              title="No grievance found"
              description="The reference number entered does not match any active record. Please verify and try again."
            />
          </div>
        ) : null}
      </div>
    </CitizenLayout>
  )
}
