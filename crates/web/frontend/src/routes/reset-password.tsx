import { useSearchParams } from '@solidjs/router'
import { Show } from 'solid-js'
import { resetPassword } from '../lib/auth'
import { FormError, FormSuccess, latestSubmission } from '../lib/form'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const submission = latestSubmission(resetPassword)
  const hasToken = () => Boolean(params.token)

  return (
    <main>
      <h1>New password</h1>
      <Show when={!hasToken()}>
        <p role="alert">Missing or invalid reset link. Request a new one.</p>
      </Show>
      <form action={resetPassword} method="post">
        <input type="hidden" name="token" value={params.token ?? ''} />
        <p>
          <label>
            New password{' '}
            <input type="password" name="password" minlength={8} required />
          </label>
        </p>
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
        <p>
          <button type="submit" disabled={!hasToken()}>
            Set password
          </button>
        </p>
      </form>
      <p>
        <a href="/login">Back to login</a>
      </p>
    </main>
  )
}
