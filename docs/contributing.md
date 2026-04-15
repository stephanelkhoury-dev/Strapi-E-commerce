# 🤝 Contributing Guide

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Strapi-E-commerce.git
   ```
3. Follow the [Getting Started](./getting-started.md) guide
4. Create a feature branch

---

## Branch Naming

```
feature/add-product-comparison
fix/cart-total-calculation
docs/update-api-reference
refactor/checkout-service
```

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add product comparison page
fix: correct cart total with coupons
docs: update API reference for checkout
refactor: simplify checkout service
style: update button hover colors
test: add cart store unit tests
chore: update dependencies
```

---

## Code Style

### TypeScript

- **Strict mode** enabled
- Use `interface` for object shapes, `type` for unions/intersections
- Avoid `any` — use `unknown` with type guards when needed
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### React / Next.js

- **Functional components** only (no class components)
- **Server Components** by default, add `"use client"` only when needed
- Export named components: `export function ProductCard() {}`
- Use `const` for arrow function handlers inside components

### Tailwind CSS

- Use Tailwind v4 canonical class names
- Mobile-first responsive design
- Extract repeated patterns into components, not CSS classes
- Avoid inline styles

### File Organization

- One component per file
- Colocate tests next to implementation
- Group by feature, not by type

---

## Pull Request Process

1. **Update your branch** with the latest `main`
2. **Run all checks:**
   ```bash
   pnpm lint
   pnpm build
   ```
3. **Write clear PR description:**
   - What changed and why
   - Screenshots for UI changes
   - Testing notes
4. **Request review** from maintainers
5. **Address feedback** — push fixes as new commits
6. **Squash merge** into `main`

### PR Template

```markdown
## What

Brief description of changes.

## Why

Reason for the change.

## How

Implementation approach.

## Testing

- [ ] Manual testing done
- [ ] Unit tests added/updated
- [ ] Lighthouse scores maintained
- [ ] Mobile responsive verified

## Screenshots

(if applicable)
```

---

## Project Structure Rules

- **Never commit** `.env` files, `node_modules`, or build artifacts
- **Always update** documentation when adding features
- **Keep dependencies** minimal — evaluate before adding
- **Frontend types** live in `apps/frontend/src/types/` (inlined for standalone deployment)

---

## Release Process

1. All changes merge to `main`
2. `main` auto-deploys to Vercel (frontend)
3. Backend requires manual deployment
4. Tag releases with semantic versioning: `v1.0.0`
