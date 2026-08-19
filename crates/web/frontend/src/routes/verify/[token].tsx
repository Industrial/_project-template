import { Title } from '@solidjs/meta'
import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { Show, createMemo } from 'solid-js'

import { verifyEmail } from '../../lib/auth'
import { readQuery } from '../../lib/query'

export const route = {
  preload: ({ params }) => void verifyEmail(params.token ?? ''),
} satisfies RouteDefinition

export default function Verify(props: RouteProps<'/verify/:token'>) {
  const result = createMemo(() =>
    readQuery(verifyEmail(props.params.token ?? '')),
  )

  return (
    <main>
      <Title>Email verification</Title>
      <h1>Email verification</h1>
      <Show
        when={result().ok}
        fallback={<p role="alert">Invalid or expired verification link.</p>}
      >
        <output>
          Email verified. <a href="/login">Log in</a>
        </output>
      </Show>
    </main>
  )
}
