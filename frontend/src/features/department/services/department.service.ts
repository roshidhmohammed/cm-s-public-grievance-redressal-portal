import { api } from '../../../lib/http'
import type { Grievance } from '../../grievances/grievance.types'
import type { DepartmentDashboardStats } from '../types/department.types'

export async function getDepartmentDashboardStats(): Promise<DepartmentDashboardStats> {
  const { data } = await api.get<{ success: true; data: DepartmentDashboardStats }>('/dashboard/department')
  return data.data
}

export async function getDepartmentGrievances(): Promise<Grievance[]> {
  const { data } = await api.get<{
    success: true
    data: { items: Grievance[]; page: number; limit: number; total: number }
  }>('/grievances', { params: { page: 1, limit: 100 } })
  return data.data.items
}
