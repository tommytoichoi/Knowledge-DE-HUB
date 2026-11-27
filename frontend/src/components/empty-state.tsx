import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Placeholder for areas whose content is not defined yet. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  hint,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  hint?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <section className={cn('bento flex flex-col items-start gap-4 px-6 py-12 sm:px-10', className)}>
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="font-display text-3xl font-medium tracking-tight">{title}</h2>
      <p className="max-w-prose text-muted-foreground">{description}</p>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
      {hint && <p className="font-mono text-xs text-muted-foreground/80">{hint}</p>}
    </section>
  )
}

/** Eyebrow + title at the top of an area page. */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
      </div>
      {children}
    </header>
  )
}
