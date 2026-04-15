# 📡 API Reference

## Base URL

- **Development:** `http://localhost:1337`
- **Production:** Your deployed Strapi URL

All endpoints are prefixed with `/api/`.

---

## Authentication

### Register

```http
POST /api/auth/local/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Login

```http
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "SecurePass123!"
}
```

### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Authenticated Requests

```http
GET /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Products

### List Products

```http
GET /api/products?populate=*&pagination[page]=1&pagination[pageSize]=12&sort=createdAt:desc
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `populate` | string | Relations to include (`*`, `images,category,brand`) |
| `filters[category][slug][$eq]` | string | Filter by category slug |
| `filters[featured][$eq]` | boolean | Only featured products |
| `filters[price][$gte]` | number | Minimum price |
| `filters[price][$lte]` | number | Maximum price |
| `filters[name][$containsi]` | string | Search by name (case-insensitive) |
| `sort` | string | Sort field (`price:asc`, `createdAt:desc`, `name:asc`) |
| `pagination[page]` | number | Page number (1-based) |
| `pagination[pageSize]` | number | Items per page (default: 25) |

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "<p>Rich text description...</p>",
      "shortDescription": "Latest iPhone with A17 Pro chip",
      "price": 999.99,
      "compareAtPrice": 1099.99,
      "sku": "IPHONE15PRO-128",
      "stock": 50,
      "featured": true,
      "averageRating": 4.5,
      "reviewCount": 12,
      "images": [
        {
          "url": "/uploads/iphone15pro_abc123.jpg",
          "alternativeText": "iPhone 15 Pro",
          "width": 1200,
          "height": 1200
        }
      ],
      "category": { "id": 1, "name": "Electronics", "slug": "electronics" },
      "brand": { "id": 1, "name": "Apple", "slug": "apple" },
      "specifications": [
        { "key": "Chip", "value": "A17 Pro" },
        { "key": "Storage", "value": "128GB" }
      ],
      "seo": {
        "metaTitle": "iPhone 15 Pro | ShopNow",
        "metaDescription": "Buy the latest iPhone 15 Pro"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "pageCount": 5,
      "total": 58
    }
  }
}
```

### Get Single Product

```http
GET /api/products?filters[slug][$eq]=iphone-15-pro&populate=images,category,brand,variants,reviews,specifications,seo
```

---

## Categories

### List Categories

```http
GET /api/categories?populate=image,seo&sort=position:asc
```

### Get Category with Products

```http
GET /api/categories?filters[slug][$eq]=electronics&populate=image,products.images,seo
```

---

## Brands

### List Brands

```http
GET /api/brands?populate=logo&sort=name:asc
```

---

## Reviews

### List Reviews for Product

```http
GET /api/reviews?filters[product][slug][$eq]=iphone-15-pro&filters[approved][$eq]=true&populate=author&sort=createdAt:desc
```

### Create Review (Authenticated)

```http
POST /api/reviews
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "data": {
    "rating": 5,
    "title": "Amazing product!",
    "body": "Best phone I've ever had.",
    "product": 1
  }
}
```

---

## Orders (Authenticated)

### List User Orders

```http
GET /api/orders?populate=items&sort=createdAt:desc
Authorization: Bearer <jwt>
```

### Get Order by Number

```http
GET /api/orders?filters[orderNumber][$eq]=ORD-20240115-ABC123&populate=items
Authorization: Bearer <jwt>
```

---

## Checkout

### Create Stripe Session

```http
POST /api/checkout/stripe
Content-Type: application/json

{
  "items": [
    { "productId": 1, "quantity": 2, "variantId": null }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "couponCode": "SAVE10"
}
```

**Response (200):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Validate Coupon

```http
POST /api/checkout/validate-coupon
Content-Type: application/json

{
  "code": "SAVE10",
  "subtotal": 199.99
}
```

**Response (200):**
```json
{
  "valid": true,
  "type": "percentage",
  "value": 10,
  "discount": 19.99
}
```

**Response (400):**
```json
{
  "valid": false,
  "error": "Coupon has expired"
}
```

---

## Single Types

### Homepage

```http
GET /api/homepage?populate=hero.image,featuredProducts,banners,testimonials,seo
```

### Global Settings

```http
GET /api/global-setting?populate=logo,favicon,defaultSeo
```

### About Page

```http
GET /api/about-page?populate=image,seo
```

### Contact Page

```http
GET /api/contact-page?populate=seo
```

### FAQ Page

```http
GET /api/faq-page?populate=items,seo
```

### Legal Pages

```http
GET /api/legal-page?populate=seo
```

---

## Addresses (Authenticated)

### List Addresses

```http
GET /api/addresses?filters[user][id][$eq]=1
Authorization: Bearer <jwt>
```

### Create Address

```http
POST /api/addresses
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US",
    "phone": "+1234567890",
    "isDefault": true
  }
}
```

---

## Wishlist (Authenticated)

### Get Wishlist

```http
GET /api/wishlists?filters[user][id][$eq]=1&populate=products.images
Authorization: Bearer <jwt>
```

---

## Newsletter

### Subscribe

```http
POST /api/newsletter-subscribers
Content-Type: application/json

{
  "data": {
    "email": "subscriber@example.com"
  }
}
```

---

## Cache Revalidation (Next.js API Route)

### Trigger Revalidation

```http
POST https://your-frontend.vercel.app/api/revalidate
x-revalidation-secret: your-secret
Content-Type: application/json

{
  "model": "product",
  "entry": {
    "slug": "iphone-15-pro"
  }
}
```

---

## Error Responses

```json
{
  "data": null,
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Missing required fields",
    "details": {
      "errors": [
        {
          "path": ["name"],
          "message": "name is a required field"
        }
      ]
    }
  }
}
```

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing or invalid JWT) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 500 | Internal server error |
