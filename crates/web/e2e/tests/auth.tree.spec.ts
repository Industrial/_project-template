import { ForgotPasswordPage } from '../pages/forgot-password.page'
import { LoginPage } from '../pages/login.page'
import { RegisterPage } from '../pages/register.page'
import { ResetPasswordPage } from '../pages/reset-password.page'
import { VerifyPage } from '../pages/verify.page'
import { resetTokenForEmail, verificationTokenForEmail } from '../support/db-tokens'
import { test, expect } from '../fixtures/test-base'

test.describe('Auth', () => {
  test.describe('Register', () => {
    test.describe('when email is new', () => {
      test('redirects to login with registered banner', async ({
        page,
        uniqueUser,
        testRun,
      }) => {
        testRun.user = uniqueUser
        const register = new RegisterPage(page)
        await register.goto()
        await register.registerExpectLogin(
          uniqueUser.name,
          uniqueUser.email,
          uniqueUser.password,
        )
      })
    })

    test.describe('when email already exists', () => {
      test.beforeEach(async ({ api, uniqueUser, testRun }) => {
        testRun.user = uniqueUser
        const status = await api.register(uniqueUser)
        expect(status).toBe(200)
      })

      test('shows email_taken error and recovery links', async ({
        page,
        uniqueUser,
      }) => {
        const register = new RegisterPage(page)
        await register.goto()
        await register.register(
          uniqueUser.name,
          uniqueUser.email,
          uniqueUser.password,
        )

        await register.expectEmailTaken()
      })
    })
  })

  test.describe('Login', () => {
    test.describe('with valid credentials', () => {
      test.beforeEach(async ({ api, uniqueUser, testRun }) => {
        testRun.user = uniqueUser
        await api.register(uniqueUser)
        testRun.token = await api.login(uniqueUser)
      })

      test('redirects to workspace shell without manual reload', async ({
        page,
        uniqueUser,
      }) => {
        const login = new LoginPage(page)
        await login.goto()
        const workspace = await login.loginExpectWorkspace(
          uniqueUser.email,
          uniqueUser.password,
        )
        await workspace.expectHomeLoaded()
        await expect(login.heading).toHaveCount(0)
      })
    })

    test.describe('with invalid password', () => {
      test.beforeEach(async ({ api, uniqueUser, testRun }) => {
        testRun.user = uniqueUser
        await api.register(uniqueUser)
        testRun.token = await api.login(uniqueUser)
      })

      test('shows friendly error', async ({ page, uniqueUser }) => {
        const login = new LoginPage(page)
        await login.goto()
        await login.login(uniqueUser.email, 'wrong-password-xyz')
        await login.expectError('Invalid email or password.')
      })
    })

    test.describe('with unknown email', () => {
      test('shows friendly error', async ({ page, uniqueUser }) => {
        const login = new LoginPage(page)
        await login.goto()
        await login.login(uniqueUser.email, uniqueUser.password)
        await login.expectError('Invalid email or password.')
      })
    })

    test.describe('after successful registration', () => {
      test('shows post-register banner via query param', async ({ page }) => {
        const login = new LoginPage(page)
        await login.goto({ registered: '1' })
        await login.expectRegisteredBanner()
      })
    })
  })

  test.describe('Forgot password', () => {
    test.describe('when account exists', () => {
      test.beforeEach(async ({ api, uniqueUser, testRun }) => {
        testRun.user = uniqueUser
        await api.register(uniqueUser)
        testRun.token = await api.login(uniqueUser)
      })

      test('shows success message', async ({ page, uniqueUser }) => {
        const forgot = new ForgotPasswordPage(page)
        await forgot.goto()
        await forgot.submitEmail(uniqueUser.email)
        await forgot.expectSuccess()
      })
    })

    test.describe('when account is unknown', () => {
      test('still shows success message', async ({ page, uniqueUser }) => {
        const forgot = new ForgotPasswordPage(page)
        await forgot.goto()
        await forgot.submitEmail(uniqueUser.email)
        await forgot.expectSuccess()
      })
    })
  })

  test.describe('Reset password', () => {
    test.describe('with valid token', () => {
      test.beforeEach(async ({ api, uniqueUser, testRun }) => {
        testRun.user = uniqueUser
        await api.register(uniqueUser)
        testRun.token = await api.login(uniqueUser)
        await fetch(`${process.env.LOCO_API_URL ?? 'http://127.0.0.1:5150'}/api/auth/forgot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: uniqueUser.email }),
        })
      })

      test('updates password and allows login', async ({ page, uniqueUser }) => {
        const token = resetTokenForEmail(uniqueUser.email)
        expect(token).toBeTruthy()

        const reset = new ResetPasswordPage(page)
        await reset.goto(token!)
        const newPassword = `${uniqueUser.password}-new`
        await reset.setPassword(newPassword)
        await reset.expectSuccess()

        const login = new LoginPage(page)
        await login.goto()
        const workspace = await login.loginExpectWorkspace(
          uniqueUser.email,
          newPassword,
        )
        await workspace.expectHomeLoaded()
      })
    })

    test.describe('without token', () => {
      test('shows alert and disables submit', async ({ page }) => {
        const reset = new ResetPasswordPage(page)
        await reset.goto()
        await reset.expectLoaded(false)
      })
    })

    test.describe('with invalid token', () => {
      test('allows submit but shows no success', async ({ page }) => {
        const reset = new ResetPasswordPage(page)
        await reset.goto('not-a-real-token')
        await reset.setPassword('brand-new-password')
        await reset.expectNoSuccess()
      })
    })
  })

  test.describe('Email verify', () => {
    test.describe('with valid token', () => {
      test.beforeEach(async ({ api, uniqueUser, testRun }) => {
        testRun.user = uniqueUser
        await api.register(uniqueUser)
      })

      test('shows verified message', async ({ page, uniqueUser }) => {
        const token = verificationTokenForEmail(uniqueUser.email)
        expect(token).toBeTruthy()
        const verify = new VerifyPage(page)
        await verify.goto(token!)
        await verify.expectLoadedSuccess()
      })
    })

    test.describe('with invalid token', () => {
      test('shows failure alert', async ({ page }) => {
        const verify = new VerifyPage(page)
        await verify.goto('invalid-token')
        await verify.expectLoadedFailure()
      })
    })
  })
})
