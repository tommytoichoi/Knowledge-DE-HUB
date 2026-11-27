import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

function StatusLayout({ code, title, children }: { code: string; title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{code}</p>
      <h1 className="font-display text-4xl font-medium">{title}</h1>
      <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}

const primaryBtn = 'rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90'

export function NotFoundPage() {
  return (
    <StatusLayout code="404" title="This page doesn't exist">
      <Link to="/" className={primaryBtn}>
        Go home
      </Link>
    </StatusLayout>
  )
}
