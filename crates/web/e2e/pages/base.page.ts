import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/** Shared navigation + URL assertions for all page objects. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async expectUrl(pattern: RegExp | string) {
    await expect(this.page).toHaveURL(pattern)
  }

  protected sidebar() {
    return this.page.getByRole('complementary', { name: 'Workspace navigation' })
  }
}
