import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'

export class VerifyPage extends BasePage {
  readonly heading: Locator
  readonly success: Locator
  readonly failure: Locator
  readonly loginLink: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'Email verification' })
    this.success = page.getByText('Email verified.')
    this.failure = page
      .getByRole('alert')
      .filter({ hasText: 'Invalid or expired verification link.' })
    this.loginLink = page.getByRole('link', { name: 'Log in' })
  }

  async goto(token: string) {
    await this.page.goto(`/verify/${encodeURIComponent(token)}`)
  }

  async expectLoadedSuccess() {
    await this.expectUrl(/\/verify\//)
    await expect(this.heading).toBeVisible()
    await expect(this.success).toBeVisible()
    await expect(this.loginLink).toBeVisible()
    await expect(this.failure).toHaveCount(0)
  }

  async expectLoadedFailure() {
    await this.expectUrl(/\/verify\//)
    await expect(this.heading).toBeVisible()
    await expect(this.failure).toBeVisible()
    await expect(this.success).toHaveCount(0)
  }
}
