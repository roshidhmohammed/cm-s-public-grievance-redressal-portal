import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getGrievances, submitFeedback } from '../../grievances/grievance.service'
import type { Grievance } from '../../grievances/grievance.types'
import { getApiErrorMessage } from '../../../lib/http'
import { Button } from '../../../shared/components/Button'
import { Textarea } from '../../../shared/components/Textarea'
import { CitizenLayout } from '../../../shared/components/citizen/CitizenLayout'

export default function CitizenFeedbackPage() {
  const [resolvedGrievances, setResolvedGrievances] = useState<Grievance[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [rating, setRating] = useState('5')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getGrievances({ page: 1, limit: 100 })
      .then(({ items }) => {
        const resolved = items.filter((item) => item.status === 'RESOLVED' && !item.feedbackSubmitted)
        setResolvedGrievances(resolved)
        setSelectedId(resolved[0]?.id ?? '')
      })
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to load resolved grievances.')))
      .finally(() => setIsLoading(false))
  }, [])

  const selectedGrievance = resolvedGrievances.find((entry) => entry.id === selectedId)

  const onSubmit = async () => {
    if (!selectedId) {
      toast.error('Select a resolved grievance first.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitFeedback(selectedId, Number(rating), feedbackText.trim())
      toast.success('Feedback submitted successfully.')
      setResolvedGrievances((items) => items.filter((item) => item.id !== selectedId))
      setSelectedId('')
      setFeedbackText('')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to submit feedback.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CitizenLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Citizen portal</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Updates and feedback</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Resolved grievances</h2>
            <div className="mt-5 space-y-3">
              {isLoading ? (
                <p className="text-sm text-slate-600">Loading resolved grievances…</p>
              ) : resolvedGrievances.length === 0 ? (
                <p className="text-sm text-slate-600">No resolved grievances are available for feedback.</p>
              ) : (
                resolvedGrievances.map((grievance) => (
                  <button
                    key={grievance.id}
                    type="button"
                    onClick={() => setSelectedId(grievance.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${selectedId === grievance.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                  >
                    <p className="text-sm font-semibold text-slate-800">{grievance.referenceNumber}</p>
                    <p className="mt-2 text-sm text-slate-600">{grievance.subject}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {selectedGrievance ? (
              <>
                <div className="mb-6 space-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold">Reference:</span> {selectedGrievance.referenceNumber}</p>
                  <p><span className="font-semibold">Resolution:</span> {selectedGrievance.resolution || 'Resolution details are not available.'}</p>
                </div>

                <label className="mb-5 block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Rating</span>
                  <select
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                  >
                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
                  </select>
                </label>

                <Textarea
                  label="Comment (optional)"
                  rows={5}
                  placeholder="Share your satisfaction with the resolution or suggest improvements."
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                />

                <div className="mt-5 flex justify-end">
                  <Button type="button" onClick={() => void onSubmit()} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting…' : 'Submit feedback'}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600">Select a resolved grievance to share your feedback.</p>
            )}
          </div>
        </div>
      </div>
    </CitizenLayout>
  )
}
