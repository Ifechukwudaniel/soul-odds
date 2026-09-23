#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but not installed."
  exit 1
fi

# Install pnpm if missing
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Installing pnpm with npm..."
  npm install -g pnpm
fi

# Install project dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# Create .env if missing
if [ ! -f .env ]; then
  echo "No .env found. Copying .env.example to .env."
  cp .env.example .env
fi

PIDS=()

cleanup() {
  echo ""
  echo "Stopping development stack..."

  for PID in "${PIDS[@]}"; do
    kill "$PID" 2>/dev/null || true
  done

  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Removing existing PostgreSQL container..."
docker rm -f app-db 2>/dev/null || true

echo "Starting PostgreSQL..."
docker run -d \
  --name app-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  postgres:16

echo "Waiting for PostgreSQL..."

until docker exec app-db pg_isready -U postgres -d postgres >/dev/null 2>&1; do
  sleep 1
done

echo "PostgreSQL is ready."

echo "Running migrations..."
pnpm run db:migrate

echo "Seeding database..."
pnpm run db:seed

echo "Seeding Cliopatria places..."
pnpm run db:seed:cliopatria:zip || echo "Skipping: cliopatria.geojson/cliopatria_polities_only.zip not found."

echo "Seeding sin catalog..."
pnpm run db:seed:sin-catalog || echo "Skipping: sin-catalog/sin-catalog.json not found."

echo "Starting Socket.io..."
pnpm run game:socket-server &
PIDS+=("$!")

echo ""
echo "Development stack running."
echo ""
echo "Next.js:    http://localhost:3000"
echo "Socket.io:  http://localhost:3001"
echo "PostgreSQL: localhost:5432"
echo ""

wait