# DE Knowledge Hub

A personal hub to **store, learn and practice Data Engineering** — notes, a learning
roadmap, interview prep and hands-on labs — built as a real full-stack app so the
tech is part of the learning.

| Layer | Tech |
|---|---|
| Frontend | React · Vite · TypeScript |
| Backend | Go · chi · pgx |
| App data (OLTP) | PostgreSQL |
| Analytics (OLAP) | DuckDB *(Phase 2)* |
| Content | Markdown in [`content/`](content/) |

Read more: [architecture](docs/architecture.md) · [roadmap](docs/roadmap.md) ·
[decisions (ADRs)](docs/adr/)

## Prerequisites

- [Go](https://go.dev/dl/) 1.27+ — Windows: `winget install GoLang.Go`
- [Node.js](https://nodejs.org/) 24+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

## Quick start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Start the API  ->  http://localhost:8080/api/v1/health
cd backend
go run ./cmd/api

# 3. Start the UI (new terminal)  ->  http://localhost:5173
cd frontend
npm install
npm run dev
```

The UI shows **API: up** and **PostgreSQL: up** when everything is wired correctly.

### No Go installed? Run the API in Docker

```bash
docker compose --profile api up -d --build   # Postgres + Go API (built inside Docker)
cd frontend && npm install && npm run dev    # UI as usual
```

Rebuild after changing Go code: `docker compose --profile api up -d --build api`.
Stop everything: `docker compose --profile api down`.

Settings come from environment variables; defaults match `docker-compose.yml`. See
[`.env.example`](.env.example) for the full list.

## Common commands

| Task | Command |
|---|---|
| Backend tests | `cd backend && go test ./...` |
| Backend lint | `cd backend && gofmt -l . && go vet ./...` |
| Frontend lint / build | `cd frontend && npm run lint && npm run build` |
| Stop Postgres | `docker compose down` (add `-v` to delete data) |

## Repository layout

```
backend/    Go API (cmd/ = entrypoints, internal/ = app code)
frontend/   React app
content/    Markdown notes — the knowledge itself
docs/       Architecture, roadmap, ADRs
```
