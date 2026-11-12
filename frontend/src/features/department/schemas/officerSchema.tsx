import { z } from 'zod'

export const officerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
  mobile: z.string().regex(/^\+?[0-9\s()-]{7,20}$/, 'Enter a valid mobile number'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters').max(128),
  confirmPassword: z.string().min(12, 'Please confirm your password'),
  department: z.string().optional(),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})