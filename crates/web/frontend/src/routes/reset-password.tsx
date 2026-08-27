import { useSearchParams } from '@solidjs/router'
import { Show } from 'solid-js'

import { AuthPage } from '../components/layout/AuthPage'
import { resetPassword } from '../lib/auth'
import { FormError, FormSuccess, latestSubmission } from '../lib/form'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const submission = latestSubmission(resetPassword)
  const hasToken = () => Boolean(params.token)

  return (
    <AuthPage title="New password">
      <Show when={!hasToken()}>
        <p role="alert" class="alert mt-4">
          Missing or invalid reset link. Request a new one.
        </p>
      </Show>
      <form action={resetPassword} method="post" class="mt-6 space-y-4">
        <input type="hidden" name="token" value={params.token ?? ''} />
        <label class="block text-sm font-medium text-foreground">
          New password
          <input
            type="password"
            name="password"
            minlength={8}
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
                'ok' in result &&
                (result as { ok?: boolean }).ok,
            )
          }
        >
          Password updated. You can log in now.
        </FormSuccess>
        <button type="submit" class="auth-button" disabled={!hasToken()}>
          Set password
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
