#!/usr/bin/env bash
#
# deploy.sh — Deploy to production
#
# Usage:
#   ./scripts/deploy.sh              # Deploy frontend to Vercel (production)
#   ./scripts/deploy.sh preview      # Deploy frontend to Vercel (preview)
#   ./scripts/deploy.sh frontend     # Same as default
#   ./scripts/deploy.sh backend      # Show backend deployment instructions
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET="${1:-frontend}"

deploy_frontend_prod() {
  echo "========================================="
  echo "  Deploying Frontend to Production"
  echo "========================================="
  echo ""
  
  cd "$ROOT_DIR/apps/frontend"
  
  # Check Vercel CLI
  if ! command -v npx >/dev/null 2>&1; then
    echo "✗ npx is required"
    exit 1
  fi
  
  echo "▸ Deploying to Vercel (production)..."
  npx vercel --prod
  
  echo ""
  echo "  ✓ Production deployment complete!"
}

deploy_frontend_preview() {
  echo "========================================="
  echo "  Deploying Frontend (Preview)"
  echo "========================================="
  echo ""
  
  cd "$ROOT_DIR/apps/frontend"
  
  echo "▸ Deploying to Vercel (preview)..."
  npx vercel deploy
  
  echo ""
  echo "  ✓ Preview deployment complete!"
}

deploy_backend_info() {
  echo "========================================="
  echo "  Backend Deployment"
  echo "========================================="
  echo ""
  echo "  The backend (Strapi) must be deployed to a"
  echo "  Node.js hosting service. Options:"
  echo ""
  echo "  1. Railway   → railway.app"
  echo "  2. Render    → render.com"
  echo "  3. DigitalOcean App Platform"
  echo "  4. Docker on any VPS"
  echo ""
  echo "  Steps:"
  echo "    cd apps/backend"
  echo "    npm run build"
  echo "    NODE_ENV=production npm run start"
  echo ""
  echo "  Don't forget to:"
  echo "    - Set all environment variables"
  echo "    - Configure a managed PostgreSQL database"
  echo "    - Set up Cloudinary for image uploads"
  echo "    - Generate unique security keys"
  echo ""
  echo "  See docs/deployment.md for full guide."
}

case "$TARGET" in
  frontend|front|prod|production)
    deploy_frontend_prod
    ;;
  preview|staging)
    deploy_frontend_preview
    ;;
  backend|back|api|strapi)
    deploy_backend_info
    ;;
  *)
    echo "Usage: $0 [frontend|preview|backend]"
    echo ""
    echo "  frontend  Deploy to Vercel production (default)"
    echo "  preview   Deploy to Vercel preview"
    echo "  backend   Show backend deployment instructions"
    exit 1
    ;;
esac
