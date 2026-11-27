# Backend tickets (Go API)

> Drafted 2026-11-27 · this file **is** the tracker — tick a box when a ticket is done.
> Written for someone **new to Go**: every ticket lists the Go concepts you will meet.

## Progress

- [x] BE-00 ADR-0003: Postgres owns the content
- [ ] BE-01 Dev loop: hot reload in Docker
- [ ] BE-02 HTTP conventions
- [ ] BE-03 Database migrations
- [ ] BE-04 Schema v1
- [ ] BE-05 Data access with sqlc
- [ ] BE-06 Passwords + first admin
- [ ] BE-07 Sessions
- [ ] BE-08 Auth endpoints
- [ ] BE-09 Role middleware (RBAC)
- [ ] BE-10 Frontend: real sign-in
- [ ] BE-11 Content import: cmd/ingest
- [ ] BE-12 Read API (users)
- [ ] BE-13 Frontend: shelf + reader from the API
- [ ] BE-14 Admin: content management
- [ ] BE-15 Admin: user management
- [ ] BE-16 Admin: monitoring v1
- [ ] BE-17 Tests & CI
- [ ] BE-18 API contract with OpenAPI (optional)

## What the backend must deliver

The frontend already has three audiences ([roles.md](roles.md)). The API has to back them:

| Area | Needs from the API |
|---|---|
| **Guest** | sign in |
| **User** | sign in/out, list books, read chapters, (later) own progress |
| **Admin** | monitoring, content management (books + chapters CRUD), user management |

Current state: `backend/` has the skeleton only — config, a Postgres pool, `/healthz`,
`/api/v1/health`, Docker image, CI.

## Milestones

| Milestone | Tickets | Result you can see |
|---|---|---|
| **M0 Decide** | BE-00 | Content ownership settled |
| **M1 Sign in works** | BE-01 → BE-10 | Real login on `/login`; mock auth removed |
| **M2 Read from the API** | BE-11 → BE-13 | Shelf + reader load from Postgres |
| **M3 Admin** | BE-14 → BE-16 | Admin can monitor, edit content, manage people |
| **Ongoing** | BE-17 (tests/CI), BE-18 (API contract, optional) | |

Sizes: **S** ≈ an evening · **M** ≈ 2–3 evenings · **L** ≈ a week of evenings.

```
BE-00 ─┐
BE-01 ─┼─ BE-02 ─ BE-03 ─ BE-04 ─ BE-05 ─┬─ BE-06 ─ BE-07 ─ BE-08 ─ BE-09 ─ BE-10   (M1)
       │                                 ├─ BE-11 ─ BE-12 ─ BE-13                   (M2)
       │                                 └─ (needs BE-09) BE-14 · BE-15 · BE-16     (M3)
```

## Go in 2 minutes — what you need before starting

- **Packages & layout.** `cmd/<name>/main.go` = a runnable program (`cmd/api`, later `cmd/migrate`,
  `cmd/ingest`, `cmd/admin`). `internal/...` = app code that only this module can import.
- **Errors are values** (lỗi là giá trị trả về, không có try/catch): functions return `(result, error)`;
  you check `if err != nil { return ..., fmt.Errorf("doing X: %w", err) }`. `%w` wraps the error so
  `errors.Is` can find the cause later.
- **`context.Context`** carries deadlines and cancellation through a request (và dữ liệu theo request,
  ví dụ user đang đăng nhập). Every DB call takes `ctx` as its first argument.
- **Interfaces are implicit** (không cần khai báo "implements"): a type satisfies an interface just by
  having its methods — that is how `httpapi.Pinger` lets tests use a fake DB.
- **Middleware** = a function that takes an `http.Handler` and returns a new one that does something
  before/after (logging, auth).
- Learn: [A Tour of Go](https://go.dev/tour) (2–3h) → [Go by Example](https://gobyexample.com) as a cheat
  sheet → [Effective Go](https://go.dev/doc/effective_go) once things click.

---

## M0 — Decide

### BE-00 · ADR-0003: who owns the content — Git or the database? · S · decision · ✅ done

**Decided 2026-11-27: PostgreSQL owns content** → [ADR-0003](adr/0003-postgres-owns-content.md).

**Why.** [ADR-0002](adr/0002-markdown-as-source-of-truth.md) says Markdown files in Git are the source
of truth. But admins must now **add / edit / delete** content from the UI. Both cannot own it.

**Options.**
1. **Postgres owns content** (recommended). `cmd/ingest` becomes an *import* tool (seed from
   `content/*.md`); after that, admins edit in the UI. Optional later: export to Markdown for backup.
2. **Git stays the owner**; the admin UI commits Markdown back to the repo through the GitHub API.
   Full history, but much more complex (tokens, conflicts, deploy on every edit).

**Done when.** `docs/adr/0003-*.md` is written and ADR-0002 is marked *Superseded* (if option 1).

---

## M1 — Sign in works

### BE-01 · Dev loop: hot reload in Docker · S

**Why.** Today every Go change needs `docker compose --profile api up -d --build`. Hot reload
(tự build lại khi lưu file) makes learning much faster.

**Tasks.**
- Add a `dev` stage to `backend/Dockerfile` that runs [air](https://github.com/air-verse/air).
- Compose: `api-dev` service (profile `dev`) mounting `./backend` as a volume.
- Document `docker compose --profile dev up` in the README.

**Done when.** Saving a `.go` file restarts the API within a few seconds.
**Go concepts.** modules (`go.mod`/`go.sum`), `go build`, multi-stage Docker builds.

### BE-02 · HTTP conventions: JSON, errors, validation, logging · S

**Tasks.**
- `internal/httpapi/respond.go`: `writeJSON`, `readJSON` (limit body size, reject unknown fields).
- One error shape for every endpoint: `{"error": {"code": "not_found", "message": "..."}}`.
- Request logging with `log/slog` (method, path, status, duration, request id) instead of chi's logger.
- Map domain errors to status codes in one place (`ErrNotFound` → 404, `ErrConflict` → 409 …).

**Done when.** Handlers never write raw `http.Error`; tests cover a 400 and a 404 response.
**Go concepts.** `http.Handler` / `http.HandlerFunc`, middleware, `encoding/json` struct tags,
sentinel errors + `errors.Is`.

### BE-03 · Database migrations · S

**Why.** Schema changes must be versioned and repeatable (giống git cho cấu trúc database).

**Tasks.**
- [goose](https://github.com/pressly/goose) with SQL files in `backend/migrations/`, embedded with `go:embed`.
- `cmd/migrate` with `up`, `down`, `status`; compose runs `up` before the API starts.

**Done when.** A fresh `docker compose down -v && up` creates the schema automatically.
**Go concepts.** `embed.FS`, a second `main` package, exit codes.

### BE-04 · Schema v1 · M

**Tables (Postgres — the OLTP store).**
- `users` — `id uuid`, `email citext unique`, `name`, `password_hash`, `role` (`CHECK role IN ('admin','user')`),
  `is_active bool`, `last_login_at`, `created_at`, `updated_at`.
- `sessions` — `id`, `user_id → users ON DELETE CASCADE`, `token_hash bytea unique`, `expires_at`,
  `created_at`, `user_agent`, `ip`.
- `books` — `id`, `slug unique`, `title`, `subtitle`, `eyebrow`, `cover_color`, `cover_text_color`,
  `position`, `status` (`draft|published`), timestamps.
- `chapters` — `id`, `book_id → books ON DELETE CASCADE`, `slug unique`, `title`, `level`, `tags text[]`,
  `body_md`, `position`, `status`, timestamps; `UNIQUE (book_id, position)`.
- `audit_log` — `id`, `actor_id → users`, `action`, `entity`, `entity_id`, `details jsonb`, `created_at`.

**Done when.** Migration `0001_init.sql` applies cleanly; an ERD (sơ đồ quan hệ bảng) is added to
`docs/architecture.md`.
**Concepts.** normalisation (3NF) — exactly the OLTP side of
[OLTP vs OLAP](../content/oltp-vs-olap.md); constraints as the last line of defence.

### BE-05 · Data access with sqlc · M

**Why.** [sqlc](https://sqlc.dev) turns plain SQL queries into typed Go functions — you write SQL
(good DE practice), Go code is generated. No ORM magic.

**Tasks.**
- `backend/sqlc.yaml`, queries in `backend/queries/*.sql`, generated code in `internal/db`.
- A small store per domain (`internal/users`, `internal/content`) that wraps the generated queries.
- A `WithTx` helper for multi-statement writes.

**Done when.** `sqlc generate` is in CI (fails if generated code is stale); each store has tests.
**Go concepts.** code generation, `pgx` types, pointers for nullable columns, transactions.

### BE-06 · Passwords + first admin · S

**Tasks.**
- Hash with `golang.org/x/crypto/bcrypt` (cost 12). Never log passwords.
- `cmd/admin create-user --email --name --role admin` (asks for the password in the terminal).

**Done when.** You can create the first admin from the terminal; tests check hash ≠ password and
that a wrong password fails.
**Go concepts.** `flag` package, reading from stdin, `x/` packages.

### BE-07 · Sessions · M

**How it works.** On login, create a random 32-byte token (`crypto/rand`), store only its **SHA-256
hash** in `sessions`, send the raw token in a cookie `dehub_session` (`HttpOnly`, `SameSite=Lax`,
`Secure` in prod, 14 days). A middleware reads the cookie, looks up the session, and puts the user in
the request `context`.

**Tasks.** session store (create / lookup / delete / delete-expired), `LoadSession` middleware,
`UserFromContext(ctx)` helper, a cleanup job for expired sessions.

**Done when.** A request with a valid cookie has the user in `ctx`; expired or unknown tokens behave
like "signed out".
**Go concepts.** `crypto/rand`, `crypto/sha256`, `http.Cookie`, context keys, goroutines + `time.Ticker`
for the cleanup job.

### BE-08 · Auth endpoints · M

| Method | Path | Result |
|---|---|---|
| `POST` | `/api/v1/auth/login` | `{email, password}` → `200 {id, name, role}` + cookie · `401` |
| `POST` | `/api/v1/auth/logout` | `204`, session deleted, cookie cleared |
| `GET` | `/api/v1/auth/me` | `200 {id, name, role}` · `401` |

**Tasks.** Same error for "no such email" and "wrong password" (don't reveal which accounts exist);
rate-limit login per IP + email (`golang.org/x/time/rate`); refuse inactive users; update `last_login_at`;
write an `audit_log` row.

**Done when.** Table-driven tests (bảng test case) cover success, wrong password, inactive user,
rate-limited, logout.
**Go concepts.** table-driven tests, `httptest`, `sync.Mutex` for the in-memory limiter.

### BE-09 · Role middleware (RBAC) · S

**Tasks.** `RequireUser` and `RequireAdmin` middleware. Mirror the frontend isolation: **user endpoints
reject admins, admin endpoints reject users** (`403`). Route groups in chi: `/api/v1/...` (user),
`/api/v1/admin/...` (admin).

**Done when.** Tests prove a user gets 403 on an admin route and an admin gets 403 on a user route.
**Go concepts.** closures (`func RequireRole(role) func(http.Handler) http.Handler`), chi route groups.

### BE-10 · Frontend: real sign-in · S

**Tasks.** Replace the mock [`auth-provider.tsx`](../frontend/src/auth/auth-provider.tsx): load the
session with `GET /auth/me` on start, real email + password form on `/login`, `POST /auth/logout` on
sign out. Nothing else in the frontend changes.

**Done when.** The demo role cards are gone; refresh keeps you signed in; signing out works.

---

## M2 — Read from the API

### BE-11 · Content import: `cmd/ingest` · M

**Tasks.**
- Move the book list from `frontend/src/data/books.ts` into `content/books.yaml` (slug, title, cover,
  chapter order).
- Parse `content/*.md` frontmatter (`gopkg.in/yaml.v3`) + body; insert missing books and chapters in
  one transaction (chạy lại nhiều lần vẫn ra cùng kết quả — idempotent). Never overwrite edits made in
  the admin UI unless `--overwrite` is passed (ADR-0003). `--dry-run` prints the plan.

**Done when.** `go run ./cmd/ingest` loads the current notes; running it twice changes nothing.
**Go concepts.** `os.ReadDir`, `filepath`, YAML struct tags, transactions.

### BE-12 · Read API (users) · M

| Method | Path | Returns |
|---|---|---|
| `GET` | `/api/v1/books` | published books + chapter counts |
| `GET` | `/api/v1/books/{slug}` | book + chapter list (title, slug, written?) |
| `GET` | `/api/v1/books/{slug}/chapters/{chapterSlug}` | chapter with Markdown body |

Only `published` content; user role only (BE-09).
**Done when.** Endpoints + tests; 404 for unknown or draft content.
**Go concepts.** chi URL params, response DTOs (kiểu dữ liệu riêng cho API, tách khỏi struct DB).

### BE-13 · Frontend: shelf + reader from the API · M

**Tasks.** TanStack Query hooks (`useBooks`, `useBook`, `useChapter`), loading skeletons and error
states; delete `src/data/content.ts`, the `@content` alias and the mock `books.ts`.

**Done when.** The shelf renders from Postgres; editing a chapter in the DB shows up after refresh.

---

## M3 — Admin

### BE-14 · Admin: content management · L

**Endpoints** under `/api/v1/admin`: books and chapters — list (including drafts), create, update,
delete, reorder, publish/unpublish.

**Rules.** Validate slugs (lowercase-kebab, unique) and required fields; deleting a book needs a
confirmation flag; every change writes `audit_log`.

**Done when.** Full CRUD with tests; a chapter set back to draft disappears for users.
**Go concepts.** request validation, `PATCH` semantics (only update fields that were sent → pointers),
optimistic locking with `updated_at` (tránh hai admin ghi đè lên nhau).

### BE-15 · Admin: user management · M

**Endpoints.** list (search + pagination), create, change role, deactivate / reactivate (no hard
delete), reset password.

**Rules.** An admin cannot deactivate or demote themselves; the **last active admin** cannot be removed.
Deactivating a user deletes their sessions. Everything goes to `audit_log`.

**Done when.** Tests cover the "last admin" and "self" rules.
**Go concepts.** keyset vs offset pagination, transactions with `SELECT … FOR UPDATE`.

### BE-16 · Admin: monitoring v1 · M

**Endpoint.** `GET /api/v1/admin/overview` →
- counts: users (active / inactive), active sessions, books, chapters (published / draft);
- recent sign-ins and recent `audit_log` events;
- system: database up, API version, uptime, Go version.

Later (Phase 2): learning analytics from DuckDB (the OLAP side).
**Done when.** The admin Overview page can render from this single call.
**Go concepts.** running queries concurrently with `errgroup`, `runtime/debug.ReadBuildInfo`.

---

## Ongoing

### BE-17 · Tests & CI · M

Unit tests with `httptest`; integration tests against a real Postgres (GitHub Actions service
container); `go test -race ./...`; coverage report in CI.
**Go concepts.** `testing` package, test helpers with `t.Helper()` and `t.Cleanup()`, build tags.

### BE-18 · API contract with OpenAPI (optional) · M

Write `backend/openapi.yaml`, generate Go server interfaces (oapi-codegen) and TypeScript types for
the frontend, so both sides can't drift apart.

---

## Out of scope for now

Progress tracking, quizzes, SQL playground, DuckDB sync, OAuth login, email (password reset by
email) — each gets its own tickets when defined.
