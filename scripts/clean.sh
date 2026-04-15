#!/usr/bin/env bash
#
# clean.sh — Clean build artifacts and caches
#
# Usage:
#   ./scripts/clean.sh              # Clean build outputs only
#   ./scripts/clean.sh all          # Clean everything (+ node_modules)
#   ./scripts/clean.sh deps         # Remove only node_modules
#   ./scripts/clean.sh docker       # Remove Docker volumes (⚠️ destroys data)
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET="${1:-builds}"

clean_builds() {
  echo "▸ Cleaning build outputs..."
  rm -rf apps/frontend/.next
  rm -rf apps/frontend/out
  rm -rf apps/backend/dist
  rm -rf apps/backend/.strapi
  rm -rf apps/backend/.cache
  rm -rf packages/shared/dist
  rm -rf .turbo
  echo "  ✓ Build artifacts removed"
}

clean_deps() {
  echo "▸ Removing node_modules..."
  rm -rf node_modules
  rm -rf apps/frontend/node_modules
  rm -rf apps/backend/node_modules
  rm -rf packages/shared/node_modules
  echo "  ✓ All node_modules removed"
  echo ""
  echo "  Run 'pnpm install' to reinstall dependencies"
}

clean_docker() {
  echo "▸ Stopping and removing Docker volumes..."
  echo "  ⚠ This will DELETE all database data!"
  read -r -p "  Are you sure? (y/N) " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    docker compose down -v --remove-orphans
    echo "  ✓ Docker containers and volumes removed"
  else
    echo "  ○ Cancelled"
  fi
}

case "$TARGET" in
  builds|build|cache)
    clean_builds
    ;;
  all)
    clean_builds
    echo ""
    clean_deps
    ;;
  deps|dependencies|node_modules)
    clean_deps
    ;;
  docker|db|database)
    clean_docker
    ;;
  *)
    echo "Usage: $0 [builds|all|deps|docker]"
    echo ""
    echo "  builds  Clean build outputs only (default)"
    echo "  all     Clean builds + node_modules"
    echo "  deps    Remove only node_modules"
    echo "  docker  Remove Docker volumes (⚠️ destroys data)"
    exit 1
    ;;
esac

echo ""
echo "  ✓ Clean complete"
