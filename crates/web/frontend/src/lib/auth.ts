import { action, query } from '@solidjs/router'
import { redirect } from '@solidjs/web'

import { LocoError, locoJson } from '../server/loco'
import { clearSession, getSession, setSession } from '../server/session'
import { listWorkspaces } from './notes'

function loginErrorMessage(err: LocoError): string {
  if (err.status === 401) {
    return 'Invalid email or password.'
  }
  return err.message
}

function registerErrorMessage(err: LocoError): {
  error: string
  code?: string
} {
  if (err.status === 409) {
    return { error: err.message, code: 'email_taken' }
  }
  return { error: err.message }
}

function appUrl(path: string): string {
  const base = (process.env.FRONTEND_URL ?? 'http://127.0.0.1:3000').replace(
    /\/$/,
    '',
  )
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export type CurrentUser = {
  pid: string
  name: string
  email: string
}

export const getCurrentUser = query(async () => {
  'use server'
  const token = (await getSession())?.accessToken
  if (!token) {
    return null
  }
  try {
    return await locoJson<CurrentUser>('/api/auth/current')
  } catch (err) {
    if (err instanceof LocoError && err.status === 401) {
      return null
    }
    throw err
  }
}, 'current-user')

export const requireUser = query(async () => {
  'use server'
  const user = await getCurrentUser()
  if (!user) {
    throw redirect('/login')
  }
  return user
}, 'require-user')

async function firstWorkspacePath(token: string): Promise<string> {
  const list = await locoJson<{ items: { id: number }[] }>(
    '/api/workspaces?per_page=100',
    {},
    { token },
  )
  if (list.items.length > 0) {
    return `/w/${list.items[0].id}`
  }
  const created = await locoJson<{ id: number }>(
    '/api/workspaces',
    {
      method: 'POST',
      body: JSON.stringify({ name: 'Personal' }),
    },
    { token },
  )
  return `/w/${created.id}`
}

export const login = action(async (formData: FormData) => {
  'use server'
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  let token: string
  try {
    const res = await locoJson<{ token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      { auth: false, allow401: true },
    )
    token = res.token
    await setSession({ accessToken: token })
  } catch (err) {
    if (err instanceof LocoError) {
      return { error: loginErrorMessage(err) }
    }
    throw err
  }
  return redirect(appUrl(await firstWorkspacePath(token)), {
    revalidate: [getCurrentUser.key, requireUser.key, listWorkspaces.key],
  })
})

export const logout = action(async () => {
  'use server'
  await clearSession()
  return redirect(appUrl('/login'), {
    revalidate: [getCurrentUser.key, requireUser.key, listWorkspaces.key],
  })
})

export const register = action(async (formData: FormData) => {
  'use server'
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  try {
    await locoJson(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      },
      { auth: false },
    )
  } catch (err) {
    if (err instanceof LocoError) {
      return registerErrorMessage(err)
    }
    throw err
  }
  return redirect(appUrl('/login?registered=1'))
})

export const forgotPassword = action(async (formData: FormData) => {
  'use server'
  const email = String(formData.get('email') ?? '')
  try {
    await locoJson(
      '/api/auth/forgot',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      { auth: false },
    )
    return { sent: true as const }
  } catch (err) {
    if (err instanceof LocoError) {
      return { error: err.message }
    }
    throw err
  }
})

export const resetPassword = action(async (formData: FormData) => {
  'use server'
  const token = String(formData.get('token') ?? '')
  const password = String(formData.get('password') ?? '')
  if (!token) {
    return { error: 'Missing reset token' }
  }
  try {
    await locoJson(
      '/api/auth/reset',
      {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      },
      { auth: false },
    )
    return { ok: true as const }
  } catch (err) {
    if (err instanceof LocoError) {
      return { error: err.message }
    }
    throw err
  }
})

export const verifyEmail = query(async (token: string) => {
  'use server'
  try {
    await locoJson(
      `/api/auth/verify/${encodeURIComponent(token)}`,
      {},
      { auth: false, allow401: true },
    )
    return { ok: true as const }
  } catch {
    return { ok: false as const }
  }
}, 'verify-email')
