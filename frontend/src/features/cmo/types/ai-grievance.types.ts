export type CmoAIGrievanceAnalysis = {
  analysisId: string
  summary: string
  suggestedDepartment: {
    id: string
    name: string
    code: string
  }
  suggestedCategory: string
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH'
  confidence: number
  reasoning: string
  duplicateConcern: boolean
  duplicateReason: string
  duplicateCandidates: {
    grievanceId?: string
    referenceNumber: string
  }[]
  reviewDecision: 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED'
  reviewedValues: {
    departmentId?: string
    category?: string
    priority?: string
  } | null
  modelProvider: string
  modelName: string
  generatedAt: string
  reviewedAt: string | null
}
