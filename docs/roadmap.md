# Roadmap

## Phase 0 — Skeleton ✅ (in progress)

- [x] Monorepo layout: `backend/`, `frontend/`, `content/`, `docs/`
- [x] Go API with `/healthz` (liveness) and `/api/v1/health` (readiness, pings Postgres)
- [x] React + Vite + TS app showing system status, `/api` proxied to the Go API
- [x] Postgres via Docker Compose
- [x] CI: gofmt, go vet, go test, go build · eslint, vite build
- [x] Architecture doc + ADRs
- [ ] Run the full stack locally end-to-end (needs Go installed + Docker Desktop running)

## Phase 1 — Store

- [ ] Decide `content/` folder structure
- [ ] DB migrations (e.g. [goose](https://github.com/pressly/goose)) + `notes`, `tags` tables
- [ ] `cmd/ingest`: Markdown + frontmatter → Postgres (idempotent upsert)
- [ ] API: list notes, get note by slug, filter by tag
- [ ] UI: TanStack Router + Query, Tailwind + shadcn/ui, Markdown rendering (code
      highlight, Mermaid)
- [ ] Postgres full-text search (`tsvector`) as a first search

## Phase 2 — Learn & Practice

- [ ] Roadmap page with progress tracking (stored in Postgres)
- [ ] Quizzes + flashcards with spaced repetition (ôn tập ngắt quãng)
- [ ] SQL Playground: Monaco editor + DuckDB-WASM + sample Parquet datasets
- [ ] DuckDB analytics store + Postgres → DuckDB sync job
- [ ] Learning stats dashboard (queries DuckDB)
- [ ] `labs/`: first lab (e.g. Postgres CDC, Airflow, or Spark) with docker-compose

## Phase 3 — Public

- [x] Role-based areas in the UI: guest / user (`/me`) / admin (`/admin`), route guards, mock sign-in — see [roles.md](roles.md)
- [ ] Define what each role can do inside its area
- [ ] Real auth in the Go API (session cookies, then GitHub OAuth) — contract in [roles.md](roles.md)
- [ ] Admin content editor (DB-owned content — [ADR-0003](adr/0003-postgres-owns-content.md)); backend backlog in [backend-tickets.md](backend-tickets.md)
- [ ] OpenAPI spec + generated TS client
- [ ] Single-binary deploy (`go:embed` the frontend), hosting + managed Postgres

## Phase 4 — Advanced

- [ ] AI chat over your own notes (RAG with DuckDB `vss` vector search)
- [ ] Observability: structured logs, metrics, tracing
