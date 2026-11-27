import { createContext, useContext } from 'react'

/**
 * Roles of the hub. Every role stays in its own area:
 *   - guest (signed out): only /login
 *   - user:  the shelf, the reader and /me
 *   - admin: only /admin — monitoring, content and people; no reading area
 */
export type Role = 'admin' | 'user'

export interface SessionUser {
  id: string
  name: string
  role: Role
}

export interface AuthContextValue {
  user: SessionUser | null
  signIn: (role: Role) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Where each role lands after signing in. */
export const ROLE_HOME = { admin: '/admin', user: '/' } as const satisfies Record<Role, string>

export const ROLE_LABEL: Record<Role, string> = { admin: 'Admin', user: 'Learner' }

export const hasRole = (user: SessionUser | null, roles: readonly Role[]) => !!user && roles.includes(user.role)
