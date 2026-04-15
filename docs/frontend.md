# 🎨 Frontend Guide — Next.js 16

## Overview

The frontend is a **Next.js 16** application using the App Router, React 19, Tailwind CSS 4, and Zustand for state management. It connects to Strapi via REST API.

---

## Pages

### Public Pages

| Path | File | Rendering | Cache |
|------|------|-----------|-------|
| `/` | `app/page.tsx` | SSG + ISR | 1 min |
| `/categories` | `app/categories/page.tsx` | SSG + ISR | 1 hour |
| `/categories/[slug]` | `app/categories/[slug]/page.tsx` | SSG | generateStaticParams |
| `/products/[slug]` | `app/products/[slug]/page.tsx` | SSG | generateStaticParams |
| `/search` | `app/search/page.tsx` | Dynamic (SSR) | — |
| `/about` | `app/about/page.tsx` | SSG + ISR | 1 hour |
| `/contact` | `app/contact/page.tsx` | SSG + ISR | 1 hour |
| `/faq` | `app/faq/page.tsx` | SSG + ISR | 1 hour |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | SSG + ISR | 1 hour |
| `/terms-of-service` | `app/terms-of-service/page.tsx` | SSG + ISR | 1 hour |
| `/shipping-policy` | `app/shipping-policy/page.tsx` | SSG + ISR | 1 hour |
| `/return-policy` | `app/return-policy/page.tsx` | SSG + ISR | 1 hour |

### Cart & Checkout

| Path | File | Rendering |
|------|------|-----------|
| `/cart` | `app/cart/page.tsx` | Client-side |
| `/checkout` | `app/checkout/page.tsx` | Client-side |
| `/order/[orderNumber]` | `app/order/[orderNumber]/page.tsx` | Dynamic |

### Authentication

| Path | File |
|------|------|
| `/auth/login` | `app/auth/login/page.tsx` |
| `/auth/register` | `app/auth/register/page.tsx` |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` |

### Account (Protected)

| Path | File |
|------|------|
| `/account` | `app/account/page.tsx` |
| `/account/profile` | `app/account/profile/page.tsx` |
| `/account/orders` | `app/account/orders/page.tsx` |
| `/account/orders/[id]` | `app/account/orders/[id]/page.tsx` |
| `/account/addresses` | `app/account/addresses/page.tsx` |
| `/account/reviews` | `app/account/reviews/page.tsx` |
| `/account/wishlist` | `app/account/wishlist/page.tsx` |

### API Routes

| Path | Method | Purpose |
|------|--------|---------|
| `/api/revalidate` | POST | On-demand cache revalidation from Strapi webhooks |

---

## Components

### Layout Components (`components/layout/`)

| Component | Purpose |
|-----------|---------|
| `Header.tsx` | Navigation bar, logo, search, cart icon, user menu, mobile hamburger |
| `Footer.tsx` | Site links, social icons, newsletter signup, copyright |
| `Breadcrumbs.tsx` | Breadcrumb navigation trail |

### Product Components (`components/product/`)

| Component | Purpose |
|-----------|---------|
| `ProductCard.tsx` | Product card for listings (image, name, price, rating) |
| `ProductFilters.tsx` | Sidebar filters (category, price range, brand, rating) |
| `ProductGallery.tsx` | Image gallery with thumbnails and zoom |
| `ProductInfo.tsx` | Product details (price, variants, add to cart, shipping) |
| `ProductTabs.tsx` | Tabbed content (description, specifications, reviews) |

### Cart Components (`components/cart/`)

| Component | Purpose |
|-----------|---------|
| `CartDrawer.tsx` | Slide-out cart drawer with items, quantities, totals |

### UI Components (`components/ui/`)

| Component | Purpose |
|-----------|---------|
| `ContactForm.tsx` | Contact page form with validation |
| `FAQAccordion.tsx` | Expandable FAQ items |
| `NewsletterForm.tsx` | Email newsletter subscription form |
| `Toaster.tsx` | Toast notification system |

---

## Strapi API Client (`lib/strapi.ts`)

The API client provides typed functions for all Strapi interactions:

```typescript
// Fetch products with filters
const products = await getProducts({ 
  category: "electronics",
  sort: "price:asc",
  page: 1,
  pageSize: 12 
});

// Fetch single product
const product = await getProduct("iphone-15");

// Fetch categories
const categories = await getCategories();

// Fetch homepage data
const homepage = await getHomepage();
```

### Key Features
- Type-safe API calls with TypeScript interfaces
- Automatic query parameter building for Strapi's REST API
- Population of relations and components
- Error handling

---

## State Management

### Cart Store (`lib/store/cart.ts`)

```typescript
const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();
```

| Method | Description |
|--------|-------------|
| `addItem(product, quantity, variant?)` | Add item to cart |
| `removeItem(id)` | Remove item from cart |
| `updateQuantity(id, quantity)` | Update item quantity |
| `clearCart()` | Empty the cart |
| `total` | Computed cart total |

- Persisted to `localStorage` via Zustand middleware
- Hydration-safe (avoids SSR/client mismatch)

### Auth Store (`lib/store/auth.ts`)

```typescript
const { user, token, login, logout, register, isAuthenticated } = useAuthStore();
```

| Method | Description |
|--------|-------------|
| `login(email, password)` | Authenticate user |
| `logout()` | Clear auth state |
| `register(data)` | Create new account |
| `isAuthenticated` | Boolean check |

- JWT stored in localStorage
- Token included in API requests automatically

---

## Styling

### Tailwind CSS 4

- Configuration via `postcss.config.mjs` (PostCSS plugin)
- Global styles in `app/globals.css`
- Color palette: Primary (indigo), neutral grays
- Dark mode support via `next-themes`

### CSS Conventions

```tsx
// Use canonical Tailwind v4 classes
className="shrink-0"          // ✅ Not flex-shrink-0
className="bg-linear-to-r"   // ✅ Not bg-gradient-to-r
className="aspect-4/3"        // ✅ Not aspect-[4/3]
className="z-60"              // ✅ Not z-[60]
className="min-w-8"           // ✅ Not min-w-[2rem]
```

### Responsive Design

```tsx
// Mobile-first approach
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px)

---

## TypeScript Types (`types/index.ts`)

All shared types are defined in `src/types/index.ts`:

```typescript
interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: StrapiMedia[];
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  // ... more fields
}

interface Category { ... }
interface Order { ... }
interface CartItem { ... }
interface User { ... }
// ... see types/index.ts for full definitions
```

---

## Constants (`constants/index.ts`)

```typescript
export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
export const ITEMS_PER_PAGE = 12;
export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";
// ... more constants
```

---

## SEO

Every page includes:
- `metadata` export with title, description, OpenGraph
- Structured data (JSON-LD) where applicable
- Canonical URLs
- `next-sitemap` auto-generation

```typescript
// Example in page.tsx
export const metadata: Metadata = {
  title: "Shop Electronics | ShopNow",
  description: "Browse our collection of premium electronics",
  openGraph: {
    title: "Shop Electronics",
    images: ["/images/og-electronics.jpg"],
  },
};
```

---

## Image Optimization

- Next.js `<Image>` component for automatic optimization
- WebP/AVIF format auto-negotiation
- Remote patterns configured for localhost:1337 and Cloudinary
- `sharp` installed for server-side processing

---

## Adding a New Page

1. Create `src/app/your-page/page.tsx`
2. Export `metadata` for SEO
3. Fetch data from Strapi using `lib/strapi.ts`
4. Add navigation link in `Header.tsx` or `Footer.tsx`
5. Update `next-sitemap.config.js` if excluded

```tsx
// src/app/your-page/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Page | ShopNow",
  description: "Description for SEO",
};

export default async function YourPage() {
  const data = await fetchFromStrapi("/api/your-content");
  
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{data.title}</h1>
    </main>
  );
}
```
