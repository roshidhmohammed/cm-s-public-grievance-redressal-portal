import { z } from 'zod'

export const grievanceSchema = z.object({
  district: z.string().min(2, 'District is required'),
  category: z.string().min(2, 'Category is required'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  supportingDocuments: z.any().optional(),
})