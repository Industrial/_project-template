export const env = new Proxy({} as Record<string, string | undefined>, {
  get(_target, prop: string) {
    return process.env[prop]
  },
})
