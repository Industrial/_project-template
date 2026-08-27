import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { createMemo } from 'solid-js'

import { PageHeader } from '../../../../components/layout/PageHeader'
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
      <PageHeader
        title="Workspace settings"
        description="Manage your workspace name and members."
      />
      <form
        action={updateWorkspace.with(wsId())}
        method="post"
        class="card stack max-w-lg"
      >
        <label class="field-label">
          Name
          <input
            type="text"
            name="name"
            value={workspace().name}
            required
            class="field-input"
          />
        </label>
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
        <button type="submit" class="btn-primary">
          Save
        </button>
      </form>
      <p class="mt-6">
        <a
          href={`/w/${props.params.workspaceId}/settings/members`}
          class="link-accent"
        >
          Manage members
        </a>
      </p>
    </section>
  )
}
