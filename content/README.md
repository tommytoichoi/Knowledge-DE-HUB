# content/

The knowledge itself. Every `.md` file here becomes a note in the hub once
`cmd/ingest` (Phase 1) loads it into the database.

## Writing rules

- **Language:** English. Add a short Vietnamese gloss in parentheses only for terms
  that are hard to understand, e.g. *idempotent (chạy lại nhiều lần vẫn cho cùng kết quả)*.
- **One topic per file.** File name = slug, kebab-case: `oltp-vs-olap.md`.
- Folder structure is **not decided yet** — keep notes flat until it is.

## Frontmatter

Every note starts with YAML frontmatter:

```yaml
---
title: OLTP vs OLAP              # required
tags: [databases, fundamentals]  # required, lowercase kebab-case
level: beginner                  # beginner | intermediate | advanced
status: published                # draft | published
updated: 2026-11-25              # YYYY-MM-DD
---
```

The slug comes from the file name, so there is no `slug` field.
