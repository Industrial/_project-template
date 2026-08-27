import { Show, createMemo } from 'solid-js'

import { AuthPage } from '../components/layout/AuthPage'
import { register } from '../lib/auth'
import { FormError, latestSubmission, submissionCode } from '../lib/form'

export default function Register() {
  const submission = latestSubmission(register)
  const emailTaken = createMemo(
    () => submissionCode(submission()) === 'email_taken',
  )

  return (
    <AuthPage
      title="Create account"
      description="Create an account to get started."
    >
      <form action={register} method="post" class="mt-6 space-y-4">
        <label class="block text-sm font-medium text-foreground">
          Name
          <input type="text" name="name" required class="auth-input" />
        </label>
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
            minlength={8}
            required
            class="auth-input"
          />
        </label>
        <FormError submission={submission} />
        <Show when={emailTaken()}>
          <p class="text-sm text-muted-foreground">
            <a href="/login" class="link-accent">
              Log in
            </a>{' '}
            or{' '}
            <a href="/forgot-password" class="link-accent">
              reset your password
            </a>
            .
          </p>
        </Show>
        <button type="submit" class="auth-button">
          Register
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a href="/login" class="link-accent">
          Log in
        </a>
      </p>
    </AuthPage>
  )
}
