import { useSubmissions, type Action, type Submission } from '@solidjs/router'
import { Show } from 'solid-js'

export type ActionErrorResult = { error: string; code?: string }

export function latestSubmission<T extends Array<unknown>, U, V>(
  action: Action<T, U, V>,
): () => Submission<V, U> | undefined {
  const list = useSubmissions(action)
  return () => list.at(-1) as Submission<V, U> | undefined
}

export function submissionError(
  sub: Submission<unknown, unknown> | undefined,
): string | undefined {
  if (!sub) {
    return undefined
  }
  if (sub.error != null) {
    const err = sub.error
    if (err instanceof Error) {
      return err.message
    }
    return String(err)
  }
  const result = sub.result
  if (
    result &&
    typeof result === 'object' &&
    'error' in result &&
    typeof (result as ActionErrorResult).error === 'string'
  ) {
    return (result as ActionErrorResult).error
  }
  return undefined
}

export function submissionCode(
  sub: Submission<unknown, unknown> | undefined,
): string | undefined {
  if (!sub || sub.error != null) {
    return undefined
  }
  const result = sub.result
  if (
    result &&
    typeof result === 'object' &&
    'code' in result &&
    typeof (result as ActionErrorResult).code === 'string'
  ) {
    return (result as ActionErrorResult).code
  }
  return undefined
}

export function FormError(props: {
  submission: () => Submission<unknown, unknown> | undefined
}) {
  return (
    <Show when={submissionError(props.submission())}>
      {(message) => (
        <p role="alert" class="alert">
          {message()}
        </p>
      )}
    </Show>
  )
}

export function FormSuccess(props: {
  submission: () => Submission<unknown, unknown> | undefined
  when: (result: unknown) => boolean
  children: string
}) {
  return (
    <Show
      when={(() => {
        const sub = props.submission()
        if (!sub || sub.error != null) {
          return false
        }
        return props.when(sub.result)
      })()}
    >
      <output class="alert-success">{props.children}</output>
    </Show>
  )
}
