import { execFileSync } from 'node:child_process'
import path from 'node:path'

function sqlitePath(): string {
  const url = process.env.DATABASE_URL ?? 'sqlite://e2e.sqlite?mode=rwc'
  const match = url.match(/^sqlite:\/\/(.+?)(?:\?.*)?$/)
  if (!match) {
    throw new Error(`Unsupported DATABASE_URL for e2e tokens: ${url}`)
  }
  const file = match[1]
  return path.isAbsolute(file) ? file : path.resolve(process.cwd(), '../../..', file)
}

function queryColumn(email: string, column: string): string | null {
  const db = sqlitePath()
  const sql = `SELECT ${column} FROM users WHERE email = '${email.replace(/'/g, "''")}' LIMIT 1;`
  try {
    const out = execFileSync('sqlite3', [db, sql], { encoding: 'utf8' }).trim()
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

export function verificationTokenForEmail(email: string): string | null {
  return queryColumn(email, 'email_verification_token')
}

export function resetTokenForEmail(email: string): string | null {
  return queryColumn(email, 'reset_token')
}

export function userIdForEmail(email: string): number | null {
  const raw = queryColumn(email, 'id')
  if (!raw) {
    return null
  }
  const id = Number(raw)
  return Number.isFinite(id) ? id : null
}
