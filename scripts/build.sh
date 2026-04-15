#!/usr/bin/env bash
#
# build.sh — Build for production
#
# Usage:
#   ./scripts/build.sh              # Build everything
#   ./scripts/build.sh backend      # Build only backend
#   ./scripts/build.sh frontend     # Build only frontend
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET="${1:-all}"

build_backend() {
  echo "▸ Building Strapi backend..."
  cd "$ROOT_DIR/apps/backend"
  pnpm build
  echo "  ✓ Backend built → apps/backend/dist/"
}

build_frontend() {
  echo "▸ Building Next.js frontend..."
  cd "$ROOT_DIR/apps/frontend"
  npm run build
  echo "  ✓ Frontend built → apps/frontend/.next/"
}

build_all() {
  echo "========================================="
  echo "  Building for Production"
  echo "========================================="
  echo ""
  
  echo "▸ Building all packages via Turbo..."
  cd "$ROOT_DIR"
  pnpm build
  echo ""
  echo "  ✓ All builds complete"
}

case "$TARGET" in
  all)
    build_all
    ;;
  backend|back|api|strapi)
    build_backend
    ;;
  frontend|front|next|web)
    build_frontend
    ;;
  *)
    echo "Usage: $0 [all|backend|frontend]"
    echo ""
    echo "  all       Build everything via Turbo (default)"
    echo "  backend   Build only Strapi"
    echo "  frontend  Build only Next.js"
    exit 1
    ;;
esac

echo ""
echo "========================================="
echo "  ✓ Build Complete"
echo "========================================="
