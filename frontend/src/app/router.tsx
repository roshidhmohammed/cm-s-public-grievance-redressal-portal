import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const AccessDeniedPage = lazy(() => import('../pages/AccessDeniedPage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const ContactPage = lazy(() => import('../pages/ContactPage'))
const DepartmentsPage = lazy(() => import('../pages/DepartmentsPage'))
const DepartmentDashboardPage = lazy(() => import('../features/department/components/DepartmentDashboardPage'))
const DepartmentGrievanceDetailPage = lazy(() => import('../features/department/components/DepartmentGrievanceDetailPage'))
const DepartmentGrievancesPage = lazy(() => import('../features/department/components/DepartmentGrievancesPage'))
const DepartmentLoginPage = lazy(() => import('../features/department/components/DepartmentLoginPage'))
const FAQPage = lazy(() => import('../pages/FAQPage'))
const HomePage = lazy(() => import('../pages/HomePage'))
const HowItWorksPage = lazy(() => import('../pages/HowItWorksPage'))
const CitizenDashboardPage = lazy(() => import('../features/citizen/components/CitizenDashboardPage'))
const CitizenFeedbackPage = lazy(() => import('../features/citizen/components/CitizenFeedbackPage'))
const CitizenLoginPage = lazy(() => import('../features/citizen/components/CitizenLoginPage'))
const CitizenRegisterPage = lazy(() => import('../features/citizen/components/CitizenRegisterPage'))
const CitizenSubmitGrievancePage = lazy(() => import('../features/citizen/components/CitizenSubmitGrievancePage'))
const CitizenTrackPage = lazy(() => import('../features/citizen/components/CitizenTrackPage'))
const CmoDashboardPage = lazy(() => import('../features/cmo/components/CmoDashboardPage'))
const CmoAdministrationPage = lazy(() => import('../features/cmo/components/CmoAdministrationPage'))
const CmoDepartmentsPage = lazy(() => import('../features/cmo/components/CmoDepartmentsPage'))
const CmoGrievanceDetailPage = lazy(() => import('../features/cmo/components/CmoGrievanceDetailPage'))
const CmoGrievancesPage = lazy(() => import('../features/cmo/components/CmoGrievancesPage'))
const CmoLoginPage = lazy(() => import('../features/cmo/components/CmoLoginPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
import {
  CitizenProtectedRoute,
  CmoProtectedRoute,
  DepartmentProtectedRoute,
} from '../shared/components/ProtectedRoute'

export function AppRouter() {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-center text-slate-600">Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/track" element={<CitizenTrackPage />} />
        <Route path="/citizen/login" element={<CitizenLoginPage />} />
        <Route path="/citizen/register" element={<CitizenRegisterPage />} />
        <Route path="/cmo/login" element={<CmoLoginPage />} />
        <Route path="/department/login" element={<DepartmentLoginPage />} />
        <Route
          path="/citizen/dashboard"
          element={
            <CitizenProtectedRoute>
              <CitizenDashboardPage />
            </CitizenProtectedRoute>
          }
        />
        <Route
          path="/citizen/submit"
          element={
            <CitizenProtectedRoute>
              <CitizenSubmitGrievancePage />
            </CitizenProtectedRoute>
          }
        />
        <Route
          path="/citizen/track"
          element={
            <CitizenProtectedRoute>
              <CitizenTrackPage />
            </CitizenProtectedRoute>
          }
        />
        <Route
          path="/citizen/feedback"
          element={
            <CitizenProtectedRoute>
              <CitizenFeedbackPage />
            </CitizenProtectedRoute>
          }
        />
        <Route
          path="/cmo/dashboard"
          element={
            <CmoProtectedRoute>
              <CmoDashboardPage />
            </CmoProtectedRoute>
          }
        />
        <Route
          path="/cmo/grievances"
          element={
            <CmoProtectedRoute>
              <CmoGrievancesPage />
            </CmoProtectedRoute>
          }
        />
        <Route
          path="/cmo/administration"
          element={
            <CmoProtectedRoute>
              <CmoAdministrationPage />
            </CmoProtectedRoute>
          }
        />
        <Route
          path="/cmo/departments"
          element={
            <CmoProtectedRoute>
              <CmoDepartmentsPage />
            </CmoProtectedRoute>
          }
        />
        <Route
          path="/cmo/grievances/:reference"
          element={
            <CmoProtectedRoute>
              <CmoGrievanceDetailPage />
            </CmoProtectedRoute>
          }
        />
        <Route
          path="/department/dashboard"
          element={
            <DepartmentProtectedRoute>
              <DepartmentDashboardPage />
            </DepartmentProtectedRoute>
          }
        />
        <Route
          path="/department/grievances"
          element={
            <DepartmentProtectedRoute>
              <DepartmentGrievancesPage />
            </DepartmentProtectedRoute>
          }
        />
        <Route
          path="/department/grievances/:reference"
          element={
            <DepartmentProtectedRoute>
              <DepartmentGrievanceDetailPage />
            </DepartmentProtectedRoute>
          }
        />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  )
}
