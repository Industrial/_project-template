import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { For, createMemo } from 'solid-js'

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
      <h1>Members</h1>
      <p>
        <a href={`/w/${props.params.workspaceId}/settings`}>Back to settings</a>
      </p>
      <ul>
        <For each={members()} fallback={<li>No members yet</li>}>
          {(m) => (
            <li>
              User #{m.user_id} — {m.role}
            </li>
          )}
        </For>
      </ul>
      <form action={inviteMember} method="post">
        <input
          type="hidden"
          name="workspace_id"
          value={props.params.workspaceId}
        />
        <p>
          <label>
            User ID <input type="number" name="user_id" required />
          </label>
        </p>
        <p>
          <label>
            Role{' '}
            <select name="role" value="viewer">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
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
          Member invited.
        </FormSuccess>
        <p>
          <button type="submit">Invite member</button>
        </p>
      </form>
    </section>
  )
}
