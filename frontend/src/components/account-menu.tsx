import { Link, useNavigate } from '@tanstack/react-router'
import { LayoutDashboard, Library, LogIn, LogOut, UserRound } from 'lucide-react'
import { ROLE_LABEL, useAuth } from '@/auth/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const pill =
  'inline-flex h-10 items-center gap-2 rounded-full border bg-card/80 px-3 text-sm font-medium backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

/** "Sign in" for guests; avatar + menu for signed-in users. Each role only sees its own area. */
export function AccountMenu({ className }: { className?: string }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <Link to="/login" className={cn(pill, 'px-4', className)}>
        <LogIn className="size-4" aria-hidden="true" />
        Sign in
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn(pill, 'pl-1.5', className)} aria-label={`Account menu — ${user.name}`}>
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden sm:inline">{user.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span className="truncate">{user.name}</span>
          <span className="rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {ROLE_LABEL[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === 'user' ? (
          <>
            <DropdownMenuItem asChild>
              <Link to="/">
                <Library aria-hidden="true" /> Shelf
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/me">
                <UserRound aria-hidden="true" /> My space
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <LayoutDashboard aria-hidden="true" /> Admin overview
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            signOut()
            navigate({ to: '/login' })
          }}
        >
          <LogOut aria-hidden="true" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
