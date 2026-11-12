import type { grievanceSchema } from "../schemas/grievanceSchema"
import type { loginSchema } from "../schemas/loginSchema"
import type { registerSchema } from "../schemas/registerSchema"
import { z } from 'zod'

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type GrievanceFormValues = z.infer<typeof grievanceSchema>