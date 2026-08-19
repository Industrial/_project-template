import { useSearchParams } from '@solidjs/router'
import { Show, createMemo } from 'solid-js'

import { login } from '../lib/auth'
import { FormError, latestSubmission } from '../lib/form'

export default function Login() {
  const [params] = useSearchParams()
  const submission = latestSubmission(login)
  const registered = createMemo(() => params.registered === '1')

  return (
    <main>
      <h1>Welcome back</h1>
      <p>Sign in to your workspace</p>
      <Show when={registered()}>
        <output>
          Account created. Check your email for a verification link, then log in
          below.
        </output>
      </Show>
      <form action={login} method="post">
        <p>
          <label>
            Email{' '}
            <input type="email" name="email" autocomplete="email" required />
          </label>
        </p>
        <p>
          <label>
            Password{' '}
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              required
            />
          </label>
        </p>
        <FormError submission={submission} />
        <p>
          <button type="submit">Log in</button>
        </p>
      </form>
      <p>
        <a href="/forgot-password">Forgot password?</a>
        {' · '}
        <a href="/register">Create account</a>
      </p>
    </main>
  )
}
