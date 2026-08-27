import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { For, createMemo } from 'solid-js'

import { PageHeader } from '../../../../components/layout/PageHeader'
import { requireUser } from '../../../../lib/auth'
import { FormError, FormSuccess, latestSubmission } from '../../../../lib/form'
import { inviteMember, listMembers, readQuery } from '../../../../lib/notes'

export const route = {
  preload: ({ params }) => {
    void requireUser()
    void listMembers(Number(params.workspaceId))
  },
} satisfies RouteDefinition

export default function MembersSettings(
  props: RouteProps<'/w/:workspaceId/settings/members'>,
) {
  const wsId = () => Number(props.params.workspaceId)
  const members = createMemo(() => readQuery(listMembers(wsId())).items ?? [])
  const submission = latestSubmission(inviteMember)

  return (
    <section>
      <PageHeader
        title="Members"
        description="Invite collaborators and manage workspace access."
      />
      <p class="mb-6">
        <a href={`/w/${props.params.workspaceId}/settings`} class="link-accent">
          Back to settings
        </a>
      </p>

      <div class="card mb-6">
        <h2 class="mb-3 text-sm font-semibold text-foreground">
          Current members
        </h2>
        <ul class="divide-y divide-border">
          <For
            each={members()}
            fallback={
              <li class="py-2 text-sm text-muted-foreground">No members yet</li>
            }
          >
            {(m) => (
              <li class="flex items-center justify-between py-2 text-sm">
                <span class="text-foreground">User #{m.user_id}</span>
                <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {m.role}
                </span>
              </li>
            )}
          </For>
        </ul>
      </div>

      <form action={inviteMember} method="post" class="card stack max-w-lg">
        <h2 class="text-sm font-semibold text-foreground">Invite member</h2>
        <input
          type="hidden"
          name="workspace_id"
          value={props.params.workspaceId}
        />
        <label class="field-label">
          User ID
          <input type="number" name="user_id" required class="field-input" />
        </label>
        <label class="field-label">
          Role
          <select name="role" value="viewer" class="field-input">
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
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
          Member invited.
        </FormSuccess>
        <button type="submit" class="btn-primary">
          Invite member
        </button>
      </form>
    </section>
  )
}
