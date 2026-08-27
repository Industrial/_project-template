import type { CurrentUser } from '../../lib/auth'
import { logout } from '../../lib/auth'
import { cn } from '../../lib/cn'
import {
  IconChevronDown,
  IconLogOut,
  IconSettings,
  userInitials,
} from '../ui/icons'

export function ProfileMenu(props: {
  user: CurrentUser
  settingsHref: string
}) {
  const initials = () => userInitials(props.user.name, props.user.email)

  return (
    <details class="relative">
      <summary
        aria-label="Account menu"
        class={cn(
          'inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2',
          'text-sm font-medium transition-colors hover:bg-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
          '[&::-webkit-details-marker]:hidden',
        )}
      >
        <span
          aria-hidden="true"
          class="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-accent"
        >
          {initials()}
        </span>
        <span class="hidden max-w-[10rem] truncate sm:inline">
          {props.user.name}
        </span>
        <IconChevronDown class="size-4 text-muted-foreground" />
      </summary>
      <div
        data-testid="account-menu-panel"
        role="menu"
        class={cn(
          'absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[14rem] overflow-hidden rounded-lg border border-border bg-card p-1 shadow-md',
        )}
      >
        <div class="border-b border-border px-3 py-2.5">
          <p class="truncate text-sm font-medium text-foreground">
            {props.user.name}
          </p>
          <p class="truncate text-xs text-muted-foreground">
            {props.user.email}
          </p>
        </div>
        <a
          role="menuitem"
          href={props.settingsHref}
          class="dropdown-item flex items-center"
        >
          <IconSettings class="mr-2 size-4" />
          Settings
        </a>
        <form action={logout} method="post" class="w-full">
          <button
            type="submit"
            role="menuitem"
            data-testid="logout-button"
            class="dropdown-item flex w-full items-center px-2 py-1.5 text-left text-sm"
          >
            <IconLogOut class="mr-2 size-4" />
            Log out
          </button>
        </form>
      </div>
    </details>
  )
}
