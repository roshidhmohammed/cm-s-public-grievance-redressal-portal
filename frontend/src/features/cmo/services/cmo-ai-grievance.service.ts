import { api } from '../../../lib/axios'
import type { CmoAIGrievanceAnalysis } from '../types/ai-grievance.types'

type ApiResponse<T> = {
  success: true
  data: T
}

export async function getAIAnalysisForGrievance(grievanceId: string) {
  const { data } = await api.get<ApiResponse<{ analysis: CmoAIGrievanceAnalysis | null }>>(
    `/ai-grievance/grievances/${encodeURIComponent(grievanceId)}`,
  )
  return data.data.analysis
}
