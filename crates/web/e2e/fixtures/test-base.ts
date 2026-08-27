import { test as base, expect } from '@playwright/test'

import { ApiClient, cleanupTestRun, type TestRunContext } from '../support/api-client'
import { createUniqueUser, type TestUser } from '../support/data-factory'

const apiBase = process.env.LOCO_API_URL ?? 'http://127.0.0.1:5150'

type E2EFixtures = {
  uniqueUser: TestUser
  api: ApiClient
  testRun: TestRunContext
}

export const test = base.extend<E2EFixtures>({
  uniqueUser: async ({}, use, testInfo) => {
    await use(createUniqueUser(testInfo))
  },
  api: async ({}, use) => {
    await use(new ApiClient(apiBase))
  },
  testRun: async ({ uniqueUser, api }, use) => {
    const run: TestRunContext = {
      user: uniqueUser,
      workspaceIds: [],
      pageIds: [],
      blockIds: [],
      commentIds: [],
      shareIds: [],
      memberIds: [],
    }
    await use(run)
    await cleanupTestRun(api, run)
  },
})

export { expect }
