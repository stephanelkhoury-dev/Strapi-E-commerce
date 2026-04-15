# 🧪 Testing Guide

## Overview

| Layer | Framework | Location |
|-------|-----------|----------|
| **Frontend Unit** | Vitest + React Testing Library | `apps/frontend/__tests__/` |
| **Frontend E2E** | Playwright | `apps/frontend/e2e/` |
| **Backend Unit** | Jest | `apps/backend/__tests__/` |
| **API Integration** | Supertest | `apps/backend/__tests__/api/` |
| **Linting** | ESLint | All TypeScript files |
| **Type Checking** | TypeScript | All `.ts` / `.tsx` files |

---

## Quick Start

```bash
# Run all checks
./scripts/test.sh

# Run specific checks
./scripts/test.sh lint      # ESLint only
./scripts/test.sh types     # TypeScript type-check only
./scripts/test.sh frontend  # Frontend tests only
./scripts/test.sh backend   # Backend tests only
```

---

## Linting

```bash
# Lint everything (via Turbo)
pnpm lint

# Lint frontend only
cd apps/frontend && pnpm lint

# Lint with auto-fix
cd apps/frontend && npx eslint --fix .
```

### ESLint Configuration

- **Frontend:** `apps/frontend/eslint.config.mjs` — Next.js recommended rules
- **Backend:** Strapi default ESLint config

---

## Type Checking

```bash
# Type-check frontend
cd apps/frontend && npx tsc --noEmit

# Type-check backend
cd apps/backend && npx tsc --noEmit

# Type-check everything
pnpm build  # Build includes type checking
```

---

## Frontend Testing

### Setting Up Vitest

```bash
cd apps/frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './__tests__/setup.ts',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Example Component Test

```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product/ProductCard';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  slug: 'test-product',
  price: 29.99,
  images: [{ url: '/test.jpg', alternativeText: 'Test' }],
};

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('shows sale badge when compareAtPrice exists', () => {
    render(<ProductCard product={{ ...mockProduct, compareAtPrice: 39.99 }} />);
    expect(screen.getByText(/sale/i)).toBeInTheDocument();
  });
});
```

### Example Store Test

```typescript
// __tests__/stores/cart.test.ts
import { useCartStore } from '@/lib/store/cart';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('adds item to cart', () => {
    const { addItem } = useCartStore.getState();
    addItem({ id: 1, name: 'Test', price: 10, quantity: 1 });
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('calculates total correctly', () => {
    const { addItem } = useCartStore.getState();
    addItem({ id: 1, name: 'A', price: 10, quantity: 2 });
    addItem({ id: 2, name: 'B', price: 25, quantity: 1 });
    expect(useCartStore.getState().total).toBe(45);
  });
});
```

---

## E2E Testing with Playwright

### Setup

```bash
cd apps/frontend
npm install -D @playwright/test
npx playwright install
```

### Example E2E Test

```typescript
// e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';

test('can browse products and add to cart', async ({ page }) => {
  await page.goto('/');
  
  // Navigate to categories
  await page.click('text=Shop All');
  await expect(page).toHaveURL(/categories/);
  
  // Click a product
  await page.click('.product-card >> nth=0');
  await expect(page.locator('h1')).toBeVisible();
  
  // Add to cart
  await page.click('text=Add to Cart');
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
});
```

---

## API Testing

### Testing Strapi Endpoints

```bash
# Test product listing
curl http://localhost:1337/api/products?populate=* | jq '.data | length'

# Test single product
curl http://localhost:1337/api/products?filters[slug][$eq]=test-product | jq

# Test authentication
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@test.com","password":"Test123!"}' | jq

# Test coupon validation
curl -X POST http://localhost:1337/api/checkout/validate-coupon \
  -H "Content-Type: application/json" \
  -d '{"code":"SAVE10","subtotal":100}' | jq
```

---

## Testing Checklist

### Before Every PR

- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm build` succeeds (includes type checking)
- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Manual smoke test of affected pages

### Before Production Deploy

- [ ] All tests pass
- [ ] Lighthouse audit (Performance, Accessibility, SEO, Best Practices)
- [ ] Test on mobile viewport
- [ ] Test checkout flow end-to-end
- [ ] Verify revalidation webhook works
- [ ] Check error pages (404, error boundary)
