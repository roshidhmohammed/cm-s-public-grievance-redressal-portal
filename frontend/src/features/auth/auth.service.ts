import type { AuthUser, UserRole } from './auth.types'
import { api } from '../../lib/http'

type ApiResponse<T> = {
  success: true
  data: T
}

type AuthResponse = ApiResponse<{ user: AuthUser }>

export type AuthCredentials = {
  email: string
  password: string
}

export async function login(credentials: AuthCredentials): Promise<AuthUser> {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials)
  return data.data.user
}

export async function registerCitizen(values: {
  fullName: string
  email: string
  mobile: string
  password: string
}): Promise<AuthUser> {
  const { data } = await api.post<AuthResponse>('/auth/register', values)
  return data.data.user
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthResponse>('/auth/me')
  return data.data.user
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function createDepartmentOfficer(values: {
  fullName: string
  email: string
  mobile: string
  password: string
  department?: string
}): Promise<AuthUser> {
  const { data } = await api.post<AuthResponse>('/departments/officers', values)
  return data.data.user
}

export function getRoleHomePath(role: UserRole) {
  switch (role) {
    case 'cmo':
      return '/cmo/dashboard'
    case 'department_officer':
      return '/department/dashboard'
    case 'citizen':
      return '/citizen/dashboard'
    case 'public':
      return '/'
  }
}
