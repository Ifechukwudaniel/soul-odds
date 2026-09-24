#!/usr/bin/env bash
# Production start: installs, migrates, seeds the reference data, builds and serves the app with `next start`.
# Unlike start-dev.sh it starts no Docker Postgres and loads no demo users: point DATABASE_URL at your real database.
#
#   ./start-prod.sh            full start
#   ./start-prod.sh --check    only verify the environment, then exit
#   SKIP_BUILD=1 ./start-prod.sh   reuse the existing .next build
#   PORT=8080 ./start-prod.sh      serve on another port (default 3000)

set -euo pipefail

cd "$(dirname "$0")"

# Hosts normally inject the environment; a local .env is only a fallback.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

MISSING=0
for VAR in DATABASE_URL NEXT_PUBLIC_API_SECRET; do
  if [ -z "${!VAR:-}" ]; then
    echo "Missing required environment variable: $VAR"
    MISSING=1
  fi
done
if [ "$MISSING" -eq 1 ]; then
  exit 1
fi
if [ -z "${OPENROUTER_API_KEY:-}" ]; then
  echo "Warning: OPENROUTER_API_KEY is not set. New sin narratives and life stories can't be generated."
fi

if [ "${1:-}" = "--check" ]; then
  echo "Environment looks good."
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but not installed."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Installing pnpm with npm..."
  npm install -g pnpm
fi

# Dev dependencies are needed here: drizzle-kit runs the migrations and tsx runs the seeds.
echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Running migrations..."
pnpm exec drizzle-kit migrate

# Both seeds are safe to repeat: they only add what the database doesn't have yet.
echo "Seeding Cliopatria places..."
pnpm exec tsx src/scripts/seed-cliopatria-from-zip.ts || echo "Skipping Cliopatria seed."

echo "Seeding sin catalog..."
pnpm exec tsx src/services/seedSinCatalog.ts --prod || echo "Skipping sin catalog seed: places will be generated on demand."

if [ "${SKIP_BUILD:-}" = "1" ] && [ -d .next ]; then
  echo "Reusing existing build."
else
  echo "Building..."
  pnpm run build:next
fi

export NODE_ENV=production
echo "Starting on port ${PORT:-3000}..."
exec pnpm run start:next
