import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { fileRoutes } from 'filesystem-routing/vite'
import { defineConfig } from 'vitest/config'
import solid from '@solidjs/vite-plugin'

export default defineConfig({
  plugins: [
    tailwindcss(),
    solid({
      start: {
        middleware: './src/middleware.ts',
      },
      ssr: true,
      serverFunctions: {
        configure: './src/server-config.ts',
      },
      extensions: ['.jsx', '.tsx'],
    }),
    fileRoutes({ httpMethods: true, types: true }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5150',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: false,
    passWithNoTests: true,
    setupFiles: ['./vitest-setup.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'client',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
        },
      },
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/server/**/*.test.ts'],
          alias: [
            {
              find: 'virtual:env/server',
              replacement: fileURLToPath(
                new URL('./vitest-env-server-stub.ts', import.meta.url),
              ),
            },
          ],
        },
      },
    ],
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
  },
})
