import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { For, Show, createMemo } from 'solid-js'

import { requireUser } from '../../../lib/auth'
import { readQuery, getWorkspace, listPages } from '../../../lib/notes'

export const route = {
  preload: ({ params }) => {
    void requireUser()
    const id = Number(params.workspaceId)
    if (Number.isFinite(id)) {
      void getWorkspace(id)
      void listPages(id)
    }
  },
} satisfies RouteDefinition

export default function WorkspaceHome(props: RouteProps<'/w/:workspaceId'>) {
  const wsId = () => Number(props.params.workspaceId)
  const workspace = createMemo(() => readQuery(getWorkspace(wsId())))
  const pages = createMemo(() => readQuery(listPages(wsId())))
  const recent = createMemo(() => (pages().items ?? []).slice(0, 8))

  return (
    <section>
      <h1>{workspace().name}</h1>
      <p>Pick a page from the sidebar or create a new one.</p>
      <Show
        when={recent().length > 0}
        fallback={
          <p>
            <a href={`/w/${props.params.workspaceId}/p/new`}>
              Create your first page
            </a>
          </p>
        }
      >
        <ul>
          <For each={recent()}>
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
      </Show>
    </section>
  )
}
