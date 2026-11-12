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
