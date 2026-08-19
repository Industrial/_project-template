import { forgotPassword } from '../lib/auth'
import { FormError, FormSuccess, latestSubmission } from '../lib/form'

export default function ForgotPassword() {
  const submission = latestSubmission(forgotPassword)

  return (
    <main>
      <h1>Reset password</h1>
      <p>We'll email you a reset link if the account exists.</p>
      <form action={forgotPassword} method="post">
        <p>
          <label>
            Email{' '}
            <input type="email" name="email" autocomplete="email" required />
          </label>
        </p>
        <FormError submission={submission} />
        <FormSuccess
          submission={submission}
          when={(result) =>
            Boolean(
              result &&
                typeof result === 'object' &&
                'sent' in result &&
                (result as { sent?: boolean }).sent,
            )
          }
        >
          If that email exists, a reset link was sent.
        </FormSuccess>
        <p>
          <button type="submit">Send reset link</button>
        </p>
      </form>
      <p>
        <a href="/login">Back to login</a>
      </p>
    </main>
  )
}
