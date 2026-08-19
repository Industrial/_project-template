import { Title } from '@solidjs/meta'
import type { RouteDefinition } from '@solidjs/router'
import { httpStatus } from '@solidjs/web'

export const route = {
  preload: () => httpStatus(404),
} satisfies RouteDefinition

export default function NotFound() {
  return (
    <main>
      <Title>Not found</Title>
      <h1>Not found</h1>
      <p>
        <a href="/">Back to Notes</a>
      </p>
    </main>
  )
}
