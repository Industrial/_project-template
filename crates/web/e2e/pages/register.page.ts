import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { BasePage } from './base.page'
import { LoginPage } from './login.page'

export class RegisterPage extends BasePage {
  readonly heading: Locator
  readonly description: Locator
  readonly name: Locator
  readonly email: Locator
  readonly password: Locator
  readonly submit: Locator
  readonly loginLink: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { name: 'Create account' })
    this.description = page.getByText('Create an account to get started.')
    this.name = page.getByLabel('Name')
    this.email = page.getByLabel('Email')
    this.password = page.getByLabel('Password')
    this.submit = page.getByRole('button', { name: 'Register' })
    this.loginLink = page
      .getByRole('paragraph')
      .filter({ hasText: 'Already have an account?' })
      .getByRole('link', { name: 'Log in' })
  }

  async goto() {
    await this.page.goto('/register')
    await this.expectLoaded()
  }

  async expectLoaded() {
    await this.expectUrl(/\/register/)
    await expect(this.heading).toBeVisible()
    await expect(this.description).toBeVisible()
    await expect(this.name).toBeVisible()
    await expect(this.email).toBeVisible()
    await expect(this.password).toBeVisible()
    await expect(this.submit).toBeVisible()
    await expect(this.loginLink).toBeVisible()
  }

  async register(name: string, email: string, password: string) {
    await this.name.fill(name)
    await this.email.fill(email)
    await this.password.fill(password)
    await this.submit.click()
  }

  async expectEmailTaken() {
    await this.expectLoaded()
    await expect(this.page.getByRole('alert')).toContainText('already exists')
    await expect(
      this.page.getByRole('link', { name: 'reset your password' }),
    ).toBeVisible()
    await expect(
      this.page
        .locator('p')
        .filter({
          has: this.page.getByRole('link', { name: 'reset your password' }),
        })
        .getByRole('link', { name: 'Log in' }),
    ).toBeVisible()
  }

  async registerExpectLogin(
    name: string,
    email: string,
    password: string,
  ): Promise<LoginPage> {
    await this.register(name, email, password)
    await this.page.waitForURL(/\/login\?registered=1/, { timeout: 30_000 })
    await this.page.reload({ waitUntil: 'load' })
    const login = new LoginPage(this.page)
    await login.expectLoaded()
    await login.expectRegisteredBanner()
    return login
  }
}
