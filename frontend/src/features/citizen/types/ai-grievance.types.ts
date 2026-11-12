export type AIGrievanceAnalysis = {
  analysisId: string
  summary: string
  suggestedDepartment: {
    id: string
    code: string
  }
  suggestedCategory: string
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH'
  confidence: number
  reasoning: string
  duplicateConcern: boolean
  duplicateReason: string
  duplicateCandidates: {
    grievanceId: string
    referenceNumber: string
    subject: string
  }[]
  reviewDecision: string
}
