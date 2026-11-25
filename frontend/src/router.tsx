import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { ShelfPage } from '@/pages/shelf-page'
import { BookPage } from '@/pages/book-page'

const optionalString = (v: unknown) => (typeof v === 'string' && v !== '' ? v : undefined)

const rootRoute = createRootRoute({ component: Outlet })

// "/"  — the 3D bookshelf. ?book=<slug> re-centres a book when coming back from the reader.
const shelfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (s: Record<string, unknown>): { book?: string } => ({ book: optionalString(s.book) }),
  component: ShelfPage,
})

// "/books/:bookSlug?chapter=<slug>" — the reader.
const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/books/$bookSlug',
  validateSearch: (s: Record<string, unknown>): { chapter?: string } => ({ chapter: optionalString(s.chapter) }),
  component: BookPage,
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([shelfRoute, bookRoute]),
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
