#!/usr/bin/env bash
#
# stop.sh — Stop all development services
#
# Usage:
#   ./scripts/stop.sh         # Stop everything
#   ./scripts/stop.sh db      # Stop only database containers
#   ./scripts/stop.sh app     # Kill only Node.js dev servers
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET="${1:-all}"

stop_db() {
  echo "▸ Stopping database services..."
  docker compose down 2>/dev/null || true
  echo "  ✓ PostgreSQL and Redis stopped"
}

stop_apps() {
  echo "▸ Stopping Node.js processes..."
  
  # Kill processes on Strapi port (1337)
  if lsof -ti :1337 >/dev/null 2>&1; then
    lsof -ti :1337 | xargs kill -9 2>/dev/null || true
    echo "  ✓ Strapi (port 1337) stopped"
  else
    echo "  ○ Strapi not running"
  fi
  
  # Kill processes on Next.js port (3000)
  if lsof -ti :3000 >/dev/null 2>&1; then
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    echo "  ✓ Next.js (port 3000) stopped"
  else
    echo "  ○ Next.js not running"
  fi
  
  # Kill any turbo processes
  pkill -f "turbo" 2>/dev/null || true
}

case "$TARGET" in
  all)
    echo "========================================="
    echo "  Stopping all services"
    echo "========================================="
    echo ""
    stop_apps
    echo ""
    stop_db
    ;;
  db|database|docker)
    stop_db
    ;;
  app|apps|node)
    stop_apps
    ;;
  *)
    echo "Usage: $0 [all|db|app]"
    echo ""
    echo "  all   Stop everything (default)"
    echo "  db    Stop only PostgreSQL + Redis"
    echo "  app   Stop only Node.js dev servers"
    exit 1
    ;;
esac

echo ""
echo "  ✓ Done"
