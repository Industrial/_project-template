import { userIdForEmail } from '../support/db-tokens'
import { test, expect } from '../fixtures/test-base'
import { PageEditorPage } from '../pages/page-editor.page'
import {
  createPageViaUi,
  loginViaUi,
  openEditor,
  reopenEditor,
  submitAndReload,
  waitForFormPost,
} from '../support/ui-helpers'

test.describe('Page editor', () => {
  test.beforeEach(async ({ api, uniqueUser, testRun }) => {
    testRun.user = uniqueUser
    await api.register(uniqueUser)
    testRun.token = await api.login(uniqueUser)
  })

  test.describe('Page lifecycle', () => {
    test('create page opens editor', async ({ page, uniqueUser, testRun }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const pageId = await createPageViaUi(page, wsId)
      testRun.pageIds.push(pageId)
      const editor = new PageEditorPage(page)
      await editor.expectLoaded(wsId)
    })

    test('rename page title persists after reload', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const pageId = await openEditor(page, api, testRun.token!, wsId)
      testRun.pageIds.push(pageId)

      const editor = new PageEditorPage(page)
      await editor.titleInput.fill('My E2E Page')
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}`,
        editor.titleInput,
        () => editor.saveTitle.click(),
      )
      await expect(editor.titleInput).toHaveValue('My E2E Page')
    })
  })

  test.describe('Blocks', () => {
    test('add block via empty state persists after reload', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const pageId = await createPageViaUi(page, wsId)
      testRun.pageIds.push(pageId)

      const editor = new PageEditorPage(page)
      await editor.expectEmptyBlocks()
      const blocksBefore = (await api.listBlocks(testRun.token!, pageId)).length
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}`,
        editor.blockTextarea(0),
        () => editor.addFirstBlock.click(),
        async () => {
          await expect
            .poll(async () => (await api.listBlocks(testRun.token!, pageId)).length)
            .toBeGreaterThan(blocksBefore)
        },
      )
      await expect(editor.blockTextarea(0)).toBeVisible()
    })

    test('add block via toolbar persists after reload', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const pageId = await openEditor(page, api, testRun.token!, wsId)
      testRun.pageIds.push(pageId)

      const editor = new PageEditorPage(page)
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}`,
        editor.blockTextarea(0),
        () => editor.addFirstBlock.click(),
        async () => {
          await expect
            .poll(async () => (await api.listBlocks(testRun.token!, pageId)).length)
            .toBe(1)
        },
      )
      const blocksBefore = (await api.listBlocks(testRun.token!, pageId)).length
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}`,
        editor.blockTextarea(1),
        () => editor.addBlock.click(),
        async () => {
          await expect
            .poll(async () => (await api.listBlocks(testRun.token!, pageId)).length)
            .toBeGreaterThan(blocksBefore)
        },
      )
      await expect(editor.blockTextarea(0)).toBeVisible()
      await expect(editor.blockTextarea(1)).toBeVisible()
    })

    test('edit block persists after reload', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const pageId = await openEditor(page, api, testRun.token!, wsId)
      testRun.pageIds.push(pageId)

      const editor = new PageEditorPage(page)
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}`,
        editor.blockTextarea(0),
        () => editor.addFirstBlock.click(),
        async () => {
          await expect
            .poll(async () => (await api.listBlocks(testRun.token!, pageId)).length)
            .toBeGreaterThan(0)
        },
      )

      await editor.blockTextarea(0).fill('Hello block')
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}`,
        editor.blockTextarea(0),
        () => editor.blockSave(0).click(),
      )
      await expect(editor.blockTextarea(0)).toHaveValue('Hello block')
    })

    test('delete block removes after reload', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const pageId = await openEditor(page, api, testRun.token!, wsId)
      testRun.pageIds.push(pageId)

      const editor = new PageEditorPage(page)
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}`,
        editor.blockTextarea(0),
        () => editor.addFirstBlock.click(),
        async () => {
          await expect
            .poll(async () => (await api.listBlocks(testRun.token!, pageId)).length)
            .toBeGreaterThan(0)
        },
      )

      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}`,
        editor.addFirstBlock,
        () => editor.blockDelete(0).click(),
      )
      await editor.expectEmptyBlocks()
    })
  })

  test.describe('Comments', () => {
    test('add comment via UI persists after reload', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const pageId = await openEditor(page, api, testRun.token!, wsId)
      testRun.pageIds.push(pageId)

      const editor = new PageEditorPage(page)
      await editor.openComments()
      await editor.commentBody().fill('E2E comment')
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}?comments=1`,
        editor.commentBody(),
        () => editor.postComment().click(),
        async () => {
          await expect
            .poll(async () => (await api.listComments(testRun.token!, pageId)).length)
            .toBeGreaterThan(0)
        },
      )
      await editor.openComments()
      await expect(page.getByText('E2E comment')).toBeVisible()
    })

    test('delete comment via UI', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const pageId = await openEditor(page, api, testRun.token!, wsId)
      testRun.pageIds.push(pageId)

      const editor = new PageEditorPage(page)
      await editor.openComments()
      await editor.commentBody().fill('Delete me')
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}?comments=1`,
        editor.commentBody(),
        () => editor.postComment().click(),
        async () => {
          await expect
            .poll(async () => (await api.listComments(testRun.token!, pageId)).length)
            .toBeGreaterThan(0)
        },
      )
      await editor.openComments()
      await expect(page.getByText('Delete me')).toBeVisible()

      const commentsBefore = (await api.listComments(testRun.token!, pageId)).length
      await editor.openComments()
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}?comments=1`,
        editor.commentBody(),
        () => editor.commentDelete('Delete me').click(),
        async () => {
          await expect
            .poll(async () => (await api.listComments(testRun.token!, pageId)).length)
            .toBeLessThan(commentsBefore)
        },
      )
      await editor.openComments()
      await expect(page.getByText('Delete me')).toHaveCount(0)
    })
  })

  test.describe('Shares', () => {
    test('add share via UI persists after reload', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const guest = {
        name: `${uniqueUser.name} Share Guest`,
        email: uniqueUser.email.replace('e2e-', 'e2e-share-'),
        password: uniqueUser.password,
      }
      await api.register(guest)
      const guestUserId = userIdForEmail(guest.email)
      expect(guestUserId).toBeTruthy()

      const pageId = await openEditor(page, api, testRun.token!, wsId)
      testRun.pageIds.push(pageId)

      const editor = new PageEditorPage(page)
      await editor.openShare()
      await editor.shareUserId().fill(String(guestUserId))
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}?share=1`,
        editor.shareUserId(),
        () => editor.addShare().click(),
        async () => {
          await expect
            .poll(
              async () =>
                (await api.listShares(testRun.token!, pageId)).some(
                  (s) => s.user_id === guestUserId,
                ),
            )
            .toBe(true)
        },
      )
      await editor.openShare()
      await expect(page.getByText(`User #${guestUserId}`)).toBeVisible()
    })

    test('remove share via UI', async ({
      page,
      uniqueUser,
      api,
      testRun,
    }) => {
      const wsId = await loginViaUi(page, uniqueUser.email, uniqueUser.password)
      testRun.workspaceIds.push(wsId)

      const guest = {
        name: `${uniqueUser.name} Share Guest`,
        email: uniqueUser.email.replace('e2e-', 'e2e-share-rm-'),
        password: uniqueUser.password,
      }
      await api.register(guest)
      const guestUserId = userIdForEmail(guest.email)
      expect(guestUserId).toBeTruthy()

      const pageId = await openEditor(page, api, testRun.token!, wsId)
      testRun.pageIds.push(pageId)

      const editor = new PageEditorPage(page)
      await editor.openShare()
      await editor.shareUserId().fill(String(guestUserId))
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}?share=1`,
        editor.shareUserId(),
        () => editor.addShare().click(),
        async () => {
          await expect
            .poll(
              async () =>
                (await api.listShares(testRun.token!, pageId)).some(
                  (s) => s.user_id === guestUserId,
                ),
            )
            .toBe(true)
        },
      )
      await editor.openShare()
      await expect(page.getByText(`User #${guestUserId}`)).toBeVisible()

      await editor.openShare()
      await submitAndReload(
        page,
        `/w/${wsId}/p/${pageId}?share=1`,
        editor.shareUserId(),
        () => editor.shareRemove(guestUserId!).click(),
        async () => {
          await expect
            .poll(
              async () =>
                (await api.listShares(testRun.token!, pageId)).some(
                  (s) => s.user_id === guestUserId,
                ),
            )
            .toBe(false)
        },
      )
      await editor.openShare()
      await expect(page.getByText(`User #${guestUserId}`)).toHaveCount(0)
    })
  })
})
