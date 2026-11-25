# Design system

> Chosen 2026-11-25. Tokens live in [`frontend/src/index.css`](../frontend/src/index.css).

## Concept: a knowledge shelf

- **Home = a 3D bookshelf.** Each Data Engineering topic is a *book*; each note is a *chapter*.
  Built on the Cue "3D Book Carousel Reading Mode" component
  ([`cue-3d-book-carousel-reading-mode.tsx`](../frontend/src/components/ui/cue-3d-book-carousel-reading-mode.tsx)).
- **Reading is just reading.** Opening a book leads to the reader: chapter sidebar (table of
  contents) + the chapter. No quizzes or widgets inside the text.
- **Practice is a separate feature** (quizzes, flashcards, SQL playground — Phase 2) with its own pages.

## Color — Slate + Blue

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#F8FAFC` | `#0B1120` | Page |
| `--foreground` | `#1E293B` | `#E2E8F0` | Text |
| `--card` | `#FFFFFF` | `#111A2E` | Bento cards |
| `--primary` | `#2563EB` | `#60A5FA` | Links, CTA, active state, progress |
| `--muted-foreground` | `#475569` | `#94A3B8` | Secondary text (≥ 7:1) |
| `--border` | `#E2E8F0` | `#1E293B` | Hairlines |

Book covers use the same family (slate-200 → slate-800, blue-100 → blue-900, sky-700); every
cover/text pair is ≥ 4.5:1. Raw hex values only appear in `books.ts` (cover data) and the
carousel's paper page, which is intentionally always light.

## Typography

| Role | Font | Where |
|---|---|---|
| Display | **Cormorant Garamond** 400–600 | Book titles, page headings, chapter headings in notes |
| UI / body | **Inter** (variable) | Everything else, body text 16px / 1.75 line height |
| Mono | **JetBrains Mono** (variable) | Code, eyebrows/labels (uppercase, wide tracking), chapter numbers |

Fonts are self-hosted through `@fontsource` packages (no external CDN).

## Shape — Bento

- Cards: `.bento` → 24px radius (`rounded-2xl`), 1px border, very soft shadow.
- Controls: fully rounded pills (`rounded-full`), min height 40px; list rows min 44px.
- Hover: lift `-2px` + primary-tinted border, 200ms; disabled under `prefers-reduced-motion`.

## Rules

- Icons: [Lucide](https://lucide.dev) SVGs only — no emoji as icons.
- Light + dark themes; the saved choice is applied before first paint (inline script in `index.html`).
- Every interactive element is keyboard reachable with a visible focus ring (`--ring`).
  Shelf: ← → browse, Enter open, Esc close.
- Text contrast ≥ 4.5:1 in both themes.
