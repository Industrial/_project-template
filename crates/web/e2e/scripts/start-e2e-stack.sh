#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT"

export LOCO_ENV="${LOCO_ENV:-test}"
export DATABASE_URL="${DATABASE_URL:-sqlite://${ROOT}/e2e.sqlite?mode=rwc}"
export LOCO_API_URL="${LOCO_API_URL:-http://127.0.0.1:5150}"
export FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:3000}"
export SESSION_SECRET="${SESSION_SECRET:-e2e-session-secret-change-me-in-prod!!}"
export PORT="${PORT:-3000}"
# SolidStart SSR can grow large under Playwright navigations; raise heap for e2e.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

echo "[e2e-stack] root=${ROOT}"
echo "[e2e-stack] DATABASE_URL=${DATABASE_URL}"

free_port() {
    local port="$1"
    if command -v fuser >/dev/null 2>&1; then
        fuser -k "${port}/tcp" 2>/dev/null || true
    fi
    for _ in $(seq 1 20); do
        if ! (echo >/dev/tcp/127.0.0.1/${port}) 2>/dev/null; then
            return 0
        fi
        sleep 0.5
    done
    echo "[e2e-stack] ERROR: port ${port} still in use after cleanup" >&2
    return 1
}

echo "[e2e-stack] freeing ports 5150 and ${PORT}"
free_port 5150
free_port "${PORT}"
sleep 1

CLI_BIN="${ROOT}/target/debug/test_loco_webapp-cli"
run_cli() {
    if [[ -x "${CLI_BIN}" ]]; then
        LOCO_ENV=test DATABASE_URL="${DATABASE_URL}" "${CLI_BIN}" "$@"
    else
        LOCO_ENV=test DATABASE_URL="${DATABASE_URL}" cargo run -p test-loco-webapp --features cli -- "$@"
    fi
}

echo "[e2e-stack] resetting database schema"
run_cli db reset

echo "[e2e-stack] starting API on :5150"
if [[ -x "${CLI_BIN}" ]]; then
    LOCO_ENV=test DATABASE_URL="${DATABASE_URL}" "${CLI_BIN}" start &
else
    LOCO_ENV=test DATABASE_URL="${DATABASE_URL}" cargo run -p test-loco-webapp --features cli -- start &
fi
API_PID=$!

cleanup() {
    echo "[e2e-stack] shutting down pids api=${API_PID} frontend=${FRONTEND_PID:-none}"
    kill "${API_PID}" 2>/dev/null || true
    if [[ -n "${FRONTEND_PID:-}" ]]; then
        kill "${FRONTEND_PID}" 2>/dev/null || true
    fi
}
trap cleanup EXIT

wait_http() {
    local url="$1"
    local name="$2"
    local attempts="${3:-90}"
    for i in $(seq 1 "${attempts}"); do
        code="$(curl -s -o /dev/null -w '%{http_code}' "${url}" || true)"
        if [[ "${code}" != "000" && -n "${code}" ]]; then
            echo "[e2e-stack] ${name} ready (${url} → ${code}) after ${i}s"
            return 0
        fi
        if (( i % 5 == 0 )); then
            echo "[e2e-stack] waiting for ${name}… ${i}/${attempts}s"
        fi
        sleep 1
    done
    echo "[e2e-stack] ERROR: ${name} did not become ready at ${url}" >&2
    return 1
}

for i in $(seq 1 90); do
    code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:5150/" || true)"
    if [[ "${code}" != "000" && -n "${code}" ]]; then
        echo "[e2e-stack] API accepting connections (${code}) after ${i}s"
        break
    fi
    if (echo >/dev/tcp/127.0.0.1/5150) 2>/dev/null; then
        echo "[e2e-stack] API port open after ${i}s"
        break
    fi
    if (( i % 5 == 0 )); then
        echo "[e2e-stack] waiting for API… ${i}/90s (pid=${API_PID})"
        if ! kill -0 "${API_PID}" 2>/dev/null; then
            echo "[e2e-stack] ERROR: API process exited early" >&2
            exit 1
        fi
    fi
    sleep 1
done

if ! kill -0 "${API_PID}" 2>/dev/null; then
    echo "[e2e-stack] ERROR: API process exited before becoming ready" >&2
    exit 1
fi
if ! (echo >/dev/tcp/127.0.0.1/5150) 2>/dev/null; then
    echo "[e2e-stack] ERROR: API port 5150 is not open" >&2
    exit 1
fi

cd "${ROOT}/crates/web/frontend"
echo "[e2e-stack] building frontend…"
bun run build

echo "[e2e-stack] starting frontend on :${PORT}"
LOCO_ENV=test DATABASE_URL="${DATABASE_URL}" LOCO_API_URL="${LOCO_API_URL}" FRONTEND_URL="${FRONTEND_URL}" SESSION_SECRET="${SESSION_SECRET}" bun run start &
FRONTEND_PID=$!

wait_http "http://127.0.0.1:${PORT}/" "frontend" 90

echo "[e2e-stack] ready — API :5150, frontend :${PORT}"
# Keep process alive for Playwright webServer; emit heartbeats so tooling does not kill silence.
while kill -0 "${API_PID}" 2>/dev/null && kill -0 "${FRONTEND_PID}" 2>/dev/null; do
    echo "[e2e-stack] heartbeat $(date -Iseconds)"
    sleep 15
done

echo "[e2e-stack] a child process exited" >&2
exit 1
