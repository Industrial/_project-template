# test-loco-webapp

Loco (Rust) Notion-style workspace app on SQLite.

## Stack

- **Backend:** Loco 1.0 SaaS (JWT auth, Axum, SeaORM, SQLite)
- **Frontend:** Solid 2.0 fullstack SSR (`crates/web/frontend/`) with Kobalte; server functions proxy to Loco `:5150`
- **Crates:** `web` (Loco app) + `migration`

## Workspace crates

| Crate | Role |
|-------|------|
| `crates/web` | Loco app, controllers, models (one type per file), DTOs, Vite frontend |
| `crates/migration` | SeaORM migrations |

## Run

```bash
# API (from repo root) — http://localhost:5150
cargo run -p test-loco-webapp --features cli -- start

# Frontend SSR (separate terminal) — http://localhost:5173
cd crates/web/frontend && bun install && bun run dev
```

Open http://localhost:5173 — API at http://localhost:5150.
(`cargo loco` is optional; install with `cargo install loco-cli` if you prefer that UX.)

## Notion v0 resources

Authenticated `/api`:

- `/api/workspaces`
- `/api/workspace_members`
- `/api/pages`
- `/api/blocks`
- `/api/page_shares`
- `/api/comments`
- `/api/auth/*` (register, login, …)
