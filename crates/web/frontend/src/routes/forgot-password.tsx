import { AuthPage } from '../components/layout/AuthPage'
import { forgotPassword } from '../lib/auth'
import { FormError, FormSuccess, latestSubmission } from '../lib/form'

export default function ForgotPassword() {
  const submission = latestSubmission(forgotPassword)

  return (
    <AuthPage
      title="Reset password"
      description="We'll email you a reset link if the account exists."
    >
      <form action={forgotPassword} method="post" class="mt-6 space-y-4">
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
        <button type="submit" class="auth-button">
          Send reset link
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-muted-foreground">
        <a href="/login" class="link-accent">
          Back to login
        </a>
      </p>
    </AuthPage>
  )
}
