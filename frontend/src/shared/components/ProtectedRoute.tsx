import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../app/store'
import type { UserRole } from '../../features/auth/auth.types'
import { LoadingSpinner } from './LoadingSpinner'

type ProtectedRouteProps = {
  children: ReactNode
}

function RoleProtectedRoute({ children, requiredRole }: ProtectedRouteProps & { requiredRole: UserRole }) {
  const location = useLocation()
  const { isAuthenticated, isLoading, role } = useAppSelector((state) => state.auth)

  if (isLoading) {
    return <LoadingSpinner label="Checking your session..." />
  }

  if (!isAuthenticated) {
    const loginPath = requiredRole === 'department_officer'
      ? '/department/login'
      : `/${requiredRole}/login`
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  if (role !== requiredRole) {
    return <Navigate to="/access-denied" replace state={{ from: location }} />
  }

  return children
}

export function CitizenProtectedRoute({ children }: ProtectedRouteProps) {
  return <RoleProtectedRoute requiredRole="citizen">{children}</RoleProtectedRoute>
}

export function CmoProtectedRoute({ children }: ProtectedRouteProps) {
  return <RoleProtectedRoute requiredRole="cmo">{children}</RoleProtectedRoute>
}

export function DepartmentProtectedRoute({ children }: ProtectedRouteProps) {
  return <RoleProtectedRoute requiredRole="department_officer">{children}</RoleProtectedRoute>
}
