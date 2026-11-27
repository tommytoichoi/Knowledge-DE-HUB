import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type Role, type SessionUser } from './auth-context'

/**
 * TEMPORARY mock auth — the session lives in localStorage and you pick a role on /login.
 *
 * To switch to the Go API (see docs/roles.md), replace only this file:
 *   - initial state  → GET  /api/v1/auth/me      (session cookie) → SessionUser | 401
 *   - signIn         → POST /api/v1/auth/login   { email, password } → SessionUser
 *   - signOut        → POST /api/v1/auth/logout
 * Everything else (guards, layouts, menus) only depends on `useAuth()`.
 */

const STORAGE_KEY = 'dehub.session'

const DEMO_USERS: Record<Role, SessionUser> = {
  admin: { id: 'demo-admin', name: 'Admin', role: 'admin' },
  user: { id: 'demo-user', name: 'Learner', role: 'user' },
}

function loadSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SessionUser>
    return parsed.role === 'admin' || parsed.role === 'user' ? DEMO_USERS[parsed.role] : null
  } catch {
    return null // storage blocked or corrupted → signed out
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(loadSession)

  const signIn = useCallback((role: Role) => {
    const next = DEMO_USERS[role]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* session still works for this tab */
    }
    setUser(next)
  }, [])

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
