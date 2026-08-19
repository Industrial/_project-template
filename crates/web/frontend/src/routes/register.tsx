import { Show, createMemo } from 'solid-js'

import { register } from '../lib/auth'
import { FormError, latestSubmission, submissionCode } from '../lib/form'

export default function Register() {
  const submission = latestSubmission(register)
  const emailTaken = createMemo(
    () => submissionCode(submission()) === 'email_taken',
  )

  return (
    <main>
      <h1>Create account</h1>
      <p>Create an account to get started.</p>
      <form action={register} method="post">
        <p>
          <label>
            Name <input type="text" name="name" required />
          </label>
        </p>
        <p>
          <label>
            Email{' '}
            <input type="email" name="email" autocomplete="email" required />
          </label>
        </p>
        <p>
          <label>
            Password{' '}
            <input type="password" name="password" minlength={8} required />
          </label>
        </p>
        <FormError submission={submission} />
        <Show when={emailTaken()}>
          <p>
            <a href="/login">Log in</a> or{' '}
            <a href="/forgot-password">reset your password</a>.
          </p>
        </Show>
        <p>
          <button type="submit">Register</button>
        </p>
      </form>
      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </main>
  )
}
