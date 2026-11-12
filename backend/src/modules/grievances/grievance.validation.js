import { z } from 'zod';
import { grievanceDistricts, grievanceStatuses } from './grievance.model.js';
import { validateRequest } from '../../utils/request-validation.js';

export const grievanceCategories = [
  'Infrastructure',
  'Health',
  'Education',
  'Public Services',
  'Water & Sanitation',
  'Transport',
  'Other'
];

export const grievanceSubmissionSchema = z.object({
  district: z.enum(grievanceDistricts),
  category: z.enum(grievanceCategories),
  subject: z.string().trim().min(5).max(200),
  description: z.string().trim().min(20).max(10000)
});

export const grievanceListQuerySchema = z.object({
  district: z.enum(grievanceDistricts).optional(),
  category: z.enum(grievanceCategories).optional(),
  status: z.enum(grievanceStatuses).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const grievanceIdParamsSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) });
export const referenceParamsSchema = z.object({
  referenceNumber: z.string().trim().regex(/^GRV-\d{8}-[A-F\d]{16}$/i)
});

export const resolutionSchema = z.object({
  decision: z.literal('resolve'),
  resolution: z.string().trim().min(3).max(5000)
});

export const assignmentSchema = z.object({
  department: z.string().regex(/^[a-f\d]{24}$/i),
  officer: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  dueAt: z.coerce.date().refine((date) => date > new Date(), 'Due date must be in the future.').optional()
});

export const actionReportSchema = z.object({
  details: z.string().trim().min(10).max(5000)
});
export const grievanceFilesSchema = z.array(z.unknown()).min(1).max(5);
export const optionalGrievanceFilesSchema = z.array(z.unknown()).max(5).default([]);
export const optionalReportFilesSchema = z.array(z.unknown()).max(5).default([]);

export const validateSubmission = validateRequest({ body: grievanceSubmissionSchema });
export const validateGrievanceList = validateRequest({ query: grievanceListQuerySchema });
export const validateGrievanceId = validateRequest({ params: grievanceIdParamsSchema });
export const validateReferenceNumber = validateRequest({ params: referenceParamsSchema });
export const validateResolution = validateRequest({ body: resolutionSchema });
export const validateAssignment = validateRequest({ body: assignmentSchema });
export const validateActionReport = validateRequest({ body: actionReportSchema });
export const validateGrievanceFiles = validateRequest({ files: grievanceFilesSchema });
export const validateOptionalGrievanceFiles = validateRequest({ files: optionalGrievanceFilesSchema });
export const validateReportFiles = validateRequest({ files: optionalReportFilesSchema });
