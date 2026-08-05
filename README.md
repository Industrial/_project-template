# test-loco-webapp

Loco (Rust) Notion-style workspace app on SQLite.

## Stack

- **Backend:** Loco 1.0 SaaS (JWT auth, Axum, SeaORM, SQLite)
- **Frontend:** Vite React SSR (`crates/web/frontend/`) proxying `/api` → Loco `:5150`
- **Crates:** many small domain crates + `web` + `migration`

## Workspace crates

| Crate | Role |
|-------|------|
| `crates/web` | Loco app, controllers, models, DTOs, Vite frontend |
| `crates/migration` | SeaORM migrations |
| `crates/domain-core` | Roles, block types, domain errors |
| `crates/domain-workspace` | Workspace create/rename rules |
| `crates/domain-page` | Nested page rules |
| `crates/domain-block` | Block content validation |
| `crates/domain-share` | ACL helpers |
| `crates/domain-comment` | Comment validation |

## Run

```bash
# API (from repo root) — http://localhost:5150
cargo run -p test-loco-webapp --features cli -- start

# Frontend SSR (separate terminal) — http://localhost:5174
cd crates/web/frontend && bun install && bun run dev
```

Open http://localhost:5174 — API at http://localhost:5150.
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
