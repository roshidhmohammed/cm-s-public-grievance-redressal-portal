import { api } from '../../../lib/http'
import type { CmoDashboardStats } from '../types/cmo.types'

export async function getCmoDashboardStats(): Promise<CmoDashboardStats> {
  const { data } = await api.get<{ success: true; data: CmoDashboardStats }>('/dashboard/cmo')
  return data.data
}
