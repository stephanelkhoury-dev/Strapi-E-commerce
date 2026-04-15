# 🔧 Troubleshooting

## Common Issues

---

### 1. "Cannot connect to database"

**Symptoms:** Strapi fails to start, PostgreSQL connection errors.

**Solutions:**
```bash
# Check if Docker containers are running
docker compose ps

# If not running, start them
docker compose up -d

# Check PostgreSQL is accepting connections
docker exec -it postgres pg_isready -U strapi

# Reset database (destructive!)
docker compose down -v && docker compose up -d
```

---

### 2. "CORS error" in browser console

**Symptoms:** API calls fail with "Access-Control-Allow-Origin" errors.

**Solutions:**
1. Check `apps/backend/config/middlewares.ts`:
   ```typescript
   origin: ["http://localhost:3000", "https://your-domain.com"]
   ```
2. Restart Strapi after changing CORS config
3. Ensure the frontend URL matches exactly (no trailing slash)

---

### 3. "No Next.js version detected" on Vercel

**Symptoms:** Vercel deployment fails during build.

**Solutions:**
1. Ensure `package-lock.json` exists in `apps/frontend/`
   ```bash
   cd apps/frontend && npm install
   ```
2. Verify `next` is in `dependencies` in `apps/frontend/package.json`
3. Set Root Directory to `apps/frontend` in Vercel dashboard
4. Use `vercel.json`:
   ```json
   {
     "framework": "nextjs",
     "installCommand": "npm install",
     "buildCommand": "npm run build"
   }
   ```

---

### 4. Images not loading

**Symptoms:** Broken images, 403 errors from image URLs.

**Solutions:**
1. Check `next.config.ts` has correct remote patterns:
   ```typescript
   images: {
     remotePatterns: [
       { protocol: "http", hostname: "localhost", port: "1337" },
       { protocol: "https", hostname: "res.cloudinary.com" },
     ],
   }
   ```
2. For production, update with your Strapi domain
3. Restart Next.js dev server

---

### 5. "Module not found" for shared types

**Symptoms:** Import errors for `@/types` or `@/constants`.

**Solutions:**
- Types are inlined in `apps/frontend/src/types/index.ts`
- Constants are in `apps/frontend/src/constants/index.ts`
- Ensure `tsconfig.json` has the path alias:
  ```json
  { "paths": { "@/*": ["./src/*"] } }
  ```

---

### 6. Strapi Admin panel blank

**Symptoms:** Admin panel loads as a white screen.

**Solutions:**
```bash
cd apps/backend
rm -rf .cache .strapi node_modules
pnpm install
pnpm build
pnpm dev
```

---

### 7. "Port already in use"

**Solutions:**
```bash
# Find what's using the port
lsof -i :1337  # Strapi
lsof -i :3000  # Next.js
lsof -i :5432  # PostgreSQL

# Kill the process
kill -9 <PID>

# Or use the stop script
./scripts/stop.sh
```

---

### 8. pnpm workspace errors

**Symptoms:** `ERR_PNPM_NO_MATCHING_VERSION` or workspace resolution failures.

**Solutions:**
```bash
# Clean everything
pnpm store prune
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm pnpm-lock.yaml

# Reinstall
pnpm install
```

---

### 9. Tailwind CSS classes not applying

**Symptoms:** Styles missing or not updating.

**Solutions:**
1. Ensure you're using Tailwind v4 canonical class names:
   - `shrink-0` (not `flex-shrink-0`)
   - `bg-linear-to-r` (not `bg-gradient-to-r`)
   - `aspect-4/3` (not `aspect-[4/3]`)
2. Restart the dev server
3. Clear the `.next` cache:
   ```bash
   cd apps/frontend && rm -rf .next && pnpm dev
   ```

---

### 10. "revalidateTag" TypeScript error

**Symptoms:** "Expected 2 arguments, but got 1"

**Solution:** Next.js 16 changed the API:
```typescript
// Before (Next.js 15)
revalidateTag(tag);

// After (Next.js 16)
revalidateTag(tag, "default");
```

---

### 11. Checkout not working

**Symptoms:** Payment fails or order not created.

**Checklist:**
1. Verify Stripe keys are set in `.env`
2. Check webhook secret matches (`STRIPE_WEBHOOK_SECRET`)
3. Ensure products have stock > 0
4. Check Strapi console for error logs
5. Verify Stripe dashboard for failed events

---

### 12. Docker Compose stuck

```bash
# Force stop and remove all containers
docker compose down --remove-orphans

# Remove volumes (⚠️ destroys data)
docker compose down -v

# Rebuild
docker compose up -d --build
```

---

## Debugging Tips

### Backend Logs

```bash
# Watch Strapi logs
cd apps/backend && pnpm dev 2>&1 | tee /tmp/strapi.log

# Filter for errors
tail -f /tmp/strapi.log | grep -i error
```

### Frontend Logs

```bash
# Next.js build with verbose output
cd apps/frontend && npx next build --debug

# Check bundle analyzer
ANALYZE=true npx next build
```

### Database Queries

```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U strapi -d strapi_ecommerce

# Check tables
\dt

# Query products
SELECT id, name, slug, price, stock FROM products LIMIT 10;

# Check orders
SELECT order_number, status, total FROM orders ORDER BY created_at DESC LIMIT 5;
```

### Redis

```bash
# Connect to Redis
docker exec -it redis redis-cli

# Check all keys
KEYS *

# Monitor real-time commands
MONITOR
```

---

## Getting Help

1. Check this troubleshooting guide first
2. Search [Strapi Documentation](https://docs.strapi.io)
3. Search [Next.js Documentation](https://nextjs.org/docs)
4. Open an issue on [GitHub](https://github.com/stephanelkhoury-dev/Strapi-E-commerce/issues)
