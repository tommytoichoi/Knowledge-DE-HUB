import { House, LayoutDashboard, type LucideIcon } from 'lucide-react'
import type { LinkProps } from '@tanstack/react-router'

/**
 * Sidebar / top-nav items per role. To add a page to a role:
 *   1. create the page component (src/pages/admin/... or src/pages/user/...)
 *   2. add a child route under adminRoute / userRoute in src/router.tsx
 *   3. add an item here
 */
export interface NavItem {
  label: string
  to: LinkProps['to']
  icon: LucideIcon
  /** Highlight only on an exact path match (use for the area's home). */
  exact?: boolean
}

export const ADMIN_NAV: NavItem[] = [{ label: 'Overview', to: '/admin', icon: LayoutDashboard, exact: true }]

export const USER_NAV: NavItem[] = [{ label: 'My space', to: '/me', icon: House, exact: true }]
