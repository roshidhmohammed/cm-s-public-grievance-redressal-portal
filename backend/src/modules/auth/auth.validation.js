import { z } from 'zod';
import { validateRequest } from '../../utils/request-validation.js';

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());
const mobileSchema = z.string()
  .trim()
  .regex(/^\+?[0-9\s()-]{7,20}$/, 'A valid mobile number is required.');
const nameSchema = z.string().trim().min(2).max(120);
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid ID.');

const registrationSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  mobile: mobileSchema,
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

const officerSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  mobile: mobileSchema,
  password: z.string().min(12).max(128),
  department: objectIdSchema.optional()
});

export const validateRegistration = validateRequest({ body: registrationSchema });
export const validateLogin = validateRequest({ body: loginSchema });
export const validateOfficer = validateRequest({ body: officerSchema });
