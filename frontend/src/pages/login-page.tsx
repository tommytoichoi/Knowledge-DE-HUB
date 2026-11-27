import { useEffect } from 'react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { ArrowRight, BookOpen, ShieldCheck, type LucideIcon } from 'lucide-react'
import { ROLE_HOME, useAuth, type Role } from '@/auth/auth-context'
import { ThemeToggle } from '@/components/theme-toggle'

const route = getRouteApi('/login')

/** Only allow same-site paths as a post-login redirect (no "//evil.com"). */
const safeRedirect = (target?: string) => (target && target.startsWith('/') && !target.startsWith('//') ? target : undefined)

/** Demo sign-in: pick a role. Replaced by a real form when the Go API has auth. */
export function LoginPage() {
  const { redirect } = route.useSearch()
  const { user, signIn } = useAuth()
  const router = useRouter()

  // Navigate once the session exists, so route guards already see the new user.
  useEffect(() => {
    if (user) router.history.push(safeRedirect(redirect) ?? ROLE_HOME[user.role])
  }, [user, redirect, router])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <span className="font-display text-3xl font-medium leading-none">DE Hub</span>
        <ThemeToggle />
      </header>

      <main className="grid flex-1 place-items-center px-4 pb-16">
        <div className="w-full max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Sign in</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">How do you enter the hub?</h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to read the shelf. Demo sign-in for now — pick a role; real accounts arrive with the Go API.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <RoleCard
              role="user"
              icon={BookOpen}
              title="Learner"
              description="Read the books on the shelf and keep your own learning space."
              onPick={signIn}
            />
            <RoleCard
              role="admin"
              icon={ShieldCheck}
              title="Admin"
              description="Run the hub: monitoring, content and people. No reading area."
              onPick={signIn}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function RoleCard({
  role,
  icon: Icon,
  title,
  description,
  onPick,
}: {
  role: Role
  icon: LucideIcon
  title: string
  description: string
  onPick: (role: Role) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(role)}
      className="bento group flex flex-col items-start gap-3 p-6 text-left transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="font-display text-2xl font-medium">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        Continue <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </button>
  )
}
