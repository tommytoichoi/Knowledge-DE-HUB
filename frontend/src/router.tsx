import { createRootRouteWithContext, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { ROLE_HOME, type AuthContextValue, type Role } from '@/auth/auth-context'
import { AdminLayout } from '@/layouts/admin-layout'
import { UserLayout } from '@/layouts/user-layout'
import { AdminHomePage } from '@/pages/admin/admin-home-page'
import { BookPage } from '@/pages/book-page'
import { NotFoundPage } from '@/pages/status-pages'
import { LoginPage } from '@/pages/login-page'
import { ShelfPage } from '@/pages/shelf-page'
import { UserHomePage } from '@/pages/user/user-home-page'

/*
 * Route map — every role stays in its own area
 *   Guest        /login               sign in (the only public page)
 *   User only    /                    shelf
 *                /books/:slug         reader
 *                /me/*                user area   (UserLayout)
 *   Admin only   /admin/*             admin area  (AdminLayout): monitoring, content, people
 *
 * Add a page to a role: create the page, add a child route under userRoute / adminRoute
 * below, then add a nav item in src/config/navigation.ts.
 */

interface RouterContext {
  auth: AuthContextValue
}

const optionalString = (v: unknown) => (typeof v === 'string' && v !== '' ? v : undefined)

/**
 * Route guard: signed out → /login (and come back afterwards);
 * wrong role → that role's own home (an admin opening the shelf lands on /admin).
 */
function ensureRole(auth: AuthContextValue, href: string, role: Role): void {
  if (!auth.user) throw redirect({ to: '/login', search: { redirect: href } })
  if (auth.user.role !== role) throw redirect({ to: ROLE_HOME[auth.user.role] })
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

// ── Guest ───────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({ redirect: optionalString(s.redirect) }),
  component: LoginPage,
})

// ── User only: shelf, reader, user area ─────────────────────────────────
const shelfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ context, location }) => ensureRole(context.auth, location.href, 'user'),
  validateSearch: (s: Record<string, unknown>): { book?: string } => ({ book: optionalString(s.book) }),
  component: ShelfPage,
})

const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/books/$bookSlug',
  beforeLoad: ({ context, location }) => ensureRole(context.auth, location.href, 'user'),
  validateSearch: (s: Record<string, unknown>): { chapter?: string } => ({ chapter: optionalString(s.chapter) }),
  component: BookPage,
})

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/me',
  beforeLoad: ({ context, location }) => ensureRole(context.auth, location.href, 'user'),
  component: UserLayout,
})

const userHomeRoute = createRoute({
  getParentRoute: () => userRoute,
  path: '/',
  component: UserHomePage,
})

// ── Admin only ──────────────────────────────────────────────────────────
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: ({ context, location }) => ensureRole(context.auth, location.href, 'admin'),
  component: AdminLayout,
})

const adminHomeRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminHomePage,
})

const routeTree = rootRoute.addChildren([
  shelfRoute,
  bookRoute,
  loginRoute,
  userRoute.addChildren([userHomeRoute]),
  adminRoute.addChildren([adminHomeRoute]),
])

export const router = createRouter({
  routeTree,
  context: { auth: undefined! }, // provided by <RouterProvider context> in app.tsx
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
