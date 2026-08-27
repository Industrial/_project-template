import type { ParentProps } from 'solid-js'

export function AuthPage(
  props: ParentProps & {
    title: string
    description?: string
  },
) {
  return (
    <main class="flex min-h-dvh items-center justify-center px-4 py-12">
      <div class="auth-card">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          {props.title}
        </h1>
        {props.description ? (
          <p class="mt-2 text-sm text-muted-foreground">{props.description}</p>
        ) : null}
        {props.children}
      </div>
    </main>
  )
}
