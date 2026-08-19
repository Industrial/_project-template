import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { createMemo } from 'solid-js'

import { requireUser } from '../../../../lib/auth'
import { FormError, FormSuccess, latestSubmission } from '../../../../lib/form'
import { getWorkspace, readQuery, updateWorkspace } from '../../../../lib/notes'

export const route = {
  preload: ({ params }) => {
    void requireUser()
    void getWorkspace(Number(params.workspaceId))
  },
} satisfies RouteDefinition

export default function WorkspaceSettings(
  props: RouteProps<'/w/:workspaceId/settings'>,
) {
  const wsId = () => Number(props.params.workspaceId)
  const workspace = createMemo(() => readQuery(getWorkspace(wsId())))
  const submission = latestSubmission(updateWorkspace)

  return (
    <section>
      <h1>Workspace settings</h1>
      <form action={updateWorkspace.with(wsId())} method="post">
        <p>
          <label>
            Name{' '}
            <input type="text" name="name" value={workspace().name} required />
          </label>
        </p>
        <FormError submission={submission} />
        <FormSuccess
          submission={submission}
          when={(result) =>
            Boolean(
              result &&
                typeof result === 'object' &&
                'ok' in result &&
                (result as { ok?: boolean }).ok,
            )
          }
        >
          Saved.
        </FormSuccess>
        <p>
          <button type="submit">Save</button>
        </p>
      </form>
      <p>
        <a href={`/w/${props.params.workspaceId}/settings/members`}>
          Manage members
        </a>
      </p>
    </section>
  )
}
