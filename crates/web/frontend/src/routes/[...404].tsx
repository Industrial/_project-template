import { Title } from '@solidjs/meta'
import type { RouteDefinition } from '@solidjs/router'
import { httpStatus } from '@solidjs/web'

import { AuthPage } from '../components/layout/AuthPage'

export const route = {
  preload: () => httpStatus(404),
} satisfies RouteDefinition

export default function NotFound() {
  return (
    <AuthPage
      title="Not found"
      description="This page doesn't exist or was moved."
    >
      <Title>Not found</Title>
      <p class="mt-6 text-center text-sm text-muted-foreground">
        <a href="/" class="link-accent">
          Back to Notes
        </a>
      </p>
    </AuthPage>
  )
}
