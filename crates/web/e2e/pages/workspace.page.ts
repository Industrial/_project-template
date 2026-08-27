import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { waitForFormPost } from '../support/ui-helpers'
import { BasePage } from './base.page'
import { LoginPage } from './login.page'
import { NewPagePage } from './new-page.page'
import { WorkspaceMembersPage } from './workspace-members.page'
import { WorkspaceSettingsPage } from './workspace-settings.page'

export class WorkspacePage extends BasePage {
  readonly accountMenu: Locator
  readonly workspaceSelect: Locator
  readonly homeLink: Locator
  readonly settingsLink: Locator
  readonly membersLink: Locator
  readonly newPageLink: Locator
  readonly homeDescription: Locator

  constructor(page: Page) {
    super(page)
    this.accountMenu = page.locator('summary[aria-label="Account menu"]')
    this.workspaceSelect = page.getByLabel('Switch workspace')
    const nav = this.sidebar()
    this.homeLink = nav.getByRole('link', { name: 'Home', exact: true })
    this.settingsLink = nav.getByRole('link', { name: 'Settings', exact: true })
    this.membersLink = nav.getByRole('link', { name: 'Members', exact: true })
    this.newPageLink = nav.getByRole('link', { name: 'New page', exact: true })
    this.homeDescription = page.getByText('Pick a page from the sidebar', {
      exact: false,
    })
  }

  workspaceId(): number {
    return Number(this.page.url().match(/\/w\/(\d+)/)?.[1])
  }

  async expectShellLoaded() {
    await this.expectUrl(/\/w\/\d+/)
    await expect(this.accountMenu).toBeVisible()
    await expect(this.sidebar()).toBeVisible()
    await expect(this.workspaceSelect).toBeVisible()
    await expect(this.homeLink).toBeVisible()
    await expect(this.settingsLink).toBeVisible()
    await expect(this.membersLink).toBeVisible()
    await expect(this.newPageLink).toBeVisible()
  }

  async expectHomeLoaded(workspaceName?: string) {
    await this.expectShellLoaded()
    await expect(this.homeDescription).toBeVisible()
    if (workspaceName) {
      await expect(
        this.page.getByRole('heading', { level: 1, name: workspaceName }),
      ).toBeVisible()
    }
  }

  async goto(workspaceId: number) {
    await this.page.goto(`/w/${workspaceId}`)
    await this.expectHomeLoaded()
  }

  async openAccountMenu() {
    await this.accountMenu.click()
    await this.page.getByTestId('account-menu-panel').waitFor({
      state: 'visible',
    })
  }

  async logoutExpectLogin(): Promise<LoginPage> {
    await this.openAccountMenu()
    await this.page.getByTestId('logout-button').click()
    await waitForFormPost(this.page, 30_000, false)
    await this.page.goto('/login', { waitUntil: 'load' })
    const login = new LoginPage(this.page)
    await login.expectLoaded()
    return login
  }

  async logoutViaMenu() {
    await this.logoutExpectLogin()
  }

  async followSidebarLink(label: string, urlPattern: RegExp) {
    await this.sidebar().getByRole('link', { name: label, exact: true }).click()
    await this.page.waitForURL(urlPattern, { timeout: 30_000 })
    await this.page.reload({ waitUntil: 'load' })
  }

  async openSettings(workspaceId: number): Promise<WorkspaceSettingsPage> {
    await this.followSidebarLink(
      'Settings',
      new RegExp(`/w/${workspaceId}/settings$`),
    )
    const settings = new WorkspaceSettingsPage(this.page)
    await settings.expectLoaded(workspaceId)
    return settings
  }

  async openMembers(workspaceId: number): Promise<WorkspaceMembersPage> {
    await this.followSidebarLink(
      'Members',
      new RegExp(`/w/${workspaceId}/settings/members$`),
    )
    const members = new WorkspaceMembersPage(this.page)
    await members.expectLoaded(workspaceId)
    return members
  }

  async openHome(workspaceId: number) {
    await this.followSidebarLink('Home', new RegExp(`/w/${workspaceId}$`))
    await this.expectHomeLoaded()
  }

  async openNewPage(workspaceId: number): Promise<NewPagePage> {
    await this.followSidebarLink(
      'New page',
      new RegExp(`/w/${workspaceId}/p/new$`),
    )
    const newPage = new NewPagePage(this.page)
    await newPage.expectLoaded(workspaceId)
    return newPage
  }

  async switchWorkspace(workspaceId: number) {
    await this.workspaceSelect.selectOption(String(workspaceId))
    await this.expectUrl(new RegExp(`/w/${workspaceId}`))
  }

  pageLink(title: string) {
    return this.page.getByRole('link', { name: title })
  }
}
