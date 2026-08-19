import type { RouteDefinition, RouteProps } from '@solidjs/router'

import { requireUser } from '../../../../lib/auth'
import { createPage } from '../../../../lib/notes'
import { FormError, latestSubmission } from '../../../../lib/form'

export const route = {
  preload: () => void requireUser(),
} satisfies RouteDefinition

export default function NewPage(props: RouteProps<'/w/:workspaceId/p/new'>) {
  const submission = latestSubmission(createPage)

  return (
    <section>
      <p>Creating page</p>
      <form action={createPage} method="post">
        <input
          type="hidden"
          name="workspace_id"
          value={props.params.workspaceId}
        />
        <FormError submission={submission} />
        <p>
          <button type="submit">Create page</button>
        </p>
      </form>
    </section>
  )
}
