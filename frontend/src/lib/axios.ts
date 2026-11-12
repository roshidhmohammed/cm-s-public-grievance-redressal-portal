import axios, { type AxiosError } from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? 'http://localhost:8080'
const baseURL = configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    const portalRole = path.startsWith('/cmo')
      ? 'cmo'
      : path.startsWith('/department')
        ? 'department_officer'
        : 'citizen'
    config.headers.set('X-Portal-Role', portalRole)
  }
  return config
})

export function getApiErrorMessage(error: unknown, fallback = 'The request could not be completed.') {
  const apiError = error as AxiosError<{ message?: string; errors?: string[] }>
  const { message, errors } = apiError.response?.data ?? {}

  if (errors?.length) return errors.join(' ')
  if (message) return message
  if (apiError.code === 'ERR_NETWORK') return 'Cannot reach the API. Check that the backend is running at http://localhost:8080.'
  if (!apiError.isAxiosError && error instanceof Error) return error.message
  return fallback
}
