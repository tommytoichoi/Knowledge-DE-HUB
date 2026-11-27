# ADR-0003: PostgreSQL owns the content; Markdown is an import format

- **Status:** Accepted
- **Date:** 2026-11-27
- **Supersedes:** [ADR-0002](0002-markdown-as-source-of-truth.md)

## Context

ADR-0002 made Markdown files in Git the source of truth for notes. Since then the roles were
defined ([roles.md](../roles.md)): **admins add, edit and delete content from the admin UI**.
Two owners for the same content would drift apart, so one has to win.

## Options considered

1. **PostgreSQL owns content.** `content/*.md` is imported once (and whenever you want to seed
   new material) by `cmd/ingest`; after that the admin UI edits the database.
2. **Git keeps owning content.** Every admin edit is committed back to the repository through the
   GitHub API. Full Git history, but needs a GitHub token on the server, conflict handling, and a
   rebuild/redeploy or re-ingest after every edit.

## Decision

Option 1. **Books and chapters live in PostgreSQL** (`books`, `chapters` tables). Markdown stays the
*format* of a chapter body (`chapters.body_md`) and the *import* format for `cmd/ingest`.

## Consequences

- ✅ Admin CRUD is a normal API + database feature — no Git plumbing on the server.
- ✅ Draft / published status, ordering and audit log are easy to add in SQL.
- ✅ `cmd/ingest` stays useful: seed a fresh database, bulk-import new notes written in an editor.
- ⚠️ The database now needs **backups** (it is no longer rebuildable from Git). Add `pg_dump` to the
  deploy plan; an optional "export to Markdown" job can keep a readable copy in Git.
- ⚠️ Content history is no longer `git log`; the `audit_log` table records who changed what and when.
- ⚠️ Re-running `cmd/ingest` must not overwrite edits made in the UI: it only inserts missing
  chapters unless run with an explicit `--overwrite`.
