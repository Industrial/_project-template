import type { ParentProps } from 'solid-js'
import { Show, createMemo } from 'solid-js'

import type { CurrentUser } from '../../lib/auth'
import {
  getWorkspace,
  listPages,
  listWorkspaces,
  readQuery,
} from '../../lib/notes'
import { AppNavbar } from './AppNavbar'
import { AppSidebar, useSidebarCollapsed } from './AppSidebar'

export function AppShell(
  props: ParentProps & {
    workspaceId: string
    user: CurrentUser
  },
) {
  const { collapsed, mobileOpen, toggleCollapsed, toggleMobile, closeMobile } =
    useSidebarCollapsed()
  const workspaces = createMemo(() => readQuery(listWorkspaces()))
  const workspace = createMemo(() =>
    readQuery(getWorkspace(Number(props.workspaceId))),
  )
  const pages = createMemo(() => {
    const id = Number(props.workspaceId)
    return Number.isFinite(id) ? readQuery(listPages(id)) : { items: [] }
  })

  return (
    <div class="flex h-dvh flex-col bg-background">
      <AppNavbar
        user={props.user}
        workspaceId={props.workspaceId}
        workspaceName={workspace().name}
        sidebarCollapsed={mobileOpen()}
        onToggleSidebar={toggleMobile}
      />
      <div class="flex min-h-0 flex-1">
        <div class="hidden h-full lg:block">
          <AppSidebar
            workspaceId={props.workspaceId}
            workspaces={workspaces().items ?? []}
            pages={pages().items ?? []}
            collapsed={collapsed()}
            onToggle={toggleCollapsed}
          />
        </div>
        <Show when={mobileOpen()}>
          <div
            class="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
            onClick={closeMobile}
          />
          <div class="fixed inset-y-14 left-0 z-40 lg:hidden">
            <AppSidebar
              workspaceId={props.workspaceId}
              workspaces={workspaces().items ?? []}
              pages={pages().items ?? []}
              collapsed={false}
              onToggle={closeMobile}
            />
          </div>
        </Show>
        <main class="min-w-0 flex-1 overflow-y-auto px-6 py-6 md:px-8">
          <div class="mx-auto max-w-5xl">{props.children}</div>
        </main>
      </div>
    </div>
  )
}
