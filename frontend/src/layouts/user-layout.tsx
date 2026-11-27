import { Link, Outlet } from '@tanstack/react-router'
import { Library } from 'lucide-react'
import { AccountMenu } from '@/components/account-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { USER_NAV } from '@/config/navigation'

/** User area shell: top bar with the area's nav + content. */
export function UserLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="font-display text-2xl font-medium leading-none">
            DE Hub
          </Link>
          <nav aria-label="My space" className="ml-2 flex items-center gap-1 sm:ml-4">
            {USER_NAV.map(({ label, to, icon: Icon, exact }) => (
              <Link
                key={label}
                to={to}
                activeOptions={{ exact }}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm text-foreground/80 transition-colors hover:bg-secondary"
                activeProps={{ className: 'bg-accent font-medium text-accent-foreground', 'aria-current': 'page' }}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Library className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Shelf</span>
            </Link>
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
