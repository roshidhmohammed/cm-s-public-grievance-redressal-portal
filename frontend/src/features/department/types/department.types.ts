import type { officerSchema } from "../schemas/officerSchema"
import {z} from "zod"

export type DepartmentUser = {
  id: string
  name: string
  email: string
  department: string
  role: 'department_officer'
}

export type DepartmentDashboardStats = {
  assignedGrievances: number
  pendingInvestigation: number
  underReview: number
  actionReportsSubmitted: number
  resolvedGrievances: number
}

export type OfficerFormValues = z.infer<typeof officerSchema>

export type Department = {
  _id: string
  id?: string
  name: string
  description: string
  slug?: string
}

export type DepartmentOfficer = {
  _id: string
  fullName: string
  email: string
  mobile?: string
}
