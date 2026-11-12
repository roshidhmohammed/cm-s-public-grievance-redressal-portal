import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import type { UserRole } from '../../features/auth/auth.types'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export type EmptyStateProps = {
  title: string
  description?: string
}

export type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

export type ErrorBoundaryState = {
  hasError: boolean
}

export type LayoutProps = {
  children: ReactNode
}

export type LoadingSpinnerProps = {
  label?: string
}

export type ProtectedRouteProps = {
  children: ReactNode
}

export type RoleProtectedRouteProps = ProtectedRouteProps & {
  requiredRole: UserRole
}