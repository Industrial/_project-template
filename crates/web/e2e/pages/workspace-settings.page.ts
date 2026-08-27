import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'
import { WorkspacePage } from './workspace.page'

export class WorkspaceSettingsPage extends BasePage {
  readonly heading: Locator
  readonly description: Locator
  readonly nameInput: Locator
  readonly saveButton: Locator
  readonly manageMembersLink: Locator
  readonly savedMessage: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'Workspace settings' })
    this.description = page.getByText(
      'Manage your workspace name and members.',
    )
    this.nameInput = page.getByLabel('Name')
    this.saveButton = page.getByRole('button', { name: 'Save' })
    this.manageMembersLink = page.getByRole('link', { name: 'Manage members' })
    this.savedMessage = page.getByText('Saved.')
  }

  async goto(workspaceId: number) {
    await this.page.goto(`/w/${workspaceId}/settings`)
    await this.expectLoaded(workspaceId)
  }

  async expectLoaded(workspaceId: number) {
    await this.expectUrl(new RegExp(`/w/${workspaceId}/settings$`))
    await new WorkspacePage(this.page).expectShellLoaded()
    await expect(this.heading).toBeVisible()
    await expect(this.description).toBeVisible()
    await expect(this.nameInput).toBeVisible()
    await expect(this.saveButton).toBeVisible()
    await expect(this.manageMembersLink).toBeVisible()
  }

  async rename(name: string) {
    await this.nameInput.fill(name)
    await this.saveButton.click()
  }

  async expectSaved() {
    await expect(this.savedMessage).toBeVisible()
  }
}
