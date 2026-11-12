import { z } from 'zod';
import { idParamsSchema, validateRequest } from '../../utils/request-validation.js';

const createEnquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000)
});

const enquiryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const updateEnquirySchema = z.object({
  status: z.enum(['reviewed', 'closed'])
});

export const validateCreateEnquiry = validateRequest({ body: createEnquirySchema });
export const validateEnquiryList = validateRequest({ query: enquiryListQuerySchema });
export const validateUpdateEnquiry = validateRequest({
  params: idParamsSchema,
  body: updateEnquirySchema
});
