import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'
import { WorkspacePage } from './workspace.page'

export class WorkspaceMembersPage extends BasePage {
  readonly heading: Locator
  readonly description: Locator
  readonly backToSettingsLink: Locator
  readonly currentMembersHeading: Locator
  readonly inviteHeading: Locator
  readonly userIdInput: Locator
  readonly roleSelect: Locator
  readonly inviteButton: Locator
  readonly invitedMessage: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'Members' })
    this.description = page.getByText(
      'Invite collaborators and manage workspace access.',
    )
    this.backToSettingsLink = page.getByRole('link', { name: 'Back to settings' })
    this.currentMembersHeading = page.getByRole('heading', {
      name: 'Current members',
      level: 2,
    })
    this.inviteHeading = page.getByRole('heading', {
      name: 'Invite member',
      level: 2,
    })
    this.userIdInput = page.getByLabel('User ID')
    this.roleSelect = page.getByLabel('Role')
    this.inviteButton = page.getByRole('button', { name: 'Invite member' })
    this.invitedMessage = page.getByText('Member invited.')
  }

  async goto(workspaceId: number) {
    await this.page.goto(`/w/${workspaceId}/settings/members`)
    await this.expectLoaded(workspaceId)
  }

  async expectLoaded(workspaceId: number) {
    await this.expectUrl(
      new RegExp(`/w/${workspaceId}/settings/members$`),
    )
    await new WorkspacePage(this.page).expectShellLoaded()
    await expect(this.heading).toBeVisible()
    await expect(this.description).toBeVisible()
    await expect(this.backToSettingsLink).toBeVisible()
    await expect(this.currentMembersHeading).toBeVisible()
    await expect(this.inviteHeading).toBeVisible()
    await expect(this.userIdInput).toBeVisible()
    await expect(this.roleSelect).toBeVisible()
    await expect(this.inviteButton).toBeVisible()
  }

  async invite(userId: number) {
    await this.userIdInput.fill(String(userId))
    await this.inviteButton.click()
  }

  async expectInvited() {
    await expect(this.invitedMessage).toBeVisible()
  }
}
