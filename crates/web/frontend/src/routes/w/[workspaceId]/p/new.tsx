import type { RouteDefinition, RouteProps } from '@solidjs/router'

import { PageHeader } from '../../../../components/layout/PageHeader'
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
      <PageHeader
        title="New page"
        description="Create a blank page in this workspace."
      />
      <div class="card max-w-md">
        <p class="text-sm text-muted-foreground">Ready when you are.</p>
        <form action={createPage} method="post" class="mt-4 stack">
          <input
            type="hidden"
            name="workspace_id"
            value={props.params.workspaceId}
          />
          <FormError submission={submission} />
          <button type="submit" class="btn-primary">
            Create page
          </button>
        </form>
      </div>
    </section>
  )
}
