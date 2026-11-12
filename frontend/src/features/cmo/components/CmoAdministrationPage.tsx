import { useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getContactEnquiries,
  updateContactEnquiry,
  type ContactEnquiry,
} from '../../contact/contact.service'
import { getApiErrorMessage } from '../../../lib/axios'
import { Button } from '../../../shared/components/Button'
import { CmoLayout } from '../../../shared/components/cmo/CmoLayout'
import { CreateDepartmentOfficerForm } from '../../department/components/CreateDepartmentOfficerForm'

export default function CmoAdministrationPage() {
  const { data: adminData, isLoading, error, refetch } = useQuery({
    queryKey: ['cmo-administration'],
    queryFn: async () => getContactEnquiries(),
  })
  const enquiries: ContactEnquiry[] = adminData?.enquiries ?? []

  const refresh = useCallback(async () => {
    await refetch({ throwOnError: true })
  }, [refetch])

  useEffect(() => {
    if (error) toast.error(getApiErrorMessage(error, 'Unable to load CMO administration data.'))
  }, [error])

  const handleEnquiryStatus = async (id: string, status: 'reviewed' | 'closed') => {
    try {
      await updateContactEnquiry(id, status)
      await refresh()
      toast.success(`Enquiry marked ${status}.`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update the enquiry.'))
    }
  }

  return (
    <CmoLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">CMO portal</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Administration</h1>

        <div className="mt-8">
          <CreateDepartmentOfficerForm />
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Contact enquiries</h2>
          {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading enquiries…</p> : enquiries.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">There are no contact enquiries.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {enquiries.map((enquiry) => (
                <article key={enquiry._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <h3 className="font-semibold text-slate-900">{enquiry.subject}</h3>
                      <p className="mt-1 text-sm text-slate-600">{enquiry.name} · {enquiry.email} · {new Date(enquiry.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="h-fit rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600">{enquiry.status}</span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{enquiry.message}</p>
                  {enquiry.status !== 'closed' ? (
                    <div className="mt-4 flex gap-2">
                      {enquiry.status !== 'reviewed' ? <Button type="button" variant="secondary" onClick={() => void handleEnquiryStatus(enquiry._id, 'reviewed')}>Mark reviewed</Button> : null}
                      <Button type="button" variant="ghost" onClick={() => void handleEnquiryStatus(enquiry._id, 'closed')}>Close</Button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </CmoLayout>
  )
}
