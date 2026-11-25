import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import BookCarousel3D from '@/components/ui/cue-3d-book-carousel-reading-mode'
import { ApiStatus } from '@/components/api-status'
import { ThemeToggle } from '@/components/theme-toggle'
import { BOOKS, type ShelfBook } from '@/data/books'
import { notes } from '@/data/content'

const route = getRouteApi('/')

/** Home: the 3D bookshelf. Click a book to bring it forward, click again to open it. */
export function ShelfPage() {
  const { book } = route.useSearch()
  const navigate = useNavigate()
  const initialIndex = Math.max(0, BOOKS.findIndex((b) => b.slug === book))

  const openReader = (b: ShelfBook) =>
    navigate({ to: '/books/$bookSlug', params: { bookSlug: b.slug } })

  return (
    <div className="relative h-dvh w-full touch-pan-y overflow-hidden bg-background select-none">
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
