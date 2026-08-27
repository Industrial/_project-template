import { Title } from '@solidjs/meta'
import type { RouteDefinition, RouteProps } from '@solidjs/router'
import { Show, createMemo } from 'solid-js'

import { AuthPage } from '../../components/layout/AuthPage'
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
    <AuthPage title="Email verification">
      <Title>Email verification</Title>
      <Show
        when={result().ok}
        fallback={
          <p role="alert" class="alert mt-4">
            Invalid or expired verification link.
          </p>
        }
      >
        <output class="alert-success mt-4">
          Email verified.{' '}
          <a href="/login" class="link-accent">
            Log in
          </a>
        </output>
      </Show>
    </AuthPage>
  )
}
