import { Types } from 'mongoose';
import { createHttpError } from '../../utils/api-response.js';
import Department from '../departments/department.model.js';
import { AIGrievanceAnalysisModel } from './ai-analysis.model.js';

export class AIGrievanceReviewService {
  static async review(
    analysisId,
    userId,
    role,
    input,
  ) {
    const analysis = await AIGrievanceAnalysisModel.findById(analysisId);
    if (!analysis) throw createHttpError(404, 'AI analysis not found.');

    const isCitizenOwner = analysis.requestedBy.toString() === userId && role === 'citizen';
    const isCMO = role === 'cmo';
    if (!isCitizenOwner && !isCMO) throw createHttpError(403, 'You cannot review this AI analysis.');
    if (analysis.reviewDecision !== 'PENDING') {
      throw createHttpError(409, 'This AI analysis has already been reviewed.');
    }

    let departmentId = analysis.suggestedDepartmentId;
    let category = analysis.suggestedCategory;
    let priority = analysis.suggestedPriority;

    if (input.decision === "MODIFIED") {
      if (
        !input.departmentId ||
        !input.category ||
        !input.priority
      ) {
        throw createHttpError(400, 'Department, category and priority are required when modifying suggestions.');
      }

      if (!Types.ObjectId.isValid(input.departmentId)) {
        throw createHttpError(400, 'Invalid department ID.');
      }

      const department = await Department.findOne({ _id: input.departmentId, isActive: true });
      if (!department) throw createHttpError(400, 'Selected department is unavailable.');

      departmentId = department._id;

      category = input.category;

      priority = input.priority;
    }

    analysis.reviewDecision = input.decision;

    analysis.reviewedBy = userId;

    analysis.reviewedAt = new Date();

    if (input.decision !== "REJECTED") {
      analysis.reviewedValues = {
        departmentId,
        category,
        priority,
      };
    }

    await analysis.save();

    return analysis;
  }
}