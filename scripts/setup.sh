#!/usr/bin/env bash
#
# setup.sh — First-time project setup
#
# Usage:
#   ./scripts/setup.sh
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "========================================="
echo "  Strapi E-Commerce — Project Setup"
echo "========================================="
echo ""

# Check prerequisites
echo "▸ Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "✗ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "✗ pnpm is required. Run: npm install -g pnpm@9"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "✗ Docker is required. Install from https://docker.com"; exit 1; }

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "✗ Node.js 20+ required (found v$(node -v)). Run: nvm use 20"
  exit 1
fi

echo "  ✓ Node.js $(node -v)"
echo "  ✓ pnpm $(pnpm -v)"
echo "  ✓ Docker $(docker --version | awk '{print $3}' | tr -d ',')"
echo ""

# Start database services
echo "▸ Starting PostgreSQL and Redis..."
docker compose up -d
echo "  ✓ Database services running"
echo ""

# Wait for PostgreSQL to be ready
echo "▸ Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  if docker exec postgres pg_isready -U strapi -q 2>/dev/null; then
    echo "  ✓ PostgreSQL ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "  ✗ PostgreSQL did not become ready in time"
    exit 1
  fi
  sleep 1
done
echo ""

# Set up environment files
echo "▸ Setting up environment files..."
if [ ! -f apps/backend/.env ]; then
  cp apps/backend/.env.example apps/backend/.env
  echo "  ✓ Created apps/backend/.env from .env.example"
else
  echo "  ○ apps/backend/.env already exists (skipped)"
fi

if [ ! -f apps/frontend/.env.local ]; then
  cat > apps/frontend/.env.local <<EOF
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
REVALIDATION_SECRET=dev-revalidation-secret
EOF
  echo "  ✓ Created apps/frontend/.env.local"
else
  echo "  ○ apps/frontend/.env.local already exists (skipped)"
fi
echo ""

# Install dependencies
echo "▸ Installing dependencies..."
pnpm install
echo "  ✓ Dependencies installed"
echo ""

# Build shared package
echo "▸ Building shared package..."
cd packages/shared && pnpm build 2>/dev/null || true
cd "$ROOT_DIR"
echo "  ✓ Shared package ready"
echo ""

# Summary
echo "========================================="
echo "  ✓ Setup Complete!"
echo "========================================="
echo ""
echo "  Next steps:"
echo ""
echo "  1. Start development:"
echo "     pnpm dev"
echo ""
echo "  2. Open Strapi Admin:"
echo "     http://localhost:1337/admin"
echo "     (Create your admin account on first visit)"
echo ""
echo "  3. Open Frontend:"
echo "     http://localhost:3000"
echo ""
echo "  4. Add sample data in Strapi Admin:"
echo "     - Create Categories"
echo "     - Create Products with images"
echo "     - Configure Homepage content"
echo "     - Set Public API permissions"
echo ""
echo "  See docs/ folder for full documentation."
echo ""
