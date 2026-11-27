import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import BookCarousel3D from '@/components/ui/cue-3d-book-carousel-reading-mode'
import { AccountMenu } from '@/components/account-menu'
import { ApiStatus } from '@/components/api-status'
import { DataPlantBackground } from '@/components/data-plant-background'
import { ThemeToggle } from '@/components/theme-toggle'
import { BOOKS, type ShelfBook } from '@/data/books'
import { notes } from '@/data/content'

const route = getRouteApi('/')

/*
 * Vertical layout, top to bottom:  top bar · data plant · book title · shelf · progress/hint.
 * Books have fixed pixel sizes, so on short viewports (e.g. a laptop at 125–150% Windows
 * scaling ≈ 600px tall) the whole shelf is scaled down to leave room for the plant.
 */
const TOP_BAR = 84 // header height
const TITLE_BLOCK = 70 // "VOL. 0x" + book title + gap
const BOOK_SPAN = 430 // tallest book (380px) when facing us, plus breathing room — unscaled
const MIN_PLANT = 130
const MAX_PLANT = 300

function computeLayout(h: number) {
  const bottom = Math.max(60, Math.round(h * 0.08)) // shelf baseline above progress bar + hint
  // The plant grows with the viewport too, so extra height is shared instead of all going to the books.
  const plantTarget = Math.min(MAX_PLANT, Math.max(MIN_PLANT, MIN_PLANT + (h - 587) * 0.35))
  const scale = Math.min(1, Math.max(0.5, (h - TOP_BAR - 12 - plantTarget - TITLE_BLOCK - bottom) / BOOK_SPAN))
  const titleTop = h - bottom - BOOK_SPAN * scale - TITLE_BLOCK
  const plantHeight = Math.min(MAX_PLANT, Math.floor(titleTop - TOP_BAR - 12))
  return { bottom, scale, plantHeight }
}

/** Measures the page element itself (window.innerHeight can disagree with the rendered 100dvh). */
function useShelfLayout(ref: RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(() => window.innerHeight)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setHeight(el.clientHeight)
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return computeLayout(height)
}

/** Home: the 3D bookshelf. Click a book to bring it forward, click again to open it. */
export function ShelfPage() {
  const { book } = route.useSearch()
  const navigate = useNavigate()
  const initialIndex = Math.max(0, BOOKS.findIndex((b) => b.slug === book))
  const pageRef = useRef<HTMLDivElement>(null)
  const layout = useShelfLayout(pageRef)

  const openReader = (b: ShelfBook) =>
    navigate({ to: '/books/$bookSlug', params: { bookSlug: b.slug } })

  return (
    <div
      ref={pageRef}
      className="relative h-dvh w-full touch-pan-y overflow-hidden bg-background select-none"
      style={{ '--bc-scale': layout.scale, '--bc-bottom': `${layout.bottom}px` } as CSSProperties}
    >
      {/* Data water plant: sources → raw → base → stg → intermediate → dim/fact → report → users */}
      <DataPlantBackground className="absolute inset-0 z-0" top={TOP_BAR + 4} height={layout.plantHeight} />

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-medium leading-none">DE Hub</span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground sm:inline">
            Data Engineering · Knowledge Shelf
          </span>
        </div>
        <nav className="flex items-center gap-2" aria-label="Main">
          <span
            className="hidden h-10 items-center rounded-full border border-dashed px-4 text-xs font-medium text-muted-foreground md:inline-flex"
            title="Quizzes, flashcards and the SQL playground are coming in Phase 2"
          >
            Practice · soon
          </span>
          <ApiStatus className="hidden sm:inline-flex" />
          <ThemeToggle />
          <AccountMenu />
        </nav>
      </header>

      <BookCarousel3D
        books={BOOKS}
        initialIndex={initialIndex}
        renderPage={(_, i, isOpen) => (
          <OpenBookPage book={BOOKS[i]} isOpen={isOpen} onRead={() => openReader(BOOKS[i])} />
        )}
      />

      <p className="pointer-events-none absolute inset-x-0 bottom-3 z-20 text-center font-mono text-[11px] tracking-wide text-muted-foreground">
        Scroll, drag or use ← → to browse · click a book twice to open it
      </p>
    </div>
  )
}

/** The page revealed when a book swings open on the shelf. Always light, like paper. */
function OpenBookPage({ book, isOpen, onRead }: { book: ShelfBook; isOpen: boolean; onRead: () => void }) {
  const written = book.chapters.filter((c) => notes[c.slug]).length

  return (
    <div className="flex h-full flex-col text-left">
      <div className="bc-page-eyebrow">{book.eyebrow} · Contents</div>
      <h3 className="bc-page-title">{book.title}</h3>
      <div className="bc-page-rule" />
      <ol className="space-y-1.5 text-[12px] leading-snug text-slate-600">
        {book.chapters.slice(0, 5).map((c, i) => (
          <li key={c.slug} className="flex gap-2">
            <span className="font-mono text-slate-400">{String(i + 1).padStart(2, '0')}</span>
            <span className={notes[c.slug] ? 'text-slate-900' : undefined}>{c.title}</span>
          </li>
        ))}
      </ol>
      <div className="mt-auto">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
          {written}/{book.chapters.length} chapters written
        </p>
        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          onClick={(e) => {
            e.stopPropagation() // don't let the shelf treat this as "close the book"
            onRead()
          }}
          onKeyDown={(e) => e.stopPropagation()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Start reading <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
