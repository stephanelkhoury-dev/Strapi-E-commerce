# 🏗️ Architecture Overview

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend CMS** | Strapi | 5.12+ |
| **Frontend** | Next.js (App Router) | 16.2.3 |
| **UI Framework** | React | 19.2.4 |
| **CSS** | Tailwind CSS | 4.x |
| **State Management** | Zustand | 5.0.12 |
| **Forms** | React Hook Form + Zod | 7.72 / 4.3 |
| **Icons** | Lucide React | 1.8.0 |
| **Database** | PostgreSQL | 16 |
| **Cache** | Redis | 7 |
| **Package Manager** | pnpm | 9.15.0 |
| **Monorepo** | Turborepo | 2.3+ |
| **Deployment** | Vercel (frontend) | — |
| **Node.js** | — | 20 LTS |

---

## Monorepo Structure

```
strapi-ecommerce/
├── apps/
│   ├── backend/          # Strapi 5 CMS (headless API)
│   └── frontend/         # Next.js 16 storefront
├── packages/
│   └── shared/           # Shared TypeScript types & constants
├── docs/                 # This documentation
├── scripts/              # Build, start, stop, test scripts
├── turbo.json            # Turborepo task pipeline
├── pnpm-workspace.yaml   # pnpm workspace config
├── docker-compose.yml    # PostgreSQL + Redis services
└── .nvmrc                # Node 20
```

### Why a Monorepo?

- **Shared types** between frontend and backend prevent drift
- **Single CI/CD pipeline** builds everything
- **Turborepo caching** makes builds fast
- **Unified dependency management** via pnpm workspaces

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│  Next.js App Router · React 19 · Tailwind CSS 4     │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────┐
│              Next.js Server (Vercel)                 │
│  SSR · SSG · ISR · API Routes · Middleware           │
│  Cache: revalidateTag / unstable_cache               │
└───────────────────────┬─────────────────────────────┘
                        │ REST API
                        ▼
┌─────────────────────────────────────────────────────┐
│              Strapi 5 Backend                        │
│  Content Types · Custom Controllers · Services       │
│  Authentication (JWT) · Webhooks                     │
├───────────────────────┼─────────────────────────────┤
│      PostgreSQL 16    │        Redis 7               │
│    (Primary Store)    │       (Cache Layer)           │
└───────────────────────┴─────────────────────────────┘
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
       Cloudinary    Stripe      SendGrid
      (Images)     (Payments)    (Email)
```

---

## Data Flow

### Product Browsing

```
Browser → Next.js (SSG/ISR) → Strapi REST API → PostgreSQL
                ↓
         Cached HTML (CDN)
```

### Cart & Checkout

```
Browser (Zustand Store) → Cart State (localStorage)
         ↓  Checkout
Next.js API Route → Strapi Checkout Controller → Stripe/PayPal
         ↓  Webhook
Strapi Webhook Handler → Order Created → Email via SendGrid
```

### Content Revalidation

```
Strapi Content Update → Webhook → Next.js /api/revalidate
         ↓
  revalidateTag() → CDN Cache Purge → Fresh SSG
```

---

## Frontend Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (Header + Footer)
│   ├── page.tsx            # Homepage
│   ├── products/[slug]/    # Product detail (SSG)
│   ├── categories/[slug]/  # Category listing (SSG)
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow
│   ├── auth/               # Login, Register, Forgot Password
│   ├── account/            # Protected user area
│   └── api/                # API routes (revalidation)
├── components/
│   ├── layout/             # Header, Footer, Breadcrumbs
│   ├── product/            # ProductCard, Gallery, Filters, Tabs
│   ├── cart/               # CartDrawer
│   └── ui/                 # Forms, Accordion, Toaster
├── lib/
│   ├── strapi.ts           # Strapi API client
│   ├── utils.ts            # Utility functions
│   └── store/              # Zustand stores (cart, auth)
├── types/                  # TypeScript type definitions
└── constants/              # App constants
```

### State Management Strategy

| State Type | Solution | Persistence |
|-----------|----------|-------------|
| Server data | Next.js cache + `fetch` | CDN + ISR |
| Cart | Zustand + localStorage | Browser |
| Auth | Zustand + localStorage | Browser |
| UI state | React `useState` | None |
| Form state | React Hook Form | None |

---

## Backend Architecture

```
src/
├── api/                         # Content type APIs
│   ├── product/
│   │   ├── content-types/       # Schema definition
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   └── routes/              # URL routes
│   ├── checkout/                # Custom checkout API
│   │   ├── controllers/         # Stripe, PayPal, Coupon
│   │   ├── services/            # Order creation, stock mgmt
│   │   └── routes/              # Checkout routes
│   └── ... (18 more content types)
└── components/                  # Reusable field groups
    ├── product/specification    # Key-value specs
    ├── shared/seo               # SEO meta fields
    ├── sections/hero            # Homepage hero
    ├── sections/testimonial     # Customer testimonials
    └── shipping/rate            # Shipping rates
```

---

## Security

| Concern | Implementation |
|---------|---------------|
| **XSS** | React auto-escaping, CSP headers |
| **CSRF** | SameSite cookies, token validation |
| **SQL Injection** | Strapi ORM (parameterized queries) |
| **Auth** | JWT with 7-day expiry |
| **CORS** | Whitelisted origins only |
| **Headers** | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| **API Keys** | Environment variables, never committed |
| **Payment** | Server-side Stripe/PayPal, no card data stored |
