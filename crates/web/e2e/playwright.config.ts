import path from 'node:path'
import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')

function chromiumFromBrowsersPath(): string | undefined {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH?.trim()
  if (!root) {
    return undefined
  }
  try {
    const dir = readdirSync(root).find((entry) => entry.startsWith('chromium-'))
    if (!dir) {
      return undefined
    }
    const chrome = path.join(root, dir, 'chrome-linux', 'chrome')
    return existsSync(chrome) ? chrome : undefined
  } catch {
    return undefined
  }
}

/** NixOS: use devenv Chromium instead of Playwright-downloaded browsers. */
function resolvePlaywrightChromeExecutable(): string | undefined {
  const explicit = process.env.PLAYWRIGHT_EXECUTABLE?.trim()
  if (explicit && existsSync(explicit)) {
    return explicit
  }
  const devenvChrome = process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH?.trim()
  if (devenvChrome && existsSync(devenvChrome)) {
    return devenvChrome
  }
  const fromBrowsersPath = chromiumFromBrowsersPath()
  if (fromBrowsersPath) {
    return fromBrowsersPath
  }
  const nixOsChromium = '/run/current-system/sw/bin/chromium'
  if (existsSync(nixOsChromium)) {
    return nixOsChromium
  }
  return undefined
}

const playwrightChromeExecutable = resolvePlaywrightChromeExecutable()

const e2eDatabaseUrl =
  process.env.DATABASE_URL ??
  `sqlite://${path.join(repoRoot, 'e2e.sqlite')}?mode=rwc`
const e2eApiUrl = process.env.LOCO_API_URL ?? 'http://127.0.0.1:5150'
const e2eFrontendUrl = process.env.FRONTEND_URL ?? 'http://127.0.0.1:3000'

// Ensure worker processes (token helpers, ApiClient) see the same DB/API as webServer.
process.env.DATABASE_URL ??= e2eDatabaseUrl
process.env.LOCO_API_URL ??= e2eApiUrl
process.env.FRONTEND_URL ??= e2eFrontendUrl

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // SQLite + Loco pool: single worker avoids login/navigation flakes under contention.
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(playwrightChromeExecutable
          ? {
              launchOptions: {
                executablePath: playwrightChromeExecutable,
              },
            }
          : {}),
      },
    },
  ],
  webServer: {
    command: `bash ${path.join(__dirname, 'scripts/start-e2e-stack.sh')}`,
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
    env: {
      ...process.env,
      LOCO_ENV: 'test',
      DATABASE_URL: e2eDatabaseUrl,
      LOCO_API_URL: e2eApiUrl,
      FRONTEND_URL: e2eFrontendUrl,
      SESSION_SECRET: 'e2e-test-session-secret-min-32-chars!!',
      PORT: '3000',
    },
  },
})
