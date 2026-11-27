import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, FilePlus2 } from 'lucide-react'
import { AccountMenu } from '@/components/account-menu'
import { ApiStatus } from '@/components/api-status'
import { Markdown } from '@/components/markdown'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { findBook, type Chapter, type ShelfBook } from '@/data/books'
import { notes } from '@/data/content'
import { cn } from '@/lib/utils'

const route = getRouteApi('/books/$bookSlug')

const pad = (n: number) => String(n).padStart(2, '0')

/** Reader: chapter sidebar (table of contents) + the chapter itself. Reading only. */
export function BookPage() {
  const { bookSlug } = route.useParams()
  const { chapter: chapterSlug } = route.useSearch()
  const book = findBook(bookSlug)

  if (!book) return <BookNotFound />

  const index = Math.max(
    0,
    chapterSlug
      ? book.chapters.findIndex((c) => c.slug === chapterSlug)
      : book.chapters.findIndex((c) => notes[c.slug]), // default: first written chapter
  )
  const chapter = book.chapters[index]
  const note = notes[chapter.slug]

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link
            to="/"
            search={{ book: book.slug }}
            className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Shelf
          </Link>
          <span className="hidden truncate font-display text-xl sm:inline">
            DE Hub <span className="text-muted-foreground">/ {book.title}</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ApiStatus className="hidden sm:inline-flex" />
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:py-10">
        <ChapterSidebar book={book} activeIndex={index} />

        <main className="min-w-0 space-y-6">
          {note ? (
            <article className="bento px-6 py-8 sm:px-10 sm:py-12">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Chapter {pad(index + 1)}
                {note.level && <> · {note.level}</>}
                {note.updated && <> · updated {note.updated}</>}
              </p>
              <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                {note.title}
              </h1>
              {note.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {note.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="rounded-full font-mono text-[11px]">
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}
              <hr className="my-8" />
              <Markdown>{note.body}</Markdown>
            </article>
          ) : (
            <ComingSoon chapter={chapter} index={index} />
          )}

          <ChapterPager book={book} index={index} />
        </main>
      </div>
    </div>
  )
}

function ChapterSidebar({ book, activeIndex }: { book: ShelfBook; activeIndex: number }) {
  return (
    <aside className="h-fit lg:sticky lg:top-24">
      <div className="bento overflow-hidden">
        {/* Mini cover */}
        <div className="px-6 pb-6 pt-5" style={{ background: book.color, color: book.textColor }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-75">{book.eyebrow}</p>
          <p className="mt-8 font-display text-3xl font-medium leading-none">{book.title}</p>
          {book.subtitle && <p className="mt-2 text-xs opacity-80">{book.subtitle}</p>}
        </div>

        <nav aria-label="Chapters" className="p-3">
          <p className="px-3 pb-2 pt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Contents
          </p>
          <ol className="space-y-0.5">
            {book.chapters.map((c, i) => {
              const active = i === activeIndex
              const written = Boolean(notes[c.slug])
              return (
                <li key={c.slug}>
                  <Link
                    to="/books/$bookSlug"
                    params={{ bookSlug: book.slug }}
                    search={{ chapter: c.slug }}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-accent font-medium text-accent-foreground'
                        : 'text-foreground/80 hover:bg-secondary',
                      !written && !active && 'text-muted-foreground',
                    )}
                  >
                    <span className="w-6 shrink-0 font-mono text-xs opacity-60">{pad(i + 1)}</span>
                    <span className="flex-1">{c.title}</span>
                    {!written && (
                      <span className="rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        soon
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>
    </aside>
  )
}

function ComingSoon({ chapter, index }: { chapter: Chapter; index: number }) {
  return (
    <section className="bento flex flex-col items-start gap-4 px-6 py-12 sm:px-10">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <FilePlus2 className="size-5" aria-hidden="true" />
      </span>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Chapter {pad(index + 1)} · not written yet
      </p>
      <h1 className="font-display text-4xl font-medium tracking-tight">{chapter.title}</h1>
      <p className="max-w-prose text-muted-foreground">
        This page is still blank. Write it as Markdown and it will show up here:
      </p>
      <code className="rounded-xl bg-muted px-3 py-2 font-mono text-sm">content/{chapter.slug}.md</code>
    </section>
  )
}

function ChapterPager({ book, index }: { book: ShelfBook; index: number }) {
  const prev = book.chapters[index - 1]
  const next = book.chapters[index + 1]
  const cardClass =
    'bento group flex min-h-24 flex-col justify-center gap-1 px-6 py-5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0'

  return (
    <nav aria-label="Chapter navigation" className="grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link to="/books/$bookSlug" params={{ bookSlug: book.slug }} search={{ chapter: prev.slug }} className={cardClass}>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous
          </span>
          <span className="font-display text-xl">{prev.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link
          to="/books/$bookSlug"
          params={{ bookSlug: book.slug }}
          search={{ chapter: next.slug }}
          className={cn(cardClass, 'sm:items-end sm:text-right')}
        >
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Next <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl">{next.title}</span>
        </Link>
      )}
    </nav>
  )
}

function BookNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">404</p>
      <h1 className="font-display text-4xl">This book isn't on the shelf</h1>
      <Link to="/" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
        Back to the shelf
      </Link>
    </div>
  )
}
