# Roles & access

> Status (2026-11-27): routing, guards and layouts are done in the frontend with a **mock
> sign-in**. What each role can do inside its area is not defined yet.

## Audiences

Every role stays in its own area — nothing is shared.

| Audience | Who | Can open |
|---|---|---|
| **Guest** | not signed in | `/login` only — reading requires an account |
| **User** (Learner) | role `user` | shelf `/`, reader `/books/:slug`, user area `/me/*` |
| **Admin** | role `admin` | admin area `/admin/*` only: monitoring, content management, user management. **No reading area.** |

## Route map

| Path | Access | Layout | Page |
|---|---|---|---|
| `/login` | guest | — | `pages/login-page.tsx` |
| `/` | user | — | `pages/shelf-page.tsx` (user home) |
| `/books/:bookSlug` | user | — | `pages/book-page.tsx` |
| `/me` | user | `layouts/user-layout.tsx` | `pages/user/user-home-page.tsx` |
| `/admin` | admin | `layouts/admin-layout.tsx` (sidebar) | `pages/admin/admin-home-page.tsx` |
| anything else | — | — | 404 |

Guards live in [`frontend/src/router.tsx`](../frontend/src/router.tsx) (`ensureRole` in each
route's `beforeLoad`): signed out → `/login?redirect=<where you were>`; wrong role → that role's
home (an admin opening `/` lands on `/admin`, a user opening `/admin` lands on `/`).

## Adding a page to a role

1. Create the page, e.g. `frontend/src/pages/admin/admin-books-page.tsx`.
2. Add a child route under `adminRoute` (or `userRoute`) in `router.tsx`:
   ```ts
   const adminBooksRoute = createRoute({ getParentRoute: () => adminRoute, path: '/books', component: AdminBooksPage })
   // …and add it to adminRoute.addChildren([...])
   ```
3. Add a nav item in [`frontend/src/config/navigation.ts`](../frontend/src/config/navigation.ts)
   (`ADMIN_NAV` / `USER_NAV`). The sidebar / top nav pick it up automatically.

## Auth today (mock) → Go API later

Today [`auth-provider.tsx`](../frontend/src/auth/auth-provider.tsx) stores a demo session in
`localStorage`; `/login` lets you pick a role. Everything else only uses `useAuth()`, so moving
to real auth means replacing that one file.

Suggested backend contract (session cookie, `HttpOnly`, `SameSite=Lax`):

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | `{ "email", "password" }` | `200 { "id", "name", "role" }` + `Set-Cookie` · `401` |
| `POST` | `/api/v1/auth/logout` | — | `204`, clears the cookie |
| `GET` | `/api/v1/auth/me` | — | `200 { "id", "name", "role" }` · `401` when signed out |

`role` is `"admin"` or `"user"`. **The frontend guards are only for UX — the API must enforce the
same isolation itself: user endpoints reject admins, admin endpoints reject users.**

Suggested table: `users (id, email UNIQUE, name, password_hash, role CHECK (role IN ('admin','user')), created_at)`.
