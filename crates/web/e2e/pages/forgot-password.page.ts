import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'

export class ForgotPasswordPage extends BasePage {
  readonly heading: Locator
  readonly description: Locator
  readonly email: Locator
  readonly submit: Locator
  readonly backToLoginLink: Locator
  readonly successMessage: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'Reset password' })
    this.description = page.getByText(
      "We'll email you a reset link if the account exists.",
    )
    this.email = page.getByLabel('Email')
    this.submit = page.getByRole('button', { name: 'Send reset link' })
    this.backToLoginLink = page.getByRole('link', { name: 'Back to login' })
    this.successMessage = page.getByText(
      'If that email exists, a reset link was sent.',
    )
  }

  async goto() {
    await this.page.goto('/forgot-password')
    await this.expectLoaded()
  }

  async expectLoaded() {
    await this.expectUrl(/\/forgot-password/)
    await expect(this.heading).toBeVisible()
    await expect(this.description).toBeVisible()
    await expect(this.email).toBeVisible()
    await expect(this.submit).toBeVisible()
    await expect(this.backToLoginLink).toBeVisible()
  }

  async submitEmail(email: string) {
    await this.email.fill(email)
    await this.submit.click()
  }

  async expectSuccess() {
    await expect(this.successMessage).toBeVisible()
  }
}
