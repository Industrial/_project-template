import type { TestInfo } from '@playwright/test'

export type TestUser = {
  name: string
  email: string
  password: string
}

export function createUniqueUser(testInfo: TestInfo): TestUser {
  const slug = `${testInfo.workerIndex}-${testInfo.testId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}-${crypto.randomUUID().slice(0, 8)}`
  return {
    name: `E2E User ${slug}`,
    email: `e2e-${slug}@e2e.test.local`,
    password: `Pass-${slug}!`,
  }
}
