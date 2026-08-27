import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { createMemo, type ParentProps } from 'solid-js'

import { AppShell } from '../../components/layout/AppShell'
import { requireUser } from '../../lib/auth'
import { getWorkspace, listPages, listWorkspaces } from '../../lib/notes'
import { readQuery } from '../../lib/query'

export const route = {
  preload: ({ params }) => {
    void requireUser()
    void listWorkspaces()
    const id = Number(params.workspaceId)
    if (Number.isFinite(id)) {
      void getWorkspace(id)
      void listPages(id)
    }
  },
} satisfies RouteDefinition

export default function WorkspaceLayout(
  props: ParentProps & RouteProps<'/w/:workspaceId'>,
) {
  const user = createMemo(() => readQuery(requireUser()))

  return (
    <AppShell workspaceId={props.params.workspaceId} user={user()}>
      {props.children}
    </AppShell>
  )
}
