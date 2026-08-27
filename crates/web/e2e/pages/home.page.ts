import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'

export class HomePage extends BasePage {
  readonly heading: Locator
  readonly description: Locator
  readonly getStartedLink: Locator
  readonly loginLink: Locator
  readonly openAppLink: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'Notes' })
    this.description = page.getByText(
      'Write, organize, and share without the clutter.',
    )
    this.getStartedLink = page.getByRole('link', { name: 'Get started' })
    this.loginLink = page.getByRole('link', { name: 'Log in' })
    this.openAppLink = page.getByRole('link', { name: 'Open app' })
  }

  async goto() {
    await this.page.goto('/')
    await this.expectLoaded()
  }

  async expectLoaded() {
    await this.expectUrl('/')
    await expect(this.heading).toBeVisible()
    await expect(this.description).toBeVisible()
  }

  async expectGuestView() {
    await this.expectLoaded()
    await expect(this.getStartedLink).toBeVisible()
    await expect(this.loginLink).toBeVisible()
    await expect(this.openAppLink).toHaveCount(0)
  }

  async expectAuthenticatedView() {
    await this.expectLoaded()
    await expect(this.openAppLink).toBeVisible()
    await expect(this.getStartedLink).toHaveCount(0)
    await expect(this.loginLink).toHaveCount(0)
  }
}
