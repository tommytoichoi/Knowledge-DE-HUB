import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Status = 'checking' | 'online' | 'degraded' | 'offline'

const LABEL: Record<Status, string> = {
  checking: 'Checking…',
  online: 'Online',
  degraded: 'DB down',
  offline: 'API offline',
}

const DOT: Record<Status, string> = {
  checking: 'bg-slate-400',
  online: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  offline: 'bg-red-500',
}

/** Small pill showing whether the Go API and Postgres are reachable (GET /api/v1/health). */
export function ApiStatus({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/health')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((h: { database: string }) => !cancelled && setStatus(h.database === 'up' ? 'online' : 'degraded'))
      .catch(() => !cancelled && setStatus('offline'))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <span
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full border bg-card/80 px-4 text-xs font-medium text-muted-foreground backdrop-blur',
        className,
      )}
      title="Backend status (Go API + PostgreSQL)"
    >
      <span className={cn('size-2 rounded-full', DOT[status])} aria-hidden="true" />
      {LABEL[status]}
    </span>
  )
}
