# 🗃️ Database Schema

## Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Category   │     │    Brand     │     │   Product    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ name         │     │ name         │     │ name         │
│ slug         │◄────│ slug         │     │ slug         │
│ description  │  1  │ logo         │  1  │ description  │
│ image        │  │  │ description  │  │  │ price        │
│ parent_id ───┤──┘  │ products ────┤──┘  │ compareAt    │
│ position     │     └──────────────┘     │ sku          │
│ seo          │                          │ stock        │
└──────┬───────┘                          │ featured     │
       │ 1:N                              │ images       │
       │                                  │ category_id ─┤─→ Category
       └──────────────────────────────────│ brand_id ────┤─→ Brand
                                          │ seo          │
                                          └──────┬───────┘
                                                 │
                          ┌──────────────────────┼──────────────────────┐
                          │ 1:N                  │ 1:N                  │ 1:N
                          ▼                      ▼                      ▼
                 ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                 │ProductVariant│     │    Review     │     │  OrderItem   │
                 ├──────────────┤     ├──────────────┤     ├──────────────┤
                 │ id           │     │ id           │     │ id           │
                 │ name         │     │ rating (1-5) │     │ quantity     │
                 │ sku          │     │ title        │     │ unitPrice    │
                 │ price        │     │ body         │     │ total        │
                 │ stock        │     │ approved     │     │ productName  │
                 │ attributes   │     │ product_id ──┤──┐  │ product_id   │
                 │ image        │     │ author_id ───┤  │  │ variant_id   │
                 │ product_id   │     └──────────────┘  │  │ order_id ────┤──┐
                 └──────────────┘                       │  └──────────────┘  │
                                                        │                    │
                          ┌─────────────────────────────┘                    │
                          │                                                  │
                          ▼                                                  ▼
                 ┌──────────────┐                               ┌──────────────┐
                 │     User     │                               │    Order     │
                 ├──────────────┤                               ├──────────────┤
                 │ id           │    ┌──────────────┐           │ id           │
                 │ username     │    │   Address     │           │ orderNumber  │
                 │ email        │    ├──────────────┤           │ status       │
                 │ password     │    │ firstName     │           │ total        │
                 │              │◄───│ user_id       │           │ subtotal     │
                 │              │    │ street        │           │ tax          │
                 │              │    │ city / state  │           │ shippingCost │
                 │              │    │ zip / country │           │ discount     │
                 │              │    │ isDefault     │           │ customer_id ─┤─→ User
                 │              │    └──────────────┘           │ coupon_id ───┤─→ Coupon
                 └──────┬───────┘                               │ paymentMethod│
                        │                                       │ paymentId    │
                        │ 1:1                                   │ tracking#    │
                        ▼                                       └──────────────┘
                 ┌──────────────┐
                 │   Wishlist   │
                 ├──────────────┤     ┌──────────────┐
                 │ id           │     │    Coupon     │
                 │ user_id      │     ├──────────────┤
                 │ products ────┤     │ id           │
                 │  (M:N)       │     │ code         │
                 └──────────────┘     │ type         │
                                      │ value        │
                                      │ minOrder     │
                                      │ maxUses      │
                                      │ usedCount    │
                                      │ startDate    │
                                      │ endDate      │
                                      │ active       │
                                      └──────────────┘
```

---

## Tables Reference

### products

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | serial | PK | Auto-increment ID |
| document_id | varchar | unique | Strapi document ID |
| name | varchar(255) | not null, min 2 | Product name |
| slug | varchar(255) | unique | URL-friendly name |
| description | text | — | Rich text description |
| short_description | text | max 500 | Brief description |
| price | decimal(10,2) | not null, >= 0 | Current price |
| compare_at_price | decimal(10,2) | >= 0 | Original price (for sale display) |
| sku | varchar(255) | unique | Stock keeping unit |
| barcode | varchar(255) | — | Product barcode |
| stock | integer | default 0, >= 0 | Available quantity |
| is_digital | boolean | default false | Digital product flag |
| digital_file_url | varchar | — | Download URL for digital products |
| weight | decimal | — | Product weight |
| dimensions | jsonb | — | `{ width, height, depth }` |
| featured | boolean | default false | Featured product flag |
| average_rating | decimal(3,2) | default 0 | Computed average review rating |
| review_count | integer | default 0 | Total approved reviews |
| category_id | integer | FK → categories | Product category |
| brand_id | integer | FK → brands | Product brand |
| published_at | timestamp | — | Publish date (draft/publish) |
| created_at | timestamp | auto | Creation timestamp |
| updated_at | timestamp | auto | Last update timestamp |

### categories

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | serial | PK | Auto-increment ID |
| name | varchar(255) | not null | Category name |
| slug | varchar(255) | unique | URL slug |
| description | text | — | Category description |
| parent_id | integer | FK → categories (self) | Parent category for hierarchy |
| position | integer | default 0 | Display order |
| published_at | timestamp | — | Publish date |

### orders

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | serial | PK | Auto-increment ID |
| order_number | varchar(255) | unique | Format: ORD-YYYYMMDD-XXXXXX |
| status | enum | not null | pending, processing, shipped, delivered, cancelled, refunded |
| total | decimal(10,2) | not null | Final total amount |
| subtotal | decimal(10,2) | not null | Before tax and shipping |
| tax | decimal(10,2) | default 0 | Tax amount |
| shipping_cost | decimal(10,2) | default 0 | Shipping fee |
| discount | decimal(10,2) | default 0 | Discount amount |
| shipping_address | jsonb | — | `{ firstName, lastName, street, city, state, zip, country }` |
| billing_address | jsonb | — | Same structure as shipping |
| payment_method | enum | — | stripe, paypal |
| payment_intent_id | varchar | — | Stripe/PayPal transaction ID |
| customer_email | varchar | — | Order email |
| customer_name | varchar | — | Order name |
| customer_id | integer | FK → users | Registered user (optional) |
| coupon_id | integer | FK → coupons | Applied coupon |
| notes | text | — | Order notes |
| tracking_number | varchar | — | Shipping tracking number |

### order_items

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | serial | PK | Auto-increment ID |
| quantity | integer | not null, >= 1 | Item quantity |
| unit_price | decimal(10,2) | not null | Price per unit at time of order |
| total | decimal(10,2) | not null | quantity × unit_price |
| product_name | varchar | not null | Snapshot of product name |
| product_slug | varchar | — | For linking back |
| variant_name | varchar | — | Variant description |
| sku | varchar | — | SKU at time of order |
| product_id | integer | FK → products | Source product |
| variant_id | integer | FK → product_variants | Source variant |
| order_id | integer | FK → orders | Parent order |

### coupons

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | serial | PK | Auto-increment ID |
| code | varchar(255) | unique, not null | Coupon code (e.g., SAVE10) |
| type | enum | not null | percentage, fixed |
| value | decimal(10,2) | not null | Discount value |
| min_order_amount | decimal(10,2) | — | Minimum order to apply |
| max_uses | integer | — | Maximum total uses |
| used_count | integer | default 0 | Current use count |
| start_date | datetime | — | Activation date |
| end_date | datetime | — | Expiration date |
| active | boolean | default true | Enabled/disabled |

### reviews

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | serial | PK | Auto-increment ID |
| rating | integer | 1-5 | Star rating |
| title | varchar | — | Review title |
| body | text | — | Review content |
| approved | boolean | default false | Admin approval flag |
| product_id | integer | FK → products | Reviewed product |
| author_id | integer | FK → users | Review author |

### addresses

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | serial | PK | Auto-increment ID |
| first_name | varchar | required | First name |
| last_name | varchar | required | Last name |
| street | varchar | required | Street address |
| city | varchar | required | City |
| state | varchar | required | State/province |
| zip | varchar | required | Postal code |
| country | varchar | required | Country code |
| phone | varchar | — | Phone number |
| is_default | boolean | default false | Default address flag |
| user_id | integer | FK → users | Address owner |

---

## Relationships Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| Category → Products | One-to-Many | A category has many products |
| Category → Category | Self-referential | Parent-child categories |
| Brand → Products | One-to-Many | A brand has many products |
| Product → Variants | One-to-Many | A product has many variants |
| Product → Reviews | One-to-Many | A product has many reviews |
| User → Reviews | One-to-Many | A user writes many reviews |
| User → Orders | One-to-Many | A user has many orders |
| User → Addresses | One-to-Many | A user has many addresses |
| User → Wishlist | One-to-One | A user has one wishlist |
| Wishlist → Products | Many-to-Many | Wishlist contains many products |
| Order → OrderItems | One-to-Many | An order has many line items |
| Order → Coupon | Many-to-One | An order uses one coupon |
| Coupon → Orders | One-to-Many | A coupon is used in many orders |

---

## Indexes

The following indexes are automatically created by Strapi:

- `products_slug_unique` — Unique slug for products
- `categories_slug_unique` — Unique slug for categories
- `brands_name_unique` — Unique brand name
- `coupons_code_unique` — Unique coupon code
- `orders_order_number_unique` — Unique order number
- `product_variants_sku_unique` — Unique variant SKU
- `newsletter_subscribers_email_unique` — Unique subscriber email
