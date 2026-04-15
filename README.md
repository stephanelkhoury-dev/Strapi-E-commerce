# 🛒 Strapi E-Commerce

A full-featured e-commerce platform built with **Strapi 5** and **Next.js 16**, designed for perfect Lighthouse scores (Performance, Accessibility, SEO, Best Practices — all 100).

**[Live Demo](https://frontend-omega-pearl-25.vercel.app)** · **[Documentation](./docs/README.md)**

---

## Features

- **Product Catalog** — Categories, brands, variants, specifications, image galleries
- **Shopping Cart** — Persistent cart with Zustand + localStorage
- **Checkout** — Stripe & PayPal integration with webhook order processing
- **User Accounts** — Registration, login, order history, addresses, wishlists, reviews
- **CMS Content** — Homepage hero, FAQ, about, contact, legal pages — all editable in Strapi
- **Coupon System** — Percentage and fixed-amount discounts with validation
- **SEO** — Metadata, OpenGraph, sitemap, structured data, canonical URLs
- **Performance** — SSG, ISR, on-demand revalidation, image optimization
- **Accessibility** — Semantic HTML, ARIA attributes, keyboard navigation
- **Responsive** — Mobile-first design with Tailwind CSS 4

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Strapi 5, PostgreSQL 16, Redis 7 |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| State | Zustand 5, React Hook Form, Zod |
| Monorepo | Turborepo, pnpm workspaces |
| Deployment | Vercel (frontend), Docker (backend) |

## Quick Start

```bash
# Clone
git clone https://github.com/stephanelkhoury-dev/Strapi-E-commerce.git
cd Strapi-E-commerce

# Setup (installs deps, starts DB, configures env)
./scripts/setup.sh

# Start development
./scripts/start.sh
```

Open:
- **Frontend:** http://localhost:3000
- **Strapi Admin:** http://localhost:1337/admin

## Scripts

```bash
./scripts/setup.sh              # First-time project setup
./scripts/start.sh              # Start all services
./scripts/start.sh backend      # Start backend only
./scripts/start.sh frontend     # Start frontend only
./scripts/stop.sh               # Stop all services
./scripts/build.sh              # Build for production
./scripts/test.sh               # Run all tests and checks
./scripts/test.sh lint          # Lint only
./scripts/test.sh types         # Type-check only
./scripts/deploy.sh             # Deploy frontend to Vercel
./scripts/deploy.sh preview     # Deploy preview to Vercel
./scripts/clean.sh              # Clean build artifacts
./scripts/seed.sh               # Seed sample data
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Architecture](./docs/architecture.md) | System design, tech stack, data flow |
| [Getting Started](./docs/getting-started.md) | Installation and first run |
| [Backend Guide](./docs/backend.md) | Content types, APIs, configuration |
| [Frontend Guide](./docs/frontend.md) | Pages, components, state management |
| [API Reference](./docs/api-reference.md) | REST endpoints with examples |
| [Database Schema](./docs/database-schema.md) | ER diagram, table definitions |
| [Deployment](./docs/deployment.md) | Vercel, Docker, production checklist |
| [Environment Variables](./docs/environment-variables.md) | All env vars explained |
| [Testing](./docs/testing.md) | Test setup and running tests |
| [Performance & SEO](./docs/performance-seo.md) | Optimization strategies |
| [Troubleshooting](./docs/troubleshooting.md) | Common issues and fixes |
| [Contributing](./docs/contributing.md) | Code style, PR workflow |

## Project Structure

```
├── apps/
│   ├── backend/           # Strapi 5 CMS (18 content types)
│   └── frontend/          # Next.js 16 storefront (25+ pages)
├── packages/
│   └── shared/            # Shared TypeScript types
├── docs/                  # Full documentation
├── scripts/               # Dev, build, test, deploy scripts
├── docker-compose.yml     # PostgreSQL + Redis
└── turbo.json             # Monorepo pipeline
```

## License

MIT
