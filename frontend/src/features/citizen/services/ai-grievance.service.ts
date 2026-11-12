import { api } from '../../../lib/axios'
import type { AIGrievanceAnalysis } from '../types/ai-grievance.types'

type ApiResponse<T> = {
  success: true
  data: T
}

export async function analyzeGrievance(input: {
  district: string
  description: string
}): Promise<AIGrievanceAnalysis> {
  const { data } = await api.post<ApiResponse<AIGrievanceAnalysis>>('/ai-grievance/analyze', input)
  return data.data
}

export async function reviewAIGrievanceAnalysis(analysisId: string): Promise<void> {
  await api.patch<ApiResponse<{ analysisId: string; reviewDecision: string }>>(
    `/ai-grievance/${encodeURIComponent(analysisId)}/review`,
    { decision: 'ACCEPTED' },
  )
}
