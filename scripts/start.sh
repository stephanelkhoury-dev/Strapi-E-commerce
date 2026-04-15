#!/usr/bin/env bash
#
# start.sh — Start development services
#
# Usage:
#   ./scripts/start.sh              # Start everything (DB + backend + frontend)
#   ./scripts/start.sh backend      # Start only backend (+ DB)
#   ./scripts/start.sh frontend     # Start only frontend
#   ./scripts/start.sh db           # Start only database services
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET="${1:-all}"

start_db() {
  echo "▸ Starting database services..."

  if ! command -v docker >/dev/null 2>&1; then
    echo "  ⚠ Docker not installed. Skipping database services."
    echo "  → Install Docker from https://docker.com"
    return 0
  fi

  if ! docker info >/dev/null 2>&1; then
    echo "  ⚠ Docker is not running. Skipping database services."
    echo "  → Start Docker Desktop and try again."
    return 0
  fi

  docker compose up -d
  
  # Wait for PostgreSQL
  for i in $(seq 1 30); do
    if docker exec strapi_postgres pg_isready -U strapi -q 2>/dev/null; then
      echo "  ✓ PostgreSQL ready (port 5432)"
      echo "  ✓ Redis ready (port 6379)"
      return
    fi
    sleep 1
  done
  echo "  ⚠ PostgreSQL may not be ready yet"
}

start_backend() {
  echo "▸ Starting Strapi backend..."
  echo "  → http://localhost:1337"
  echo "  → Admin: http://localhost:1337/admin"
  echo ""
  cd "$ROOT_DIR" && pnpm dev:backend
}

start_frontend() {
  echo "▸ Starting Next.js frontend..."
  echo "  → http://localhost:3000"
  echo ""
  cd "$ROOT_DIR" && pnpm dev:frontend
}

start_all() {
  echo "========================================="
  echo "  Strapi E-Commerce — Development"
  echo "========================================="
  echo ""
  start_db
  echo ""
  echo "▸ Starting all services..."
  echo "  → Backend:  http://localhost:1337"
  echo "  → Admin:    http://localhost:1337/admin"
  echo "  → Frontend: http://localhost:3000"
  echo ""
  cd "$ROOT_DIR" && pnpm dev
}

case "$TARGET" in
  all)
    start_all
    ;;
  backend|back|api|strapi)
    start_db
    echo ""
    start_backend
    ;;
  frontend|front|next|web)
    start_frontend
    ;;
  db|database|docker)
    start_db
    ;;
  *)
    echo "Usage: $0 [all|backend|frontend|db]"
    echo ""
    echo "  all       Start everything (default)"
    echo "  backend   Start database + Strapi"
    echo "  frontend  Start Next.js only"
    echo "  db        Start PostgreSQL + Redis only"
    exit 1
    ;;
esac
