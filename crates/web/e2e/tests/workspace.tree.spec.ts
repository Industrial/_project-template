import { userIdForEmail } from '../support/db-tokens'
import { test, expect } from '../fixtures/test-base'
import { WorkspaceMembersPage } from '../pages/workspace-members.page'
import { WorkspaceSettingsPage } from '../pages/workspace-settings.page'
import { WorkspacePage } from '../pages/workspace.page'
import {
  loginViaUi,
  waitForFormPost,
} from '../support/ui-helpers'

test.describe('Workspace', () => {
  test.beforeEach(async ({ api, uniqueUser, testRun }) => {
    testRun.user = uniqueUser
    await api.register(uniqueUser)
    testRun.token = await api.login(uniqueUser)
  })

  test.describe('First login', () => {
    test('auto-creates Personal workspace', async ({ page, uniqueUser }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      expect(wsId).toBeGreaterThan(0)
      const workspace = new WorkspacePage(page)
      await workspace.expectHomeLoaded()
    })
  })

  test.describe('Settings', () => {
    test('rename workspace shows saved confirmation', async ({
      page,
      uniqueUser,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId!)

      const settings = new WorkspaceSettingsPage(page)
      await settings.goto(wsId)
      await settings.nameInput.fill('Renamed Workspace')
      await Promise.all([
        waitForFormPost(page),
        settings.saveButton.click(),
      ])
      await settings.expectSaved()
    })

    test.describe('Members', () => {
      test('invite member shows success', async ({
        page,
        uniqueUser,
        api,
        testRun,
      }) => {
        const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
        testRun.workspaceIds.push(wsId!)

        const guest = {
          name: `${uniqueUser.name} Guest`,
          email: uniqueUser.email.replace('e2e-', 'e2e-guest-'),
          password: uniqueUser.password,
        }
        await api.register(guest)
        const guestUserId = userIdForEmail(guest.email)
        expect(guestUserId).toBeTruthy()

        const members = new WorkspaceMembersPage(page)
        await members.goto(wsId)
        await members.userIdInput.fill(String(guestUserId))
        await Promise.all([
          waitForFormPost(page),
          members.inviteButton.click(),
        ])
        await members.expectInvited()
      })
    })
  })

  test.describe('Workspace switcher', () => {
    test('can switch between workspaces', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      const secondId = await api.createWorkspace(testRun.token!, 'Second WS')
      testRun.workspaceIds.push(wsId!, secondId)

      await page.reload()
      const workspace = new WorkspacePage(page)
      await workspace.switchWorkspace(secondId)
    })
  })
})
