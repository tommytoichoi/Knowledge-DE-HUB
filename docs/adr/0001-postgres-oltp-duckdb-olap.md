# ADR-0001: PostgreSQL for app data (OLTP), DuckDB for analytics (OLAP)

- **Status:** Accepted
- **Date:** 2026-11-25

> ADR = Architecture Decision Record (biên bản ghi lại một quyết định kiến trúc:
> bối cảnh, lựa chọn, và hệ quả — để sau này nhìn lại biết *tại sao*).

## Context

The hub stores two kinds of data with opposite access patterns:

- **App state** — notes, users, learning progress, quiz attempts. Many small
  `INSERT`/`UPDATE`s, possibly from several users at once once the hub is public.
- **Analytics** — "topics I fail most this month", progress over time, search across
  all notes. Few queries, each scanning many rows.

We also want to learn both an OLTP and an OLAP engine in depth.

## Options considered

1. **DuckDB only** — simplest, but DuckDB allows a single writer process and is not
   built for many small concurrent writes. Blocks horizontal scaling later.
2. **SQLite + DuckDB** — both embedded files, no DB server. SQLite is less common in
   DE job requirements than Postgres.
3. **PostgreSQL + DuckDB** — client/server OLTP store plus embedded OLAP engine.

## Decision

Option 3. **PostgreSQL is the system of record** for all app data. **DuckDB is a
derived analytics store**, filled from Postgres by a sync job (DuckDB's `postgres`
extension can `ATTACH` a Postgres database and copy tables).

## Consequences

- ✅ Each engine does what it is designed for.
- ✅ Mirrors real DE architecture (source DB → pipeline → warehouse); the sync job is a
  hands-on ETL exercise.
- ✅ DuckDB can be deleted and rebuilt at any time — no backup needed for it.
- ⚠️ Two databases to run; analytics are slightly stale (as fresh as the last sync).
- ⚠️ The Go DuckDB driver requires cgo (see architecture.md → Known constraints).
