import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'
import { PageEditorPage } from './page-editor.page'
import { WorkspacePage } from './workspace.page'

export class NewPagePage extends BasePage {
  readonly heading: Locator
  readonly description: Locator
  readonly readyCopy: Locator
  readonly createButton: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'New page' })
    this.description = page.getByText(
      'Create a blank page in this workspace.',
    )
    this.readyCopy = page.getByText('Ready when you are.')
    this.createButton = page.getByRole('button', { name: 'Create page' })
  }

  async goto(workspaceId: number) {
    await this.page.goto(`/w/${workspaceId}/p/new`)
    await this.expectLoaded(workspaceId)
  }

  async expectLoaded(workspaceId: number) {
    await this.expectUrl(new RegExp(`/w/${workspaceId}/p/new$`))
    await new WorkspacePage(this.page).expectShellLoaded()
    await expect(this.heading).toBeVisible()
    await expect(this.description).toBeVisible()
    await expect(this.readyCopy).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  async createExpectEditor(workspaceId: number): Promise<PageEditorPage> {
    await this.createButton.click()
    await this.page.waitForURL(
      new RegExp(`/w/${workspaceId}/p/\\d+`),
      { timeout: 30_000 },
    )
    await this.page.reload({ waitUntil: 'load' })
    const editor = new PageEditorPage(this.page)
    await editor.expectLoaded(workspaceId)
    return editor
  }
}
