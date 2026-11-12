import { z } from "zod";

export const grievanceCategorySchema = z.enum([
  "ROADS",
  "WATER",
  "ELECTRICITY",
  "HEALTH",
  "EDUCATION",
  "SANITATION",
  "PUBLIC_SERVICES",
  "OTHER",
]);

export const prioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
]);

export const aiGrievanceAnalysisSchema = z.object({
  summary: z.string().min(1).max(500),

  suggestedDepartmentCode: z.string().min(1).max(50),

  suggestedCategory: grievanceCategorySchema,

  suggestedPriority: prioritySchema,

  confidence: z.number().min(0).max(1),

  reasoning: z.string().min(1).max(500),

  duplicateSearchText: z.string().min(1).max(300),

  duplicateConcern: z.boolean(),

  duplicateReason: z.string().max(500),
});


export const analyzeGrievanceRequestSchema = z.object({
  description: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters.")
    .max(5000, "Description cannot exceed 5000 characters."),
  district: z.string().trim().min(1).max(100),
});

export const reviewAIAnalysisSchema = z.object({
  decision: z.enum([
    "ACCEPTED",
    "MODIFIED",
    "REJECTED",
  ]),

  departmentId: z.string().optional(),

  category: grievanceCategorySchema.optional(),

  priority: prioritySchema.optional(),
});

export const aiAnalysisIdParamsSchema = z.object({
  analysisId: z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid analysis ID."),
});