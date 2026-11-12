import { api } from '../../../lib/axios'
import type { Department, DepartmentOfficer } from '../types/department.types';



type ApiResponse<T> = { success: true; data: T }

export async function getDepartments(): Promise<Department[]> {
  const { data } = await api.get<ApiResponse<{ departments: Department[] }>>('/departments')
  return data.data.departments
}

export async function getDepartmentOfficers(departmentId: string): Promise<DepartmentOfficer[]> {
  const { data } = await api.get<ApiResponse<{ officers: DepartmentOfficer[] }>>(
    `/departments/${encodeURIComponent(departmentId)}/officers`,
  )
  return data.data.officers
}

export async function getUnassignedOfficers(): Promise<DepartmentOfficer[]> {
  const { data } = await api.get<ApiResponse<{ officers: DepartmentOfficer[] }>>('/departments/officers/unassigned')
  return data.data.officers
}

export async function createDepartment(input: { name: string; description: string; officerId?: string }) {
  const { data } = await api.post<ApiResponse<{ department: Department; officer: DepartmentOfficer | null }>>(
    '/departments',
    input,
  )
  return data.data
}

export async function assignOfficer(departmentId: string, officerId: string) {
  const { data } = await api.patch<ApiResponse<{ officer: DepartmentOfficer }>>(
    `/departments/${encodeURIComponent(departmentId)}/officers`,
    { officerId },
  )
  return data.data.officer
}
