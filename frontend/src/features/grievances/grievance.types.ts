export type GrievanceStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REOPENED'

export type Grievance = {
  id: string
  referenceNumber: string
  district: string
  category: string
  subject: string
  description: string
  status: GrievanceStatus
  submittedAt: string
  priority: 'Low' | 'Medium' | 'High' | 'LOW' | 'MEDIUM' | 'HIGH'
  assignedDepartment?: string
  resolution?: string
  feedbackSubmitted?: boolean
  citizen?: { id?: string; fullName?: string; email?: string; mobile?: string } | string
  assignedOfficer?: { id?: string; fullName?: string; email?: string } | null
  dueAt?: string
  attachments?: { id: string; filename: string; originalName: string; mimeType: string; size: number }[]
  actionReports?: {
    id: string
    details: string
    submittedAt: string
    attachments: { id: string; filename: string; originalName: string; mimeType: string; size: number }[]
  }[]
  remarks?: {
    content: string
    author: string
    authorRole: string
    visibility: 'public' | 'internal'
    createdAt: string
  }[]
  statusHistory: {
    status: GrievanceStatus
    date: string
    note?: string
    assignedBy?: { fullName?: string; email?: string } | string | null
  }[]
}
