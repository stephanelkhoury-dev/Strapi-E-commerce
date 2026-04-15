#!/usr/bin/env bash
#
# seed.sh — Seed Strapi with sample data via the REST API
#
# Prerequisites:
#   - Strapi must be running (http://localhost:1337)
#   - Admin user must exist
#   - Public role must have create permissions
#
# Usage:
#   ./scripts/seed.sh
#
set -euo pipefail

STRAPI_URL="${STRAPI_URL:-http://localhost:1337}"

echo "========================================="
echo "  Seeding Sample Data"
echo "========================================="
echo ""

# Check Strapi is running
if ! curl -s "$STRAPI_URL/_health" >/dev/null 2>&1; then
  echo "✗ Strapi is not running at $STRAPI_URL"
  echo "  Start it with: ./scripts/start.sh backend"
  exit 1
fi
echo "✓ Strapi is running at $STRAPI_URL"
echo ""

# Prompt for admin credentials
echo "Enter Strapi admin credentials:"
read -r -p "  Email: " ADMIN_EMAIL
read -r -s -p "  Password: " ADMIN_PASSWORD
echo ""
echo ""

# Login
echo "▸ Authenticating..."
AUTH_RESPONSE=$(curl -s -X POST "$STRAPI_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

JWT=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$JWT" ]; then
  echo "  ✗ Authentication failed. Check your credentials."
  exit 1
fi
echo "  ✓ Authenticated"
echo ""

AUTH_HEADER="Authorization: Bearer $JWT"

# Create Categories
echo "▸ Creating categories..."
for cat in '{"name":"Electronics","slug":"electronics","description":"Phones, laptops, and gadgets","position":1}' \
           '{"name":"Clothing","slug":"clothing","description":"T-shirts, jeans, and more","position":2}' \
           '{"name":"Home & Garden","slug":"home-garden","description":"Furniture, decor, and tools","position":3}' \
           '{"name":"Sports","slug":"sports","description":"Equipment and activewear","position":4}'; do
  NAME=$(echo "$cat" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
  RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$STRAPI_URL/api/categories" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"data\":$cat}")
  if [ "$RESULT" = "200" ] || [ "$RESULT" = "201" ]; then
    echo "  ✓ Category: $NAME"
  else
    echo "  ○ Category: $NAME (may already exist)"
  fi
done
echo ""

# Create Brands
echo "▸ Creating brands..."
for brand in '{"name":"TechCorp","slug":"techcorp","description":"Leading technology company"}' \
             '{"name":"StyleHouse","slug":"stylehouse","description":"Modern fashion brand"}' \
             '{"name":"HomeLife","slug":"homelife","description":"Home essentials brand"}'; do
  NAME=$(echo "$brand" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
  RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$STRAPI_URL/api/brands" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"data\":$brand}")
  if [ "$RESULT" = "200" ] || [ "$RESULT" = "201" ]; then
    echo "  ✓ Brand: $NAME"
  else
    echo "  ○ Brand: $NAME (may already exist)"
  fi
done
echo ""

# Create Coupons
echo "▸ Creating coupons..."
for coupon in '{"code":"WELCOME10","type":"percentage","value":10,"minOrderAmount":50,"maxUses":100,"active":true}' \
              '{"code":"FLAT20","type":"fixed","value":20,"minOrderAmount":100,"maxUses":50,"active":true}'; do
  CODE=$(echo "$coupon" | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
  RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$STRAPI_URL/api/coupons" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"data\":$coupon}")
  if [ "$RESULT" = "200" ] || [ "$RESULT" = "201" ]; then
    echo "  ✓ Coupon: $CODE"
  else
    echo "  ○ Coupon: $CODE (may already exist)"
  fi
done
echo ""

# Create Global Settings
echo "▸ Creating global settings..."
RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$STRAPI_URL/api/global-setting" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "data": {
      "siteName": "ShopNow",
      "siteDescription": "Premium products at unbeatable prices",
      "currency": "USD",
      "currencySymbol": "$",
      "taxRate": 8.5,
      "contactEmail": "support@shopnow.com",
      "contactPhone": "+1 (555) 123-4567",
      "address": "123 Commerce St, New York, NY 10001"
    }
  }')
echo "  ✓ Global settings configured"
echo ""

echo "========================================="
echo "  ✓ Seeding complete!"
echo "========================================="
echo ""
echo "  Next: Add products with images via Strapi Admin"
echo "  → $STRAPI_URL/admin"
echo ""
