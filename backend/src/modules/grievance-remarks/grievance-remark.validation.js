import { z } from 'zod';
import { grievanceIdParamsSchema, validateRequest } from '../../utils/request-validation.js';

const remarkSchema = z.object({
  content: z.string().trim().min(3).max(2000),
  visibility: z.enum(['public', 'internal']).default('public')
});

export const validateRemark = validateRequest({
  params: grievanceIdParamsSchema,
  body: remarkSchema
});
