#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"

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

docker run -d --name app-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres -p 5432:5432 postgres:16

echo "Waiting for PostgreSQL..."

until docker exec app-db pg_isready -U postgres -d postgres >/dev/null 2>&1; do
sleep 1
done

echo "PostgreSQL is ready."

echo "Running migrations..."
pnpm run db:migrate

echo "Seeding database..."
pnpm run db:seed

echo "Starting Socket.io..."
pnpm run game:socket-server &
PIDS+=("$!")

echo "Starting Next.js..."
pnpm run dev &
PIDS+=("$!")

echo ""
echo "Development stack running."
echo ""
echo "Next.js:    http://localhost:3000"
echo "Socket.io:  http://localhost:3001"
echo "PostgreSQL: localhost:5432"
echo ""

wait
