import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider } from '@/auth/auth-provider'
import { useAuth } from '@/auth/auth-context'
import { router } from '@/router'

export function App() {
  return (
    <AuthProvider>
      <RoutedApp />
    </AuthProvider>
  )
}

/** Gives the router the current session so route guards (beforeLoad) can check roles. */
function RoutedApp() {
  const auth = useAuth()

  // Re-run guards when the session changes (e.g. signing out while on /admin).
  useEffect(() => {
    router.invalidate()
  }, [auth.user])

  return <RouterProvider router={router} context={{ auth }} />
}
