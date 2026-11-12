
import { createHttpError } from '../../utils/api-response.js';
import { AIGrievanceAnalysisRepository } from './ai-analysis.repository.js';
import { AIGrievanceReviewService } from './ai-analysis-review.service.js';
import { AIGrievanceService } from './ai-analysis.service.js';
import { DuplicateDetectionService } from './duplicate-detection.service.js';
import Grievance from '../grievances/grievance.model.js';

export class AIGrievanceController {
  static async analyze(req, res) {
    const { district, description } = req.validated.body;
    const analysis = await AIGrievanceService.analyze(description, district);
    const duplicateCandidates = await DuplicateDetectionService.findCandidates(
      district,
      analysis.duplicateSearchText
    );
    const savedAnalysis = await AIGrievanceAnalysisRepository.create({
      citizenId: req.user._id,
      district,
      description,
      modelName: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      analysis
    });

    savedAnalysis.duplicateCandidates = duplicateCandidates.map((candidate) => ({
      grievanceId: candidate.grievanceId,
      referenceNumber: candidate.referenceNumber
    }));
    await savedAnalysis.save();

    return res.json({
      success: true,
      data: {
        analysisId: savedAnalysis._id.toString(),
        summary: analysis.summary,
        suggestedDepartment: {
          id: savedAnalysis.suggestedDepartmentId.toString(),
          code: analysis.suggestedDepartmentCode
        },
        suggestedCategory: analysis.suggestedCategory,
        suggestedPriority: analysis.suggestedPriority,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        duplicateConcern: analysis.duplicateConcern,
        duplicateReason: analysis.duplicateReason,
        duplicateCandidates: duplicateCandidates.map(({ grievanceId, referenceNumber, subject }) => ({
          grievanceId,
          referenceNumber,
          subject
        })),
        reviewDecision: savedAnalysis.reviewDecision
      }
    });
  }

  static async review(req, res) {
    const analysis = await AIGrievanceReviewService.review(
      req.params.analysisId,
      req.user._id.toString(),
      req.user.role,
      req.validated.body
    );
    return res.json({
      success: true,
      data: {
        analysisId: analysis._id.toString(),
        reviewDecision: analysis.reviewDecision
      }
    });
  }

  static async getForGrievance(req, res) {
    const grievance = await Grievance.findById(req.params.grievanceId)
      .select('_id citizen district description')
      .lean();
    if (!grievance) throw createHttpError(404, 'Grievance not found.');

    const analysis = await AIGrievanceAnalysisRepository.findForGrievance(grievance);
    if (!analysis) {
      return res.json({ success: true, data: { analysis: null } });
    }

    const department = analysis.suggestedDepartmentId;
    return res.json({
      success: true,
      data: {
        analysis: {
          analysisId: analysis._id.toString(),
          summary: analysis.summary,
          suggestedDepartment: {
            id: department?._id?.toString() || department?.toString(),
            name: department?.name || analysis.suggestedDepartmentCode,
            code: analysis.suggestedDepartmentCode
          },
          suggestedCategory: analysis.suggestedCategory,
          suggestedPriority: analysis.suggestedPriority,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          duplicateConcern: analysis.duplicateConcern,
          duplicateReason: analysis.duplicateReason,
          duplicateCandidates: analysis.duplicateCandidates.map((candidate) => ({
            grievanceId: candidate.grievanceId?.toString(),
            referenceNumber: candidate.referenceNumber
          })),
          reviewDecision: analysis.reviewDecision,
          reviewedValues: analysis.reviewedValues ? {
            departmentId: analysis.reviewedValues.departmentId?.toString(),
            category: analysis.reviewedValues.category,
            priority: analysis.reviewedValues.priority
          } : null,
          modelProvider: analysis.modelProvider,
          modelName: analysis.modelName,
          generatedAt: analysis.createdAt,
          reviewedAt: analysis.reviewedAt || null
        }
      }
    });
  }
}