import { redirect } from '@solidjs/web'
import { env } from 'virtual:env/server'

import { getSession } from './session'

export class LocoError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.name = 'LocoError'
    this.status = status
    this.body = body
  }
}

function messageFrom(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null) {
    if (
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
    ) {
      return (body as { message: string }).message
    }
    if (
      'description' in body &&
      typeof (body as { description: unknown }).description === 'string'
    ) {
      return (body as { description: string }).description
    }
    if (
      'error' in body &&
      typeof (body as { error: unknown }).error === 'string'
    ) {
      return (body as { error: string }).error
    }
    if (
      'errors' in body &&
      Array.isArray((body as { errors: unknown }).errors)
    ) {
      const parts = (body as { errors: unknown[] }).errors
        .map((item) => {
          if (typeof item === 'string') {
            return item
          }
          if (
            typeof item === 'object' &&
            item !== null &&
            'message' in item &&
            typeof (item as { message: unknown }).message === 'string'
          ) {
            return (item as { message: string }).message
          }
          return null
        })
        .filter((part): part is string => Boolean(part))
      if (parts.length > 0) {
        return parts.join('; ')
      }
    }
  }
  return fallback
}

export async function locoFetch(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean; token?: string } = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body !== undefined && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }
  const auth = opts.auth !== false
  if (auth) {
    const token = opts.token ?? (await getSession())?.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
  }
  const base = env.LOCO_API_URL.replace(/\/$/, '')
  return fetch(`${base}${path}`, { ...init, headers })
}

export async function locoJson<T>(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean; allow401?: boolean; token?: string } = {},
): Promise<T> {
  const res = await locoFetch(path, init, opts)
  if (res.status === 204) {
    return undefined as T
  }
  const text = await res.text()
  const body = text ? (JSON.parse(text) as unknown) : null
  if (res.ok) {
    return body as T
  }
  if (res.status === 401 && !opts.allow401 && opts.auth !== false) {
    throw redirect('/login')
  }
  throw new LocoError(
    res.status,
    body,
    messageFrom(body, `Loco request failed (${res.status})`),
  )
}
