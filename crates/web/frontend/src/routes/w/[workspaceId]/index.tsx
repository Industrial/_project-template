import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { For, Show, createMemo } from 'solid-js'

import { PageHeader } from '../../../components/layout/PageHeader'
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
      <PageHeader
        title={workspace().name}
        description="Pick a page from the sidebar or create a new one."
      />
      <Show
        when={recent().length > 0}
        fallback={
          <div class="card text-center">
            <p class="text-sm text-muted-foreground">No pages yet.</p>
            <a
              href={`/w/${props.params.workspaceId}/p/new`}
              class="btn-primary mt-4 inline-flex"
              onClick={(event) => {
                event.preventDefault()
                window.location.assign(`/w/${props.params.workspaceId}/p/new`)
              }}
            >
              Create your first page
            </a>
          </div>
        }
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <For each={recent()}>
            {(page) => (
              <a
                href={`/w/${props.params.workspaceId}/p/${page.id}`}
                class="page-link-card"
              >
                <p class="font-medium text-foreground">
                  {page.icon ? `${page.icon} ` : ''}
                  {page.title || 'Untitled'}
                </p>
              </a>
            )}
          </For>
        </div>
      </Show>
    </section>
  )
}
