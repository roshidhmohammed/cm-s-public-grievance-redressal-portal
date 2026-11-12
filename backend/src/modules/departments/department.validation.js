import { z } from 'zod';
import { idParamsSchema, validateRequest } from '../../utils/request-validation.js';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid ID.');

const createDepartmentSchema = z.object({
  name: z.string().trim().min(2).max(120).refine((name) => /[a-z0-9]/i.test(name), {
    message: 'Department name must contain letters or numbers.'
  }),
  description: z.string().trim().min(10).max(500),
  officerId: objectIdSchema.optional()
});

const assignOfficerSchema = z.object({
  officerId: objectIdSchema
});

export const validateDepartmentId = validateRequest({ params: idParamsSchema });
export const validateCreateDepartment = validateRequest({ body: createDepartmentSchema });
export const validateOfficerAssignment = validateRequest({
  params: idParamsSchema,
  body: assignOfficerSchema
});
