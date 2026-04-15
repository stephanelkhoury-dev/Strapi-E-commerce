#!/usr/bin/env bash
#
# test.sh — Run tests, linting, and type checking
#
# Usage:
#   ./scripts/test.sh              # Run all checks
#   ./scripts/test.sh lint         # ESLint only
#   ./scripts/test.sh types        # TypeScript type-check only
#   ./scripts/test.sh frontend     # Frontend checks only
#   ./scripts/test.sh backend      # Backend checks only
#   ./scripts/test.sh unit         # Unit tests only
#   ./scripts/test.sh e2e          # E2E tests only
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET="${1:-all}"
ERRORS=0

run_lint() {
  echo "▸ Running ESLint..."
  if pnpm lint 2>&1; then
    echo "  ✓ Linting passed"
  else
    echo "  ✗ Linting failed"
    ERRORS=$((ERRORS + 1))
  fi
  echo ""
}

run_types_frontend() {
  echo "▸ Type-checking frontend..."
  if cd "$ROOT_DIR/apps/frontend" && npx tsc --noEmit 2>&1; then
    echo "  ✓ Frontend types OK"
  else
    echo "  ✗ Frontend type errors found"
    ERRORS=$((ERRORS + 1))
  fi
  cd "$ROOT_DIR"
  echo ""
}

run_types_backend() {
  echo "▸ Type-checking backend..."
  if cd "$ROOT_DIR/apps/backend" && npx tsc --noEmit 2>&1; then
    echo "  ✓ Backend types OK"
  else
    echo "  ✗ Backend type errors found"
    ERRORS=$((ERRORS + 1))
  fi
  cd "$ROOT_DIR"
  echo ""
}

run_unit_tests() {
  echo "▸ Running unit tests..."
  if [ -f "$ROOT_DIR/apps/frontend/vitest.config.ts" ] || [ -f "$ROOT_DIR/apps/frontend/vitest.config.js" ]; then
    cd "$ROOT_DIR/apps/frontend"
    if npx vitest run 2>&1; then
      echo "  ✓ Unit tests passed"
    else
      echo "  ✗ Unit tests failed"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo "  ○ No unit test config found (skipped)"
    echo "  → See docs/testing.md for setup instructions"
  fi
  cd "$ROOT_DIR"
  echo ""
}

run_e2e_tests() {
  echo "▸ Running E2E tests..."
  if [ -d "$ROOT_DIR/apps/frontend/e2e" ]; then
    cd "$ROOT_DIR/apps/frontend"
    if npx playwright test 2>&1; then
      echo "  ✓ E2E tests passed"
    else
      echo "  ✗ E2E tests failed"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo "  ○ No E2E tests found (skipped)"
    echo "  → See docs/testing.md for setup instructions"
  fi
  cd "$ROOT_DIR"
  echo ""
}

run_build_check() {
  echo "▸ Verifying production build..."
  if cd "$ROOT_DIR/apps/frontend" && npm run build 2>&1; then
    echo "  ✓ Production build succeeds"
  else
    echo "  ✗ Production build failed"
    ERRORS=$((ERRORS + 1))
  fi
  cd "$ROOT_DIR"
  echo ""
}

print_header() {
  echo "========================================="
  echo "  Strapi E-Commerce — Test Suite"
  echo "========================================="
  echo ""
}

print_results() {
  echo "========================================="
  if [ "$ERRORS" -eq 0 ]; then
    echo "  ✓ All checks passed!"
  else
    echo "  ✗ $ERRORS check(s) failed"
  fi
  echo "========================================="
  exit "$ERRORS"
}

case "$TARGET" in
  all)
    print_header
    run_lint
    run_types_frontend
    run_types_backend
    run_unit_tests
    run_e2e_tests
    print_results
    ;;
  lint)
    run_lint
    ;;
  types|typecheck|type-check)
    run_types_frontend
    run_types_backend
    ;;
  frontend|front)
    print_header
    echo "  Frontend checks only"
    echo ""
    run_types_frontend
    run_unit_tests
    run_build_check
    print_results
    ;;
  backend|back)
    print_header
    echo "  Backend checks only"
    echo ""
    run_types_backend
    print_results
    ;;
  unit)
    run_unit_tests
    ;;
  e2e)
    run_e2e_tests
    ;;
  build)
    run_build_check
    ;;
  *)
    echo "Usage: $0 [all|lint|types|frontend|backend|unit|e2e|build]"
    echo ""
    echo "  all       Run all checks (default)"
    echo "  lint      ESLint only"
    echo "  types     TypeScript type-check"
    echo "  frontend  Frontend checks (types + tests + build)"
    echo "  backend   Backend checks (types)"
    echo "  unit      Unit tests only"
    echo "  e2e       E2E tests only"
    echo "  build     Verify production build"
    exit 1
    ;;
esac
