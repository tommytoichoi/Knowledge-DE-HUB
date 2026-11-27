# Design system

> Chosen 2026-11-25. Tokens live in [`frontend/src/index.css`](../frontend/src/index.css).

## Concept: a knowledge shelf

- **Home = a 3D bookshelf.** Each Data Engineering topic is a *book*; each note is a *chapter*.
  Built on the Cue "3D Book Carousel Reading Mode" component
  ([`cue-3d-book-carousel-reading-mode.tsx`](../frontend/src/components/ui/cue-3d-book-carousel-reading-mode.tsx)).
- **Reading is just reading.** Opening a book leads to the reader: chapter sidebar (table of
  contents) + the chapter. No quizzes or widgets inside the text.
- **Practice is a separate feature** (quizzes, flashcards, SQL playground — Phase 2) with its own pages.

## Background — the data water plant

Behind the shelf, the layers of a dbt project are drawn as a water-treatment plant
([`data-plant-background.tsx`](../frontend/src/components/data-plant-background.tsx)):

| dbt layer | Object | Water |
|---|---|---|
| sources | postgres cylinder · kafka log segments · s3 bucket · api cube | muddy |
| raw | intake reservoir (with sediment) | muddy |
| base | glass tank | clearing |
| stg | filter beds (sand + gravel) with a ✓ "tested" badge | almost clear |
| intermediate | mixing tank with a motor and a spinning vortex | clear |
| dim / fact | tall silo with a ladder / capsule tank on legs | clear |
| report → users | dashboard screen with live bars → tap pouring into a glass | clear |

- 2.5D SVG, no dependencies. CSS animations (pipe current, water bob, mixer, bars) + SMIL
  droplets/bubbles following the pipe paths. The water gets clearer at every stage
  (`--w-raw` → `--w`, mixed from a mud colour and `--primary`).
- Lives in a band between the top bar and the book title — never overlaps the title.
  Hidden below 640px wide; below 200px tall it goes compact (stage names only, larger).

## Shelf layout (responsive height)

Top to bottom: top bar · data plant · book title · shelf · progress + hint.
[`shelf-page.tsx`](../frontend/src/pages/shelf-page.tsx) measures the page height and computes:

- `--bc-scale` (0.5–1): the whole 3D shelf (books, title offset) scales down on short viewports.
- `--bc-bottom`: shelf baseline, above the progress bar and hint.
- plant height (130–300px): grows with the viewport, so extra height is shared with the books.

Why: laptops at 125–150% Windows scaling give a ~600px-tall CSS viewport at 100% zoom;
fixed-size books (300–380px) would otherwise leave no room for the plant or title.
Checked at 1268×587, 1366×650, 1536×730, 1904×878 and 1920×1080.
- Decorative only: `aria-hidden`, `pointer-events: none`, all motion frozen under
  `prefers-reduced-motion`. Light pointer parallax. Shelf page only.

## Color — Espresso Library + Blue

| Token | Light (old paper) | Dark (espresso) | Use |
|---|---|---|---|
| `--background` | `#F5F0E6` | `#15110E` | Page |
| `--foreground` | `#2B2420` | `#EDE6DA` | Text (ink brown / cream) |
| `--card` | `#FBF8F2` | `#1E1915` | Bento cards |
| `--primary` | `#1D4ED8` | `#60A5FA` | Links, CTA, active state, water |
| `--muted-foreground` | `#6B5D50` | `#A8998A` | Secondary text (≥ 5.6:1) |
| `--border` | `#E2D8C7` | `#2E2620` | Hairlines |

Light mode uses blue-700 instead of blue-600 because blue-600 is only 4.3:1 on the paper background.

Book covers stay in the slate/blue family (cool covers on a warm shelf) (slate-200 → slate-800, blue-100 → blue-900, sky-700); every
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
