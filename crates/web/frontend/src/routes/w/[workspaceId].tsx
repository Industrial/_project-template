import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { For, createMemo, type ParentProps } from 'solid-js'

import { logout, requireUser } from '../../lib/auth'
import { listPages, listWorkspaces, readQuery } from '../../lib/notes'

export const route = {
  preload: ({ params }) => {
    void requireUser()
    void listWorkspaces()
    const id = Number(params.workspaceId)
    if (Number.isFinite(id)) {
      void listPages(id)
    }
  },
} satisfies RouteDefinition

export default function WorkspaceLayout(
  props: ParentProps & RouteProps<'/w/:workspaceId'>,
) {
  const workspaces = createMemo(() => readQuery(listWorkspaces()))
  const pages = createMemo(() => {
    const id = Number(props.params.workspaceId)
    return Number.isFinite(id) ? readQuery(listPages(id)) : { items: [] }
  })
  const topLevel = createMemo(() =>
    (pages().items ?? []).filter((p) => p.parent_page_id == null),
  )

  return (
    <div>
      <aside>
        <p>
          <a href="/">Notes</a>
        </p>
        <p>
          <label>
            Workspace{' '}
            <select
              aria-label="Switch workspace"
              value={props.params.workspaceId}
              onChange={(event) => {
                window.location.href = `/w/${event.currentTarget.value}`
              }}
            >
              <For each={workspaces().items ?? []}>
                {(ws) => <option value={ws.id}>{ws.name}</option>}
              </For>
            </select>
          </label>
        </p>
        <section>
          <h2>Pages</h2>
          <ul>
            <For each={topLevel()} fallback={<li>No pages yet</li>}>
              {(page) => (
                <li>
                  <a href={`/w/${props.params.workspaceId}/p/${page.id}`}>
                    {page.icon ? `${page.icon} ` : ''}
                    {page.title || 'Untitled'}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </section>
        <p>
          <a href={`/w/${props.params.workspaceId}/p/new`}>New page</a>
        </p>
        <p>
          <a href={`/w/${props.params.workspaceId}/settings`}>Settings</a>
        </p>
        <form action={logout} method="post">
          <button type="submit">Log out</button>
        </form>
      </aside>
      <main>{props.children}</main>
    </div>
  )
}
