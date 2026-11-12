import { createHash } from 'node:crypto';
import Department from '../departments/department.model.js';
import { AIGrievanceAnalysisModel } from './ai-analysis.model.js';

export class AIGrievanceAnalysisRepository {
  static async create(
    input
  ) {
    const department = await Department.findOne({
      slug: input.analysis.suggestedDepartmentCode,
      isActive: true,
    });

    if (!department) {
      throw new Error(
        "Suggested department is no longer active.",
      );
    }

    const inputTextHash = createHash("sha256")
      .update(input.description.trim())
      .digest("hex");

    return AIGrievanceAnalysisModel.create({
      requestedBy: input.citizenId,

      district: input.district,

      inputTextHash,

      modelProvider: "GOOGLE_GEMINI",

      modelName: input.modelName,

      summary: input.analysis.summary,

      suggestedDepartmentId: department._id,

      suggestedDepartmentCode:
        input.analysis.suggestedDepartmentCode,

      suggestedCategory:
        input.analysis.suggestedCategory,

      suggestedPriority:
        input.analysis.suggestedPriority,

      confidence: input.analysis.confidence,

      reasoning: input.analysis.reasoning,

      duplicateConcern:
        input.analysis.duplicateConcern,

      duplicateReason:
        input.analysis.duplicateReason,

      reviewDecision: "PENDING",
    });
  }

  static async findForGrievance(grievance) {
    const inputTextHash = createHash("sha256")
      .update(grievance.description.trim())
      .digest("hex");

    return AIGrievanceAnalysisModel.findOne({
      requestedBy: grievance.citizen,
      district: grievance.district,
      $or: [
        { grievanceId: grievance._id },
        { inputTextHash },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('suggestedDepartmentId', 'name slug')
      .lean();
  }
}