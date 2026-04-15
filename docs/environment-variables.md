# 🔐 Environment Variables

## Backend (`apps/backend/.env`)

### Server

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HOST` | No | `0.0.0.0` | Server bind address |
| `PORT` | No | `1337` | Server port |

### Security Keys

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_KEYS` | **Yes** | — | Comma-separated session keys (4 required). Generate unique keys for production. |
| `API_TOKEN_SALT` | **Yes** | — | Salt for API token generation |
| `ADMIN_JWT_SECRET` | **Yes** | — | Secret for admin panel JWT |
| `TRANSFER_TOKEN_SALT` | **Yes** | — | Salt for transfer tokens |
| `JWT_SECRET` | **Yes** | — | Secret for public user JWT |

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_CLIENT` | No | `postgres` | Database type |
| `DATABASE_HOST` | No | `localhost` | Database host |
| `DATABASE_PORT` | No | `5432` | Database port |
| `DATABASE_NAME` | No | `strapi_ecommerce` | Database name |
| `DATABASE_USERNAME` | No | `strapi` | Database user |
| `DATABASE_PASSWORD` | No | `strapi` | Database password |
| `DATABASE_SSL` | No | `false` | Enable SSL connection |

### Cloudinary (Image Upload)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLOUDINARY_NAME` | No | — | Cloudinary cloud name |
| `CLOUDINARY_KEY` | No | — | Cloudinary API key |
| `CLOUDINARY_SECRET` | No | — | Cloudinary API secret |

### Email (SendGrid)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENDGRID_API_KEY` | No | — | SendGrid API key |
| `EMAIL_DEFAULT_FROM` | No | `noreply@yourstore.com` | Default sender email |
| `EMAIL_DEFAULT_REPLY_TO` | No | `support@yourstore.com` | Default reply-to email |

### Payments

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | No | — | Stripe webhook signing secret (`whsec_...`) |
| `PAYPAL_CLIENT_ID` | No | — | PayPal app client ID |
| `PAYPAL_CLIENT_SECRET` | No | — | PayPal app secret |
| `PAYPAL_WEBHOOK_ID` | No | — | PayPal webhook ID |

### Frontend URL

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend URL (for CORS, redirects) |

---

## Frontend (`apps/frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_STRAPI_URL` | **Yes** | `http://localhost:1337` | Strapi API URL (public, used client-side) |
| `REVALIDATION_SECRET` | **Yes** | — | Secret for webhook-triggered cache revalidation |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in `NEXT_PUBLIC_` variables.

---

## Example `.env` (Backend — Development)

```bash
# Server
HOST=0.0.0.0
PORT=1337

# Security Keys (development only - change in production!)
APP_KEYS=localdev-key1,localdev-key2,localdev-key3,localdev-key4
API_TOKEN_SALT=localdev-api-token-salt
ADMIN_JWT_SECRET=localdev-admin-jwt-secret
TRANSFER_TOKEN_SALT=localdev-transfer-token-salt
JWT_SECRET=localdev-jwt-secret

# Database (Docker Compose defaults)
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi_ecommerce
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
DATABASE_SSL=false

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Example `.env.local` (Frontend — Development)

```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
REVALIDATION_SECRET=dev-revalidation-secret
```

---

## Generating Production Secrets

```bash
# Generate a single random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate all required keys at once
node -e "
const crypto = require('crypto');
const gen = () => crypto.randomBytes(16).toString('base64');
console.log('APP_KEYS=' + [gen(), gen(), gen(), gen()].join(','));
console.log('API_TOKEN_SALT=' + gen());
console.log('ADMIN_JWT_SECRET=' + gen());
console.log('TRANSFER_TOKEN_SALT=' + gen());
console.log('JWT_SECRET=' + gen());
console.log('REVALIDATION_SECRET=' + gen());
"
```
