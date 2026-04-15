# 🚢 Deployment Guide

## Architecture Overview

| Component | Service | Notes |
|-----------|---------|-------|
| **Frontend** | Vercel | Next.js 16, automatic deployments |
| **Backend** | Your server / Railway / Render | Strapi 5 with PostgreSQL |
| **Database** | PostgreSQL 16 | Managed (Neon, Supabase, Railway) |
| **Cache** | Redis 7 | Optional in production |
| **Media** | Cloudinary | Image hosting and transformation |
| **Email** | SendGrid | Transactional emails |
| **Payments** | Stripe / PayPal | Payment processing |

---

## Frontend Deployment (Vercel)

### Current Deployment

- **URL:** [frontend-omega-pearl-25.vercel.app](https://frontend-omega-pearl-25.vercel.app)
- **Project:** `frontend` in Vercel dashboard
- **Framework:** Next.js (auto-detected)

### Deploy from CLI

```bash
cd apps/frontend

# Preview deployment
npx vercel deploy

# Production deployment
npx vercel --prod
```

### Deploy from GitHub

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `stephanelkhoury-dev/Strapi-E-commerce`
3. Set **Root Directory** to `apps/frontend`
4. Set **Framework Preset** to Next.js
5. Add environment variables (see below)
6. Deploy

### Environment Variables (Vercel)

| Variable | Value | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_STRAPI_URL` | `https://your-strapi.com` | All |
| `REVALIDATION_SECRET` | Random secure string | All |

### vercel.json

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
```

> **Note:** The frontend uses `npm` (not `pnpm`) for Vercel deployment because the shared package types have been inlined into the frontend, making it standalone.

---

## Backend Deployment

### Option 1: Railway

1. Create a new project on [railway.app](https://railway.app)
2. Add a **PostgreSQL** service
3. Add a **Node.js** service
4. Set root directory to `apps/backend`
5. Set start command: `npm run start`
6. Copy env vars from `.env.example`
7. Deploy

### Option 2: Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect GitHub repo
3. Set root directory: `apps/backend`
4. Build command: `npm run build`
5. Start command: `npm run start`
6. Add a **PostgreSQL** database
7. Configure environment variables

### Option 3: Docker

```bash
# Build the backend image
docker build -t strapi-backend -f apps/backend/Dockerfile .

# Run with environment variables
docker run -p 1337:1337 \
  -e DATABASE_CLIENT=postgres \
  -e DATABASE_HOST=your-db-host \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=strapi_ecommerce \
  -e DATABASE_USERNAME=strapi \
  -e DATABASE_PASSWORD=your-password \
  strapi-backend
```

### Option 4: VPS (DigitalOcean, Hetzner, etc.)

```bash
# On your server
git clone https://github.com/stephanelkhoury-dev/Strapi-E-commerce.git
cd Strapi-E-commerce/apps/backend
npm install
npm run build
NODE_ENV=production npm run start
```

Use **PM2** for process management:
```bash
npm install -g pm2
pm2 start npm --name "strapi" -- start
pm2 save
pm2 startup
```

---

## Database Setup

### Managed PostgreSQL (Recommended)

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| [Neon](https://neon.tech) | 0.5 GB | Serverless, branching |
| [Supabase](https://supabase.com) | 500 MB | Built-in auth, realtime |
| [Railway](https://railway.app) | 1 GB | Simple, per-use billing |
| [Render](https://render.com) | 256 MB | 90-day free |

### Migration

Strapi auto-migrates the database on startup. No manual migrations needed.

```bash
# First run creates all tables
cd apps/backend
NODE_ENV=production npm run start
```

---

## Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the Dashboard
3. Add to backend `.env`:
   ```
   CLOUDINARY_NAME=your-cloud-name
   CLOUDINARY_KEY=your-api-key
   CLOUDINARY_SECRET=your-api-secret
   ```
4. Install Strapi Cloudinary plugin:
   ```bash
   cd apps/backend
   npm install @strapi/provider-upload-cloudinary
   ```

---

## Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
3. Add to backend `.env`:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Set up webhook endpoint:
   - URL: `https://your-strapi.com/api/checkout/stripe/webhook`
   - Events: `checkout.session.completed`

---

## Webhook Configuration (Strapi → Next.js)

Set up a webhook in Strapi Admin to trigger cache revalidation:

1. Go to **Settings** → **Webhooks**
2. **URL:** `https://your-frontend.vercel.app/api/revalidate`
3. **Headers:** `x-revalidation-secret: your-secret`
4. **Events:** Entry create, update, publish, unpublish, delete
5. **Content Types:** Product, Category, Homepage, etc.

---

## Production Checklist

### Security

- [ ] Generate unique `APP_KEYS` (4 random strings)
- [ ] Generate unique `API_TOKEN_SALT`
- [ ] Generate unique `ADMIN_JWT_SECRET`
- [ ] Generate unique `TRANSFER_TOKEN_SALT`
- [ ] Generate unique `JWT_SECRET`
- [ ] Set `DATABASE_SSL=true` for managed databases
- [ ] Configure CORS with production domains only
- [ ] Set `REVALIDATION_SECRET` to a strong random string
- [ ] Remove default/test API tokens

### Performance

- [ ] Enable Redis caching (optional)
- [ ] Configure Cloudinary for images
- [ ] Verify ISR revalidation is working
- [ ] Test Lighthouse scores (target: all 100)
- [ ] Enable compression in reverse proxy

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Set up database backups

### Domain

- [ ] Configure custom domain in Vercel
- [ ] Set up SSL certificates (automatic on Vercel)
- [ ] Update CORS origins for custom domain
- [ ] Update `FRONTEND_URL` in backend env
- [ ] Update sitemap URL in `next-sitemap.config.js`

---

## Generate Secure Keys

```bash
# Generate random keys for production
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate 4 APP_KEYS
for i in {1..4}; do
  echo "Key $i: $(node -e "console.log(require('crypto').randomBytes(16).toString('base64'))")"
done
```
