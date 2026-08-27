import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import type { ApiClient } from './api-client'
import { LoginPage } from '../pages/login.page'
import { NewPagePage } from '../pages/new-page.page'
import { PageEditorPage } from '../pages/page-editor.page'
import { WorkspacePage } from '../pages/workspace.page'

export async function loginViaUi(
  page: Page,
  email: string,
  password: string,
): Promise<number> {
  const login = new LoginPage(page)
  await login.goto()
  const workspace = await login.loginExpectWorkspace(email, password)
  return workspace.workspaceId()
}

/** Soft SPA mutations do not revalidate cached queries; reload to assert persistence. */
export async function waitForFormPost(
  page: Page,
  timeout = 30_000,
  actionOnly = true,
) {
  await page.waitForResponse(
    (res) => {
      if (res.request().method() !== 'POST' || res.status() >= 500) {
        return false
      }
      if (!actionOnly) {
        return true
      }
      const postData = res.request().postData() ?? ''
      return postData.includes('$ACTION') || postData.includes('action=')
    },
    { timeout },
  )
}

export async function reloadUntil(
  page: Page,
  url: string,
  ready: Locator,
  timeout = 20_000,
) {
  const deadline = Date.now() + timeout
  let lastError: unknown
  const wsMatch = url.match(/\/w\/(\d+)/)
  const escapeUrl = wsMatch ? `/w/${wsMatch[1]}` : '/'
  const bustUrl = () => `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`

  while (Date.now() < deadline) {
    await page.reload({ waitUntil: 'load' }).catch(() => undefined)
    try {
      await expect(ready).toBeVisible({ timeout: 2_500 })
      return
    } catch (err) {
      lastError = err
    }

    // Solid Router bfcache can serve stale query data for the same path;
    // navigate away first so the editor route refetches on return.
    await page.goto(escapeUrl, { waitUntil: 'load' })
    await page.goto(bustUrl(), { waitUntil: 'load' })
    try {
      await expect(ready).toBeVisible({ timeout: 2_500 })
      return
    } catch (err) {
      lastError = err
    }
  }
  await page.goto(escapeUrl, { waitUntil: 'load' })
  await page.goto(bustUrl(), { waitUntil: 'load' })
  await expect(ready).toBeVisible({ timeout: 5_000 }).catch(() => {
    throw lastError
  })
}

export async function submitAndReload(
  page: Page,
  reloadUrl: string,
  ready: Locator,
  submit: () => Promise<void>,
  afterPost?: () => Promise<void>,
) {
  await submit()
  await waitForFormPost(page).catch(() => undefined)
  if (afterPost) {
    await afterPost()
  }
  try {
    await expect(ready).toBeVisible({ timeout: 8_000 })
    return
  } catch {
    // fall through to hard navigation if single-flight did not update UI
  }
  await page.reload({ waitUntil: 'load' })
  try {
    await expect(ready).toBeVisible({ timeout: 8_000 })
    return
  } catch {
    // fall through to bfcache bust
  }
  await reloadUntil(page, reloadUrl, ready)
}

export async function expectWorkspaceShell(page: Page) {
  const workspace = new WorkspacePage(page)
  await workspace.expectHomeLoaded()
}

/** Prefer full document load of the editor (Solid soft nav can leave stale route mounted). */
export async function createPageViaUi(page: Page, wsId: number) {
  const newPage = new NewPagePage(page)
  await newPage.goto(wsId)
  const editor = await newPage.createExpectEditor(wsId)
  return editor.pageId()
}

export async function openEditor(
  page: Page,
  api: ApiClient,
  token: string,
  wsId: number,
) {
  const pageId = await api.createPage(token, wsId)
  const editor = new PageEditorPage(page)
  await reloadUntil(
    page,
    `/w/${wsId}/p/${pageId}`,
    editor.titleInput,
  )
  await editor.expectLoaded(wsId)
  return pageId
}

export async function reopenEditor(page: Page, wsId: number, pageId: number) {
  const editor = new PageEditorPage(page)
  await reloadUntil(
    page,
    `/w/${wsId}/p/${pageId}`,
    editor.titleInput,
  )
  await editor.expectLoaded(wsId)
}
