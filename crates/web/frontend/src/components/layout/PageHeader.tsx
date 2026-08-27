import type { ParentProps } from 'solid-js'

export function PageHeader(
  props: ParentProps & {
    title: string
    description?: string
  },
) {
  return (
    <header class="page-header">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="page-title">{props.title}</h1>
          {props.description ? (
            <p class="page-description">{props.description}</p>
          ) : null}
        </div>
      </div>
    </header>
  )
}
