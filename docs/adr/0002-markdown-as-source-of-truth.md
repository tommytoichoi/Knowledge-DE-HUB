# ADR-0002: Markdown files in Git are the source of truth for notes

- **Status:** Superseded by [ADR-0003](0003-postgres-owns-content.md) (2026-11-27) — admins edit content in the UI, so PostgreSQL owns it
- **Date:** 2026-11-25

## Context

Notes (the knowledge articles) could be authored either as files in the repo or in a
web editor that saves straight to the database.

## Decision

Notes are **Markdown files with YAML frontmatter in `content/`**. A Go command
(`cmd/ingest`) parses them and upserts them into PostgreSQL; the UI reads them through
the API. The database copy of a note is derived and can be rebuilt from the files.

## Consequences

- ✅ Full history and diffs via Git; nothing is lost if the DB is wiped.
- ✅ Write offline in any editor (VSCode, Obsidian).
- ✅ Ingest is a small, real ETL job: extract (read files) → transform (parse
  frontmatter, render/validate) → load (upsert).
- ⚠️ Editing requires a commit, not a browser. A web editor is planned for Phase 3;
  it will need its own decision (write back to Git vs. DB-owned notes).
- ⚠️ Folder structure inside `content/` is intentionally **not decided yet**.
