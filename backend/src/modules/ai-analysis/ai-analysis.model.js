import { Schema, model, Types } from "mongoose";

const aiAnalysisSchema = new Schema(
  {
    grievanceId: {
      type: Types.ObjectId,
      ref: "Grievance",
      required: false,
      index: true,
    },

    requestedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    district: {
      type: String,
      required: true,
    },

    inputTextHash: {
      type: String,
      required: true,
    },

    modelProvider: {
      type: String,
      default: "GOOGLE_GEMINI",
    },

    modelName: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      required: true,
    },

    suggestedDepartmentId: {
      type: Types.ObjectId,
      ref: "Department",
      required: true,
    },

    suggestedDepartmentCode: {
      type: String,
      required: true,
    },

    suggestedCategory: {
      type: String,
      required: true,
    },

    suggestedPriority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },

    reasoning: {
      type: String,
      required: true,
    },

    duplicateConcern: {
      type: Boolean,
      default: false,
    },

    duplicateReason: {
      type: String,
      default: "",
    },

    duplicateCandidates: [
      {
        grievanceId: {
          type: Types.ObjectId,
          ref: "Grievance",
        },

        referenceNumber: String,

        similarityScore: Number,
      },
    ],

    reviewDecision: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "MODIFIED", "REJECTED"],
      default: "PENDING",
    },

    reviewedBy: {
      type: Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,

    reviewedValues: {
      departmentId: {
        type: Types.ObjectId,
        ref: "Department",
      },

      category: String,

      priority: String,
    },
  },
  {
    timestamps: true,
  },
);

aiAnalysisSchema.index({
  requestedBy: 1,
  createdAt: -1,
});

aiAnalysisSchema.index({
  grievanceId: 1,
  createdAt: -1,
});

export const AIGrievanceAnalysisModel = model(
  "AIGrievanceAnalysis",
  aiAnalysisSchema,
);
