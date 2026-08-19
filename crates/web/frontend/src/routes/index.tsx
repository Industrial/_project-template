import type { RouteDefinition } from '@solidjs/router'
import { Show, createMemo } from 'solid-js'

import { getCurrentUser } from '../lib/auth'
import { readQuery } from '../lib/query'

export const route = {
  preload: () => void getCurrentUser(),
} satisfies RouteDefinition

export default function Home() {
  const me = createMemo(() => readQuery(getCurrentUser()))

  return (
    <main>
      <h1>Notes</h1>
      <p>Write, organize, and share without the clutter.</p>
      <p>
        <Show
          when={me()}
          fallback={
            <>
              <a href="/register">Get started</a>
              {' · '}
              <a href="/login">Log in</a>
            </>
          }
        >
          <a href="/login">Open app</a>
        </Show>
      </p>
    </main>
  )
}
