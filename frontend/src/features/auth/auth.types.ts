export type UserRole = 'citizen' | 'cmo' | 'department_officer' | 'public'

export type AuthUser = {
  id: string
  fullName: string
  email: string
  mobile?: string
  department?: string | null
  role: UserRole
}
