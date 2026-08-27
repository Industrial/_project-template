import { useSearchParams } from '@solidjs/router'
import { Show, createMemo } from 'solid-js'

import { AuthPage } from '../components/layout/AuthPage'
import { login } from '../lib/auth'
import { FormError, latestSubmission } from '../lib/form'

export default function Login() {
  const [params] = useSearchParams()
  const submission = latestSubmission(login)
  const registered = createMemo(() => params.registered === '1')

  return (
    <AuthPage title="Welcome back" description="Sign in to your workspace">
      <Show when={registered()}>
        <output class="alert-success mt-4">
          Account created. Check your email for a verification link, then log in
          below.
        </output>
      </Show>
      <form action={login} method="post" class="mt-6 space-y-4">
        <label class="block text-sm font-medium text-foreground">
          Email
          <input
            type="email"
            name="email"
            autocomplete="email"
            required
            class="auth-input"
          />
        </label>
        <label class="block text-sm font-medium text-foreground">
          Password
          <input
            type="password"
            name="password"
            autocomplete="current-password"
            required
            class="auth-input"
          />
        </label>
        <FormError submission={submission} />
        <button type="submit" class="auth-button">
          Log in
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-muted-foreground">
        <a href="/forgot-password" class="link-accent">
          Forgot password?
        </a>
        {' · '}
        <a href="/register" class="link-accent">
          Create account
        </a>
      </p>
    </AuthPage>
  )
}
