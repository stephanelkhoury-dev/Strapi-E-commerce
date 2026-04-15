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
for cat in '{"name":"Dresses","slug":"dresses","description":"Elegant dresses for every occasion","position":1}' \
           '{"name":"Tops","slug":"tops","description":"Stylish tops, bodysuits, and corsets","position":2}' \
           '{"name":"Bottoms","slug":"bottoms","description":"Jeans, pants, skirts, and leggings","position":3}' \
           '{"name":"Co-ords","slug":"co-ords","description":"Matching sets and co-ord outfits","position":4}'; do
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
for brand in '{"name":"Chic Clique","slug":"chic-clique","description":"Leading online fashion brand designed and produced in Lebanon"}'; do
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
for coupon in '{"code":"CC10","type":"percentage","value":10,"minOrderAmount":0,"maxUses":10000,"active":true}'; do
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
      "siteName": "Chic Clique",
      "siteDescription": "Leading online fashion & clothing brand designed and produced in Lebanon",
      "currency": "USD",
      "currencySymbol": "$",
      "taxRate": 0,
      "contactEmail": "info@chiccliquestore.com",
      "contactPhone": "+961",
      "address": "Lebanon"
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
