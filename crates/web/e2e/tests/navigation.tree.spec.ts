import { test } from '../fixtures/test-base'
import { HomePage } from '../pages/home.page'
import { LoginPage } from '../pages/login.page'
import { WorkspacePage } from '../pages/workspace.page'
import { loginViaUi } from '../support/ui-helpers'

test.describe('Navigation & guards', () => {
  test.describe('Home', () => {
    test.describe('as guest', () => {
      test('shows get started and login links', async ({ page }) => {
        const home = new HomePage(page)
        await home.goto()
        await home.expectGuestView()
      })
    })

    test.describe('as authenticated user', () => {
      test.beforeEach(async ({ api, uniqueUser, testRun }) => {
        testRun.user = uniqueUser
        await api.register(uniqueUser)
        testRun.token = await api.login(uniqueUser)
      })

      test('shows open app link', async ({ page, uniqueUser }) => {
        await loginViaUi(page, uniqueUser.email, uniqueUser.password)
        const home = new HomePage(page)
        await home.goto()
        await home.expectAuthenticatedView()
      })
    })
  })

  test.describe('Protected routes', () => {
    test('redirect unauthenticated user to login', async ({ page }) => {
      const login = new LoginPage(page)
      await login.expectRedirectFrom('/w/1/settings')
    })
  })

  test.describe('Sidebar navigation', () => {
    test.beforeEach(async ({ api, uniqueUser, testRun }) => {
      testRun.user = uniqueUser
      await api.register(uniqueUser)
      testRun.token = await api.login(uniqueUser)
    })

    test('links reach home, settings, members, and new page', async ({
      page,
      uniqueUser,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const workspace = new WorkspacePage(page)
      await workspace.openSettings(wsId)
      await workspace.openMembers(wsId)
      await workspace.openHome(wsId)
      await workspace.openNewPage(wsId)
    })
  })

  test.describe('Logout', () => {
    test.beforeEach(async ({ api, uniqueUser, testRun }) => {
      testRun.user = uniqueUser
      await api.register(uniqueUser)
      testRun.token = await api.login(uniqueUser)
    })

    test('returns to login', async ({ page, uniqueUser }) => {
      await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      const workspace = new WorkspacePage(page)
      const login = await workspace.logoutExpectLogin()
      await login.expectLoaded()
    })
  })
})
