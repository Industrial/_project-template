import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'
import { WorkspacePage } from './workspace.page'

export class LoginPage extends BasePage {
  readonly heading: Locator
  readonly description: Locator
  readonly email: Locator
  readonly password: Locator
  readonly submit: Locator
  readonly forgotPasswordLink: Locator
  readonly createAccountLink: Locator
  readonly registeredBanner: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'Welcome back' })
    this.description = page.getByText('Sign in to your workspace')
    this.email = page.getByLabel('Email')
    this.password = page.getByLabel('Password')
    this.submit = page.getByRole('button', { name: 'Log in' })
    this.forgotPasswordLink = page.getByRole('link', {
      name: 'Forgot password?',
    })
    this.createAccountLink = page.getByRole('link', { name: 'Create account' })
    this.registeredBanner = page.getByText(
      'Account created. Check your email for a verification link',
    )
  }

  async goto(query?: Record<string, string>) {
    const qs = query ? `?${new URLSearchParams(query).toString()}` : ''
    await this.page.goto(`/login${qs}`)
    await this.expectLoaded()
  }

  async expectLoaded() {
    await this.expectUrl(/\/login/)
    await expect(this.heading).toBeVisible()
    await expect(this.description).toBeVisible()
    await expect(this.email).toBeVisible()
    await expect(this.password).toBeVisible()
    await expect(this.submit).toBeVisible()
    await expect(this.forgotPasswordLink).toBeVisible()
    await expect(this.createAccountLink).toBeVisible()
  }

  async expectRegisteredBanner() {
    await expect(this.registeredBanner).toBeVisible()
  }

  async expectError(message: string) {
    await this.expectUrl(/\/login/)
    await expect(this.page.getByRole('alert')).toHaveText(message)
  }

  async login(email: string, password: string) {
    await this.email.fill(email)
    await this.password.fill(password)
    await this.submit.click()
  }

  async loginExpectWorkspace(
    email: string,
    password: string,
  ): Promise<WorkspacePage> {
    await this.login(email, password)
    await this.page.waitForURL(/\/w\/\d+/, { timeout: 30_000 })
    const workspace = new WorkspacePage(this.page)
    await workspace.expectShellLoaded()
    return workspace
  }

  async expectRedirectFrom(path: string) {
    await this.page.goto(path)
    await this.expectUrl(/\/login/)
    await this.expectLoaded()
  }
}
