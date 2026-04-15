# 🚀 Getting Started

## Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| **Node.js** | 20 LTS | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| **pnpm** | 9.15+ | `npm install -g pnpm@9` |
| **Docker** | 20+ | [docker.com](https://docker.com) |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com) |

---

## Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/stephanelkhoury-dev/Strapi-E-commerce.git
cd Strapi-E-commerce
```

### 2. Set Node Version

```bash
nvm use    # Uses .nvmrc (Node 20)
```

### 3. Start Database Services

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on port `5432` (database: `strapi_ecommerce`)
- **Redis 7** on port `6379`

### 4. Configure Environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

The defaults work for local development. See [Environment Variables](./environment-variables.md) for details.

### 5. Install Dependencies

```bash
pnpm install
```

### 6. Start Development

```bash
# Start everything (backend + frontend)
pnpm dev

# Or start individually
pnpm dev:backend    # Strapi on http://localhost:1337
pnpm dev:frontend   # Next.js on http://localhost:3000
```

### 7. Create Admin User

Open `http://localhost:1337/admin` and create your first admin account.

---

## Using the Scripts

The `scripts/` folder has ready-made shell scripts:

```bash
# Start everything
./scripts/start.sh

# Start only backend or frontend
./scripts/start.sh backend
./scripts/start.sh frontend

# Build for production
./scripts/build.sh

# Stop all services
./scripts/stop.sh

# Run tests
./scripts/test.sh

# Full setup (first time)
./scripts/setup.sh
```

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

---

## Project Structure After Setup

```
Strapi-E-commerce/
├── apps/
│   ├── backend/
│   │   ├── node_modules/
│   │   ├── .strapi/         # Generated Strapi files
│   │   ├── dist/            # Built backend
│   │   └── .env             # Your environment config
│   └── frontend/
│       ├── node_modules/
│       ├── .next/           # Built frontend
│       └── .env.local       # Frontend env (auto from Vercel)
├── node_modules/            # Root dependencies (Turbo)
└── ...
```

---

## Common First-Time Tasks

### Add Sample Data

1. Go to Strapi Admin → Content Manager
2. Create a few **Categories** (e.g., Electronics, Clothing)
3. Create a few **Products** with images, prices, descriptions
4. Create the **Homepage** single type with hero content
5. Create **Global Settings** (site name, currency, etc.)
6. **Publish** all content (important for API visibility)

### Configure Strapi Permissions

1. Go to **Settings** → **Roles** → **Public**
2. Enable `find` and `findOne` for: Product, Category, Brand, Homepage, Global Setting, About Page, Contact Page, FAQ Page, Legal Page
3. Enable `create` for: Review, Newsletter Subscriber
4. Save

### Configure Stripe (Optional)

1. Get your Stripe keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. Add to `apps/backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## Verify Everything Works

| Check | URL | Expected |
|-------|-----|----------|
| Strapi Admin | http://localhost:1337/admin | Admin login page |
| Strapi API | http://localhost:1337/api/products | JSON response |
| Frontend | http://localhost:3000 | Store homepage |
| PostgreSQL | `docker exec -it postgres psql -U strapi -d strapi_ecommerce` | psql prompt |
| Redis | `docker exec -it redis redis-cli ping` | PONG |

---

## IDE Setup (VS Code Recommended)

### Extensions

- **ESLint** — Linting
- **Tailwind CSS IntelliSense** — Class autocomplete
- **Prettier** — Formatting
- **TypeScript Hero** — Import management

### Workspace Settings

The `.editorconfig` file ensures consistent formatting:
- 2-space indentation
- UTF-8
- LF line endings
