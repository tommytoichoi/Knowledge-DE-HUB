import { Link } from '@tanstack/react-router'
import { ArrowRight, Sprout } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { EmptyState, PageHeader } from '@/components/empty-state'

/** User home — content to be defined. */
export function UserHomePage() {
  const { user } = useAuth()

  return (
    <>
      <PageHeader eyebrow="My space" title={`Welcome, ${user?.name ?? 'reader'}`} />
      <EmptyState
        icon={Sprout}
        title="Your space is empty for now"
        description="This is your personal area. Things like reading progress, saved chapters and practice history will live here once they are defined."
        hint="Add user pages: src/router.tsx (userRoute) + src/config/navigation.ts (USER_NAV)"
      >
        <Link
          to="/"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Browse the shelf <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </EmptyState>
    </>
  )
}
