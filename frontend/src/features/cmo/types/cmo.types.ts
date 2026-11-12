export type CmoDashboardStats = {
  totalGrievances: number
  pendingGrievances: number
  resolvedGrievances: number
  overdueGrievances: number
  districtStats: { district: string; count: number }[]
  departmentStats: { department: string; count: number }[]
  statusDistribution: { status: string; count: number }[]
}
