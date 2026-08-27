import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'

export class NotFoundPage extends BasePage {
  readonly heading: Locator
  readonly description: Locator
  readonly backToNotesLink: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'Not found' })
    this.description = page.getByText(
      "This page doesn't exist or was moved.",
    )
    this.backToNotesLink = page.getByRole('link', { name: 'Back to Notes' })
  }

  async goto(path = '/does-not-exist') {
    await this.page.goto(path)
    await this.expectLoaded()
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible()
    await expect(this.description).toBeVisible()
    await expect(this.backToNotesLink).toBeVisible()
  }
}
