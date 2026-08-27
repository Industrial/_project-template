import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'

export class ResetPasswordPage extends BasePage {
  readonly heading: Locator
  readonly password: Locator
  readonly submit: Locator
  readonly missingAlert: Locator
  readonly successMessage: Locator
  readonly backToLoginLink: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'New password' })
    this.password = page.getByLabel('New password')
    this.submit = page.getByRole('button', { name: 'Set password' })
    this.missingAlert = page
      .getByRole('alert')
      .filter({ hasText: 'Missing or invalid reset link. Request a new one.' })
    this.successMessage = page.getByText('Password updated. You can log in now.')
    this.backToLoginLink = page.getByRole('link', { name: 'Back to login' })
  }

  async goto(token?: string) {
    const qs = token ? `?token=${encodeURIComponent(token)}` : ''
    await this.page.goto(`/reset-password${qs}`)
    await this.expectLoaded(Boolean(token))
  }

  async expectLoaded(hasToken = true) {
    await this.expectUrl(/\/reset-password/)
    await expect(this.heading).toBeVisible()
    await expect(this.password).toBeVisible()
    await expect(this.submit).toBeVisible()
    await expect(this.backToLoginLink).toBeVisible()
    if (hasToken) {
      await expect(this.missingAlert).toHaveCount(0)
      await expect(this.submit).toBeEnabled()
    } else {
      await expect(this.missingAlert).toBeVisible()
      await expect(this.submit).toBeDisabled()
    }
  }

  async setPassword(password: string) {
    await this.password.fill(password)
    await this.submit.click()
  }

  async expectSuccess() {
    await expect(this.successMessage).toBeVisible()
  }

  async expectNoSuccess() {
    await expect(this.successMessage).toHaveCount(0)
  }
}
