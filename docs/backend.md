# 🔧 Backend Guide — Strapi 5

## Overview

The backend is a **Strapi 5** headless CMS providing a REST API for the storefront. It manages products, orders, users, content pages, and integrates with payment providers.

---

## Content Types

### Collection Types (CRUD Resources)

| Content Type | API Endpoint | Description |
|-------------|-------------|-------------|
| **Product** | `/api/products` | Store products with variants, images, specs |
| **Category** | `/api/categories` | Hierarchical product categories |
| **Brand** | `/api/brands` | Product brands with logos |
| **Order** | `/api/orders` | Customer orders with status tracking |
| **OrderItem** | `/api/order-items` | Line items within orders |
| **ProductVariant** | `/api/product-variants` | Size, color, etc. variants |
| **Review** | `/api/reviews` | Product reviews with ratings (1-5) |
| **Coupon** | `/api/coupons` | Discount codes (percentage/fixed) |
| **Address** | `/api/addresses` | User shipping/billing addresses |
| **Wishlist** | `/api/wishlists` | User product wishlists |
| **NewsletterSubscriber** | `/api/newsletter-subscribers` | Email subscribers |
| **ShippingZone** | `/api/shipping-zones` | Shipping rates by region |

### Single Types (Global Content)

| Content Type | API Endpoint | Description |
|-------------|-------------|-------------|
| **Homepage** | `/api/homepage` | Hero, featured products, banners, testimonials |
| **GlobalSetting** | `/api/global-setting` | Site name, currency, social links, contact |
| **AboutPage** | `/api/about-page` | About us content |
| **ContactPage** | `/api/contact-page` | Contact info, map, form |
| **FaqPage** | `/api/faq-page` | FAQ items |
| **LegalPage** | `/api/legal-page` | Privacy, Terms, Shipping, Return policies |

---

## Product Schema (Detailed)

```
Product
├── name              (string, required, min: 2)
├── slug              (uid, from name)
├── description       (richtext)
├── shortDescription  (text, max: 500)
├── price             (decimal, required, min: 0)
├── compareAtPrice    (decimal, min: 0)
├── sku               (string, unique)
├── barcode           (string)
├── stock             (integer, default: 0, min: 0)
├── isDigital         (boolean, default: false)
├── digitalFileURL    (string)
├── weight            (decimal)
├── dimensions        (json)
├── featured          (boolean, default: false)
├── images            (media, multiple)
├── category          → Category (manyToOne)
├── brand             → Brand (manyToOne)
├── variants          → ProductVariant[] (oneToMany)
├── reviews           → Review[] (oneToMany)
├── specifications    → product.specification[] (component, repeatable)
├── seo               → shared.seo (component)
├── averageRating     (decimal, default: 0)
└── reviewCount       (integer, default: 0)
```

---

## Custom Checkout API

The checkout system lives at `src/api/checkout/` with custom controllers and services.

### Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/checkout/stripe` | Create Stripe checkout session |
| POST | `/api/checkout/stripe/webhook` | Handle Stripe webhooks |
| POST | `/api/checkout/paypal/create` | Create PayPal order |
| POST | `/api/checkout/paypal/capture` | Capture PayPal payment |
| POST | `/api/checkout/validate-coupon` | Validate a coupon code |

### Checkout Flow

```
1. Client sends cart items + shipping info
         ↓
2. Controller validates stock availability
         ↓
3. Service calculates totals (subtotal, tax, shipping, discount)
         ↓
4. Stripe/PayPal session created
         ↓
5. Client redirects to payment
         ↓
6. Payment webhook received
         ↓
7. Service creates Order + OrderItems
         ↓
8. Service decrements product stock
         ↓
9. Service increments coupon usedCount (if applicable)
```

### Checkout Service Methods

| Method | Purpose |
|--------|---------|
| `calculateOrderTotals()` | Compute subtotal, tax, shipping, discount |
| `createOrder()` | Create order record with items |
| `updateOrderStatus()` | Update order status (processing, shipped, etc.) |

---

## Reusable Components

Components are shared field groups used across content types.

| Component | Fields | Used In |
|-----------|--------|---------|
| `shared.seo` | metaTitle, metaDescription, ogImage, canonicalURL, noIndex | Product, Category, Homepage, all pages |
| `product.specification` | key, value | Product |
| `sections.hero` | title, subtitle, image, ctaText, ctaLink | Homepage |
| `sections.testimonial` | author, content, rating | Homepage |
| `sections.faq-item` | question, answer | FaqPage |
| `shipping.rate` | name, minWeight, maxWeight, price, estimatedDays | ShippingZone |

---

## Configuration Files

### `config/server.ts`
```typescript
host: env("HOST", "0.0.0.0"),
port: env.int("PORT", 1337),
```

### `config/database.ts`
- PostgreSQL connection with pool (min: 2, max: 10)
- Connection string from environment variables
- SSL configurable via `DATABASE_SSL`

### `config/middlewares.ts`
- CORS: `localhost:3000`, `localhost:1337`
- CSP: allows Cloudinary images
- Standard security headers

### `config/plugins.ts`
- **users-permissions**: JWT with 7-day expiry
- **email**: SendGrid provider

---

## Adding a New Content Type

1. **Create the schema** in `src/api/<name>/content-types/<name>/schema.json`
2. **Add lifecycle hooks** if needed in `src/api/<name>/content-types/<name>/lifecycles.ts`
3. **Create custom controller** (optional) in `src/api/<name>/controllers/<name>.ts`
4. **Create custom service** (optional) in `src/api/<name>/services/<name>.ts`
5. **Define routes** in `src/api/<name>/routes/<name>.ts`
6. **Restart Strapi** — it will auto-migrate the database

Example schema:
```json
{
  "kind": "collectionType",
  "collectionName": "tags",
  "info": {
    "singularName": "tag",
    "pluralName": "tags",
    "displayName": "Tag"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "slug": {
      "type": "uid",
      "targetField": "name"
    }
  }
}
```

---

## Useful Strapi CLI Commands

```bash
cd apps/backend

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Generate types
pnpm strapi ts:generate-types

# Create new API
pnpm strapi generate

# View all routes
pnpm strapi routes:list
```
