import type { CurrentUser } from '../../lib/auth'
import { IconPanelLeft } from '../ui/icons'
import { ProfileMenu } from './ProfileMenu'

export function AppNavbar(props: {
  user: CurrentUser
  workspaceId: string
  workspaceName: string
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}) {
  return (
    <header class="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        aria-label={props.sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
        onClick={() => props.onToggleSidebar()}
      >
        <IconPanelLeft />
      </button>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-foreground">
          {props.workspaceName}
        </p>
        <p class="truncate text-xs text-muted-foreground">Notes workspace</p>
      </div>

      <ProfileMenu
        user={props.user}
        settingsHref={`/w/${props.workspaceId}/settings`}
      />
    </header>
  )
}
