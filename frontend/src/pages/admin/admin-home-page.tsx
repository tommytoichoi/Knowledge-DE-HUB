import { LayoutDashboard } from 'lucide-react'
import { EmptyState, PageHeader } from '@/components/empty-state'

/** Admin home — content to be defined. */
export function AdminHomePage() {
  return (
    <>
      <PageHeader eyebrow="Admin" title="Overview" />
      <EmptyState
        icon={LayoutDashboard}
        title="Nothing to manage yet"
        description="This is the admin area: monitoring, managing content (books and chapters) and managing people. The tools will appear here once they are defined."
        hint="Add admin pages: src/router.tsx (adminRoute) + src/config/navigation.ts (ADMIN_NAV)"
      />
    </>
  )
}
