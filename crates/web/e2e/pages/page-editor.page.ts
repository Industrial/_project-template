import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'
import { WorkspacePage } from './workspace.page'

export class PageEditorPage extends BasePage {
  readonly titleInput: Locator
  readonly saveTitle: Locator
  readonly addBlock: Locator
  readonly addFirstBlock: Locator
  readonly shareButton: Locator
  readonly commentsButton: Locator
  readonly emptyStateCopy: Locator
  readonly commentsPanel: Locator
  readonly sharePanel: Locator

  constructor(page: Page) {
    super(page)
    this.titleInput = page.getByLabel('Page title')
    this.saveTitle = page.getByRole('button', { name: 'Save title' })
    this.addBlock = page.getByRole('button', { name: 'Add block' })
    this.addFirstBlock = page.getByRole('button', { name: 'Add your first block' })
    this.shareButton = page.getByRole('button', { name: 'Share' })
    this.commentsButton = page.getByRole('button', { name: 'Comments' })
    this.emptyStateCopy = page.getByText('This page has no blocks yet.')
    this.commentsPanel = page.getByTestId('comments-panel')
    this.sharePanel = page.getByTestId('share-panel')
  }

  pageId(): number {
    return Number(this.page.url().match(/\/p\/(\d+)/)?.[1])
  }

  async goto(workspaceId: number, pageId: number) {
    await this.page.goto(`/w/${workspaceId}/p/${pageId}`)
    await this.expectLoaded(workspaceId)
  }

  async expectLoaded(workspaceId: number) {
    await this.expectUrl(new RegExp(`/w/${workspaceId}/p/\\d+`))
    await new WorkspacePage(this.page).expectShellLoaded()
    await expect(this.titleInput).toBeVisible()
    await expect(this.saveTitle).toBeVisible()
    await expect(this.shareButton).toBeVisible()
    await expect(this.commentsButton).toBeVisible()
    await expect(this.addBlock).toBeVisible()
  }

  async expectEmptyBlocks() {
    await expect(this.addFirstBlock).toBeVisible()
    await expect(this.emptyStateCopy).toBeVisible()
    await expect(this.blockTextarea(0)).toHaveCount(0)
  }

  async expectCommentsPanelLoaded() {
    await expect(this.commentsPanel).toBeVisible()
    await expect(this.commentBody()).toBeVisible()
  }

  async expectSharePanelLoaded() {
    await expect(this.sharePanel).toBeVisible()
    await expect(this.shareUserId()).toBeVisible()
  }

  /** Panels open via ?comments=1 / ?share=1 so SSR renders without hydration. */
  async openComments() {
    const url = new URL(this.page.url())
    url.searchParams.set('comments', '1')
    await this.page.goto(`${url.pathname}?${url.searchParams.toString()}`, {
      waitUntil: 'load',
    })
    await this.expectCommentsPanelLoaded()
  }

  async openShare() {
    const url = new URL(this.page.url())
    url.searchParams.set('share', '1')
    await this.page.goto(`${url.pathname}?${url.searchParams.toString()}`, {
      waitUntil: 'load',
    })
    await this.expectSharePanelLoaded()
  }

  blockTextarea(index = 0): Locator {
    return this.page.getByTestId(/block-text-/).nth(index)
  }

  blockSave(index = 0): Locator {
    return this.page.getByRole('button', { name: 'Save' }).nth(index)
  }

  commentBody(): Locator {
    return this.page.getByLabel('Add comment')
  }

  postComment(): Locator {
    return this.page.getByRole('button', { name: 'Post' })
  }

  shareUserId(): Locator {
    return this.page.getByLabel('User ID')
  }

  addShare(): Locator {
    return this.page.getByRole('button', { name: 'Add', exact: true })
  }

  commentDelete(body: string): Locator {
    return this.page
      .locator('section.panel')
      .filter({ hasText: 'Comments' })
      .getByText(body)
      .locator('..')
      .getByRole('button', { name: 'Delete' })
  }

  shareRemove(userId: number): Locator {
    return this.page
      .locator('section.panel')
      .filter({ hasText: 'Share page' })
      .getByText(`User #${userId}`)
      .locator('..')
      .getByRole('button', { name: 'Remove' })
  }

  blockDelete(index = 0): Locator {
    return this.page.getByRole('button', { name: 'Delete' }).nth(index)
  }
}
