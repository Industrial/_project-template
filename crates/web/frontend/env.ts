import * as v from 'valibot'

export default {
  server: {
    SESSION_SECRET: v.pipe(v.string(), v.minLength(32)),
    LOCO_API_URL: v.optional(
      v.pipe(v.string(), v.url()),
      'http://127.0.0.1:5150',
    ),
  },
  client: {
    VITE_APP_NAME: v.optional(v.pipe(v.string(), v.minLength(1)), 'Notes'),
  },
}
