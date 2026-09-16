#!/usr/bin/env bash
# Starts the full local dev stack in one go:
#   - pnpm dev            -> PGlite DB server + Next.js dev server + Spotlight
#   - game:socket-server  -> Socket.io server for the TouchSwap game (port 3001)
#   - game:emulators      -> Firebase Firestore emulator (port 8080)
set -uo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "No .env found — copying .env.example. Fill in any values it needs before continuing."
  cp .env.example .env
fi

pids=()

cleanup() {
  trap - INT TERM EXIT
  echo "Stopping dev stack..."
  kill "${pids[@]}" 2>/dev/null
  wait "${pids[@]}" 2>/dev/null
}
trap cleanup INT TERM EXIT

pnpm run game:emulators &
pids+=("$!")

pnpm run game:socket-server &
pids+=("$!")

pnpm run dev &
pids+=("$!")

wait "${pids[@]}"
