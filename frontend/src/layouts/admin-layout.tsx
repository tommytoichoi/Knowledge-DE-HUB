import { Link, Outlet } from '@tanstack/react-router'
import { AccountMenu } from '@/components/account-menu'
import { ApiStatus } from '@/components/api-status'
import { ThemeToggle } from '@/components/theme-toggle'
import { ADMIN_NAV } from '@/config/navigation'
import { cn } from '@/lib/utils'

const navLink =
  'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-foreground/80 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring'
const navLinkActive = 'bg-accent font-medium text-accent-foreground hover:bg-accent'

function AdminBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'rounded-full border border-primary/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary',
        className,
      )}
    >
      Admin
    </span>
  )
}

/** Admin area shell: sidebar (desktop) / compact top nav (mobile) + content. */
export function AdminLayout() {
  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r bg-card/60 p-4 md:flex">
        <Link to="/admin" className="flex items-center gap-2 px-2 pt-2">
          <span className="font-display text-2xl font-medium leading-none">DE Hub</span>
          <AdminBadge />
        </Link>

        <nav aria-label="Admin">
          <p className="px-3 pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Manage</p>
          <ul className="space-y-0.5">
            {ADMIN_NAV.map(({ label, to, icon: Icon, exact }) => (
              <li key={label}>
                <Link
                  to={to}
                  activeOptions={{ exact }}
                  className={navLink}
                  activeProps={{ className: navLinkActive, 'aria-current': 'page' }}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-8">
          <Link to="/admin" className="flex items-center gap-2 md:hidden">
            <span className="font-display text-xl font-medium">DE Hub</span>
            <AdminBadge />
          </Link>
          <nav aria-label="Admin (compact)" className="flex gap-1 md:hidden">
            {ADMIN_NAV.map(({ label, to, icon: Icon, exact }) => (
              <Link
                key={label}
                to={to}
                activeOptions={{ exact }}
                aria-label={label}
                className="inline-flex size-10 items-center justify-center rounded-full hover:bg-secondary"
                activeProps={{ className: navLinkActive }}
              >
                <Icon className="size-4" aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ApiStatus className="hidden sm:inline-flex" />
            <ThemeToggle />
            <AccountMenu />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
