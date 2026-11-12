import { api } from '../../lib/http'
import type { Grievance } from './grievance.types'

type ApiResponse<T> = {
  success: true
  data: T
}

const allowedAttachmentTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

function validateAttachments(files: FileList | File[] | undefined) {
  const selectedFiles = Array.from(files ?? [])
  if (selectedFiles.length > 5) throw new Error('You can upload a maximum of five files.')
  const invalidFile = selectedFiles.find((file) => file.size > 10 * 1024 * 1024 || !allowedAttachmentTypes.has(file.type))
  if (invalidFile && invalidFile.size > 10 * 1024 * 1024) throw new Error(`${invalidFile.name} exceeds the 10 MB file size limit.`)
  if (invalidFile) throw new Error('Only JPEG, PNG, WebP, PDF, and Word documents are allowed.')
  return selectedFiles
}

export type GrievanceFilters = {
  status?: string
  district?: string
  category?: string
  priority?: string
  page?: number
  limit?: number
}

export type GrievancePage = {
  items: Grievance[]
  page: number
  limit: number
  total: number
}

export type AssignmentHistoryEntry = {
  _id: string
  department: { _id: string; name: string } | string
  officer?: { _id: string; fullName: string; email: string } | string | null
  assignedBy?: { fullName: string; email: string } | string | null
  dueAt?: string | null
  createdAt: string
}

export async function getGrievances(filters: GrievanceFilters = {}): Promise<GrievancePage> {
  const { data } = await api.get<ApiResponse<GrievancePage>>('/grievances', { params: filters })
  return data.data
}

export async function getGrievanceById(id: string): Promise<Grievance> {
  const { data } = await api.get<ApiResponse<Grievance>>(`/grievances/${encodeURIComponent(id)}`)
  return data.data
}

export async function searchGrievanceByReference(reference: string): Promise<Grievance> {
  const { data } = await api.get<ApiResponse<Grievance>>(
    `/grievances/track/${encodeURIComponent(reference.trim())}`,
  )
  return data.data
}

export async function submitGrievance(input: {
  district: string
  category: string
  subject: string
  description: string
  attachments?: FileList | File[]
}): Promise<Grievance> {
  const formData = new FormData()
  formData.append('district', input.district)
  formData.append('category', input.category)
  formData.append('subject', input.subject)
  formData.append('description', input.description)
  validateAttachments(input.attachments).forEach((file) => formData.append('attachments', file))

  const { data } = await api.post<ApiResponse<Grievance>>('/grievances', formData)
  return data.data
}

export async function submitFeedback(grievanceId: string, rating: number, comment: string) {
  const { data } = await api.post<ApiResponse<{
    id: string
    grievanceId: string
    rating: number
    comment: string
    submittedAt: string
  }>>(`/citizen-feedback/${encodeURIComponent(grievanceId)}`, { rating, comment })
  return data.data
}

export async function uploadAttachments(grievanceId: string, files: FileList | File[]) {
  const formData = new FormData()
  validateAttachments(files).forEach((file) => formData.append('attachments', file))
  const { data } = await api.post<ApiResponse<{ attachments: Grievance['attachments'] }>>(
    `/attachments/${encodeURIComponent(grievanceId)}`,
    formData,
  )
  return data.data
}

export async function downloadAttachment(grievanceId: string, filename: string): Promise<Blob> {
  const { data } = await api.get<Blob>(
    `/attachments/${encodeURIComponent(grievanceId)}/${encodeURIComponent(filename)}`,
    { responseType: 'blob' },
  )
  return data
}

export async function getGrievanceHistory(grievanceId: string) {
  const { data } = await api.get<ApiResponse<{ history: Grievance['statusHistory'] }>>(
    `/grievance-history/${encodeURIComponent(grievanceId)}`,
  )
  return data.data.history
}

export async function updateGrievanceStatus(grievanceId: string, status: string, remarks:string) {
  const { data } = await api.patch<ApiResponse<Grievance>>(
    `/grievance-history/${encodeURIComponent(grievanceId)}/status`,
    { status, remarks },
  )
  return data.data
}

export async function submitActionReport(grievanceId: string, details: string, attachments?: FileList | File[]) {
  const formData = new FormData()
  formData.append('details', details)
  validateAttachments(attachments).forEach((file) => formData.append('attachments', file))
  const { data } = await api.post<ApiResponse<{ reportId: string; grievance: Grievance }>>(
    `/action-taken-reports/${encodeURIComponent(grievanceId)}`,
    formData,
  )
  return data.data
}

export async function assignDepartment(
  grievanceId: string,
  assignment: { department: string; officer?: string; priority: 'Low' | 'Medium' | 'High'; dueAt?: string },
) {
  const { data } = await api.post<ApiResponse<{ grievance: Grievance; assignment: unknown }>>(
    `/department-assignments/${encodeURIComponent(grievanceId)}`,
    assignment,
  )
  return data.data
}

export async function getAssignmentHistory(grievanceId: string) {
  const { data } = await api.get<ApiResponse<{ assignments: AssignmentHistoryEntry[] }>>(
    `/department-assignments/${encodeURIComponent(grievanceId)}`,
  )
  return data.data.assignments
}

export async function escalateGrievance(grievanceId: string) {
  const { data } = await api.post<ApiResponse<Grievance>>(
    `/grievances/${encodeURIComponent(grievanceId)}/escalate`,
  )
  return data.data
}

export async function addCmoRemark(grievanceId: string, content: string) {
  const { data } = await api.post<ApiResponse<{
    id: string
    content: string
    authorRole: string
    visibility: 'public' | 'internal'
    createdAt: string
  }>>(
    `/grievance-remarks/${encodeURIComponent(grievanceId)}`,
    { content, visibility: 'public' },
  )
  return data.data
}

export async function resolveGrievance(grievanceId: string, resolution: string) {
  const { data } = await api.patch<ApiResponse<Grievance>>(
    `/grievances/${encodeURIComponent(grievanceId)}/review`,
    { decision: 'resolve', resolution },
  )
  return data.data
}
