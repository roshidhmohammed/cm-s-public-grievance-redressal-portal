import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { useEffect, type ReactNode } from 'react'
import { toast } from 'sonner'
import { getCurrentUser } from '../features/auth/auth.service'
import { sessionResolved, setAuthenticated, signOut } from '../features/auth/auth.slice'
import { getApiErrorMessage } from '../lib/http'
import { useAppDispatch } from './store'
import { store } from './store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionBootstrap>{children}</SessionBootstrap>
      </QueryClientProvider>
    </Provider>
  )
}

function SessionBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then((user) => {
        if (active && store.getState().auth.isLoading) dispatch(setAuthenticated(user))
      })
      .catch((error: unknown) => {
        if (!active) return
        if (!store.getState().auth.isLoading) return
        dispatch(sessionResolved())
        if (error instanceof Error && 'response' in error && (error as { response?: { status?: number } }).response?.status === 401) {
          dispatch(signOut())
          return
        }
        toast.error(getApiErrorMessage(error))
      })

    return () => {
      active = false
    }
  }, [dispatch])

  return children
}
