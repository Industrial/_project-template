import { useLocation } from '@solidjs/router'
import {
  For,
  Show,
  createEffect,
  createSignal,
  type ParentProps,
} from 'solid-js'

import type { PageDto } from '../../bindings/PageDto'
import type { WorkspaceDto } from '../../bindings/WorkspaceDto'
import { cn } from '../../lib/cn'
import {
  IconFile,
  IconHome,
  IconPanelLeft,
  IconPlus,
  IconSettings,
  IconUsers,
} from '../ui/icons'

const SIDEBAR_KEY = 'notes.sidebar.collapsed'

function ShellLink(props: {
  href: string
  collapsed: boolean
  label: string
  icon: () => ParentProps['children']
}) {
  const location = useLocation()
  const active = () => {
    const path = location.pathname
    if (props.href.endsWith('/settings/members')) {
      return path === props.href
    }
    if (props.href.endsWith('/settings')) {
      return path === props.href
    }
    return path === props.href
  }

  return (
    <a
      href={props.href}
      aria-current={active() ? 'page' : undefined}
      title={props.collapsed ? props.label : undefined}
      class={cn('shell-nav-link', props.collapsed && 'justify-center px-2')}
    >
      {props.icon()}
      <Show when={!props.collapsed}>
        <span class="truncate">{props.label}</span>
      </Show>
    </a>
  )
}

export function AppSidebar(props: {
  workspaceId: string
  workspaces: WorkspaceDto[]
  pages: PageDto[]
  collapsed: boolean
  onToggle: () => void
}) {
  const topLevel = () =>
    props.pages.filter((page) => page.parent_page_id == null)

  return (
    <aside
      aria-label="Workspace navigation"
      class={cn(
        'flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200',
        props.collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div class={cn('border-b border-border p-3', props.collapsed && 'px-2')}>
        <Show
          when={!props.collapsed}
          fallback={
            <a
              href="/"
              class="flex size-10 items-center justify-center rounded-md text-sm font-semibold text-accent"
              title="Notes"
            >
              N
            </a>
          }
        >
          <a
            href="/"
            class="mb-3 block text-sm font-semibold tracking-tight text-foreground"
          >
            Notes
          </a>
          <label class="block text-xs font-medium text-muted-foreground">
            Workspace
            <select
              aria-label="Switch workspace"
              class="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
              value={props.workspaceId}
              onChange={(event) => {
                window.location.href = `/w/${event.currentTarget.value}`
              }}
            >
              <For each={props.workspaces}>
                {(ws) => <option value={ws.id}>{ws.name}</option>}
              </For>
            </select>
          </label>
        </Show>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto p-2">
        <ShellLink
          href={`/w/${props.workspaceId}`}
          collapsed={props.collapsed}
          label="Home"
          icon={() => <IconHome />}
        />

        <Show when={!props.collapsed}>
          <p class="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pages
          </p>
        </Show>

        <For
          each={topLevel()}
          fallback={
            <Show when={!props.collapsed}>
              <p class="px-3 py-2 text-sm text-muted-foreground">
                No pages yet
              </p>
            </Show>
          }
        >
          {(page) => (
            <ShellLink
              href={`/w/${props.workspaceId}/p/${page.id}`}
              collapsed={props.collapsed}
              label={page.title || 'Untitled'}
              icon={() => <IconFile />}
            />
          )}
        </For>

        <ShellLink
          href={`/w/${props.workspaceId}/p/new`}
          collapsed={props.collapsed}
          label="New page"
          icon={() => <IconPlus />}
        />

        <div class="my-2 border-t border-border" />

        <ShellLink
          href={`/w/${props.workspaceId}/settings`}
          collapsed={props.collapsed}
          label="Settings"
          icon={() => <IconSettings />}
        />
        <ShellLink
          href={`/w/${props.workspaceId}/settings/members`}
          collapsed={props.collapsed}
          label="Members"
          icon={() => <IconUsers />}
        />
      </nav>

      <div class="border-t border-border p-2">
        <button
          type="button"
          aria-label={props.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={props.collapsed ? 'false' : 'true'}
          class={cn(
            'shell-nav-link w-full',
            props.collapsed && 'justify-center px-2',
          )}
          onClick={() => props.onToggle()}
        >
          <IconPanelLeft class={cn(props.collapsed && 'rotate-180')} />
          <Show when={!props.collapsed}>
            <span>Collapse</span>
          </Show>
        </button>
      </div>
    </aside>
  )
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = createSignal(false)
  const [mobileOpen, setMobileOpen] = createSignal(false)

  createEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === '1')
    } catch {
      /* private browsing */
    }
  })

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const toggleMobile = () => setMobileOpen((value) => !value)
  const closeMobile = () => setMobileOpen(false)

  return { collapsed, mobileOpen, toggleCollapsed, toggleMobile, closeMobile }
}
