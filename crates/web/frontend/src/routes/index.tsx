import type { RouteDefinition } from '@solidjs/router'
import { Show, createMemo } from 'solid-js'

import { AuthPage } from '../components/layout/AuthPage'
import { getCurrentUser } from '../lib/auth'
import { readQuery } from '../lib/query'

export const route = {
  preload: () => void getCurrentUser(),
} satisfies RouteDefinition

export default function Home() {
  const me = createMemo(() => readQuery(getCurrentUser()))

  return (
    <AuthPage
      title="Notes"
      description="Write, organize, and share without the clutter."
    >
      <p class="mt-6 text-sm">
        <Show
          when={me()}
          fallback={
            <>
              <a href="/register" class="link-accent">
                Get started
              </a>
              {' · '}
              <a href="/login" class="link-accent">
                Log in
              </a>
            </>
          }
        >
          <a href="/login" class="link-accent">
            Open app
          </a>
        </Show>
      </p>
    </AuthPage>
  )
}
