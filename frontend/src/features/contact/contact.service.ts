import { api } from '../../lib/http'

export async function submitContactEnquiry(input: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const { data } = await api.post<{ success: true; data: { enquiryId: string } }>('/contact-enquiries', input)
  return data.data
}

export type ContactEnquiry = {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'reviewed' | 'closed'
  createdAt: string
}

export async function getContactEnquiries(page = 1, limit = 20) {
  const { data } = await api.get<{
    success: true
    data: { enquiries: ContactEnquiry[]; page: number; limit: number; total: number }
  }>('/contact-enquiries', { params: { page, limit } })
  return data.data
}

export async function updateContactEnquiry(id: string, status: 'reviewed' | 'closed') {
  const { data } = await api.patch<{ success: true; data: { enquiry: ContactEnquiry } }>(
    `/contact-enquiries/${encodeURIComponent(id)}`,
    { status },
  )
  return data.data.enquiry
}
