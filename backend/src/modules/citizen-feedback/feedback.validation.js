import { z } from 'zod';
import { grievanceIdParamsSchema, validateRequest } from '../../utils/request-validation.js';

const feedbackSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).default('')
});

export const validateFeedback = validateRequest({
  params: grievanceIdParamsSchema,
  body: feedbackSchema
});
