import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../../lib/axios'
import { Button } from '../../../shared/components/Button'
import { analyzeGrievance, reviewAIGrievanceAnalysis } from '../services/ai-grievance.service'
import type { AIGrievanceAnalysis } from '../types/ai-grievance.types'

type Props = {
  district: string
  description: string
  onAccepted: (analysis: AIGrievanceAnalysis) => void
}

export function AIGrievanceAssistant({ district, description, onAccepted }: Props) {
  const inputKey = JSON.stringify([district, description])
  const currentInputKey = useRef(inputKey)
  const [analysisResult, setAnalysisResult] = useState<{ key: string; analysis: AIGrievanceAnalysis } | null>(null)
  const [errorResult, setErrorResult] = useState<{ key: string; message: string } | null>(null)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const analysis = analysisResult?.key === inputKey ? analysisResult.analysis : null
  const error = errorResult?.key === inputKey ? errorResult.message : ''
  const isLoading = loadingKey === inputKey

  useEffect(() => {
    currentInputKey.current = inputKey
  }, [inputKey])

  const handleAnalyze = async () => {
    setLoadingKey(inputKey)
    setErrorResult(null)
    setAnalysisResult(null)
    try {
      const result = await analyzeGrievance({ district, description: description.trim() })
      if (currentInputKey.current === inputKey) setAnalysisResult({ key: inputKey, analysis: result })
    } catch (requestError) {
      if (currentInputKey.current === inputKey) {
        setErrorResult({ key: inputKey, message: getApiErrorMessage(requestError, 'AI analysis failed.') })
      }
    } finally {
      if (currentInputKey.current === inputKey) setLoadingKey(null)
    }
  }

  const handleAccept = async () => {
    if (!analysis) return
    const analysisToAccept = analysis
    setIsAccepting(true)
    setErrorResult(null)
    try {
      await reviewAIGrievanceAnalysis(analysisToAccept.analysisId)
      if (currentInputKey.current !== inputKey) return
      const acceptedAnalysis = { ...analysisToAccept, reviewDecision: 'ACCEPTED' }
      setAnalysisResult({ key: inputKey, analysis: acceptedAnalysis })
      onAccepted(acceptedAnalysis)
      toast.success('AI recommendations accepted. Review them before submitting.')
    } catch (requestError) {
      if (currentInputKey.current === inputKey) {
        setErrorResult({
          key: inputKey,
          message: getApiErrorMessage(requestError, 'Unable to accept AI recommendations.'),
        })
      }
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">AI grievance assistant</h2>
        <p className="mt-1 text-sm text-slate-600">
          Get advisory suggestions for the department, category, priority, and a concise summary.
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={isLoading || isAccepting || description.trim().length < 20 || !district}
        onClick={() => void handleAnalyze()}
      >
        {isLoading ? 'Analyzing…' : 'Analyze description'}
      </Button>

      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}

      {analysis ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <h3 className="font-semibold text-slate-900">Recommendations</h3>
          <p><span className="font-medium">Summary:</span> {analysis.summary}</p>
          <p><span className="font-medium">Department:</span> {analysis.suggestedDepartment.code}</p>
          <p><span className="font-medium">Category:</span> {analysis.suggestedCategory.replaceAll('_', ' ')}</p>
          <p><span className="font-medium">Priority:</span> {analysis.suggestedPriority}</p>
          <p><span className="font-medium">Confidence:</span> {Math.round(analysis.confidence * 100)}%</p>
          <p><span className="font-medium">Reasoning:</span> {analysis.reasoning}</p>

          {analysis.duplicateConcern ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="font-semibold text-amber-900">Potential duplicate complaint</p>
              <p className="mt-1">{analysis.duplicateReason}</p>
              {analysis.duplicateCandidates.map((candidate) => (
                <p key={candidate.grievanceId} className="mt-2">
                  {candidate.referenceNumber} — {candidate.subject}
                </p>
              ))}
              <p className="mt-2 text-xs">This is only a warning; you may still submit your grievance.</p>
            </div>
          ) : null}

          <p className="text-xs text-slate-500">
            These suggestions are advisory. Review and edit the grievance details before submission.
          </p>

          {analysis.reviewDecision === 'ACCEPTED' ? (
            <p className="font-medium text-emerald-700">Recommendations accepted.</p>
          ) : (
            <Button type="button" disabled={isAccepting} onClick={() => void handleAccept()}>
              {isAccepting ? 'Accepting…' : 'Accept suggestions'}
            </Button>
          )}
        </div>
      ) : null}
    </section>
  )
}
