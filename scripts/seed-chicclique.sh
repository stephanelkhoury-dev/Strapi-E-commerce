#!/usr/bin/env bash
#
# seed-chicclique.sh — Seed Strapi with Chic Clique store data
#
# Prerequisites:
#   - Strapi must be running (http://localhost:1337)
#   - Admin user must exist
#
# Usage:
#   ./scripts/seed-chicclique.sh
#
set -euo pipefail

STRAPI_URL="${STRAPI_URL:-http://localhost:1337}"

echo "========================================="
echo "  Seeding Chic Clique Store Data"
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

# Helper: create entry and return documentId
create_entry() {
  local endpoint="$1"
  local data="$2"
  local response
  response=$(curl -s -X POST "$STRAPI_URL/api/$endpoint" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"data\":$data}")
  echo "$response" | grep -o '"documentId":"[^"]*"' | head -1 | cut -d'"' -f4
}

# Helper: update single type
update_single() {
  local endpoint="$1"
  local data="$2"
  curl -s -o /dev/null -w "%{http_code}" -X PUT "$STRAPI_URL/api/$endpoint" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"data\":$data}"
}

###############################################################################
# 1. BRAND
###############################################################################
echo "▸ Creating brand..."
BRAND_ID=$(create_entry "brands" '{
  "name": "Chic Clique",
  "slug": "chic-clique",
  "description": "Chic Clique is a leading online fashion and clothing brand designed and produced in Lebanon. Our mission is to provide for all sizes, shapes, and styles with supreme quality at the best prices."
}')
if [ -n "$BRAND_ID" ]; then
  echo "  ✓ Brand: Chic Clique ($BRAND_ID)"
else
  echo "  ○ Brand: Chic Clique (may already exist)"
fi
echo ""

###############################################################################
# 2. CATEGORIES
###############################################################################
echo "▸ Creating categories..."

# Main categories
CAT_DRESSES_ID=$(create_entry "categories" '{
  "name": "Dresses",
  "slug": "dresses",
  "description": "Elegant dresses for every occasion — party, casual, and formal styles designed and produced in Lebanon.",
  "position": 1
}')
echo "  ✓ Category: Dresses"

CAT_TOPS_ID=$(create_entry "categories" '{
  "name": "Tops",
  "slug": "tops",
  "description": "Stylish tops, bodysuits, corsets, and shirts. From casual basics to statement pieces.",
  "position": 2
}')
echo "  ✓ Category: Tops"

CAT_BOTTOMS_ID=$(create_entry "categories" '{
  "name": "Bottoms",
  "slug": "bottoms",
  "description": "Jeans, pants, skirts, shorts, and leggings for every style and occasion.",
  "position": 3
}')
echo "  ✓ Category: Bottoms"

CAT_COORDS_ID=$(create_entry "categories" '{
  "name": "Co-ords",
  "slug": "co-ords",
  "description": "Matching sets and co-ord outfits — effortless style in one purchase.",
  "position": 4
}')
echo "  ✓ Category: Co-ords"

CAT_OUTERWEAR_ID=$(create_entry "categories" '{
  "name": "Outerwear",
  "slug": "outerwear",
  "description": "Jackets, blazers, coats, and trench coats for layered looks.",
  "position": 5
}')
echo "  ✓ Category: Outerwear"

CAT_SPORTSWEAR_ID=$(create_entry "categories" '{
  "name": "Sportswear",
  "slug": "sportswear",
  "description": "Activewear sets, sports bras, leggings, and tracksuits for your workout style.",
  "position": 6
}')
echo "  ✓ Category: Sportswear"

CAT_SWIMWEAR_ID=$(create_entry "categories" '{
  "name": "Swimwear",
  "slug": "swimwear",
  "description": "Bikinis and swimsuits for the beach and pool.",
  "position": 7
}')
echo "  ✓ Category: Swimwear"

CAT_ACCESSORIES_ID=$(create_entry "categories" '{
  "name": "Accessories",
  "slug": "accessories",
  "description": "Essentials and accessories — tights, tapes, adhesive bras, and more.",
  "position": 8
}')
echo "  ✓ Category: Accessories"

CAT_SALE_ID=$(create_entry "categories" '{
  "name": "Sale",
  "slug": "sale",
  "description": "Discounted items — grab them before they are gone!",
  "position": 9
}')
echo "  ✓ Category: Sale"

CAT_ABAYAS_ID=$(create_entry "categories" '{
  "name": "Abayas",
  "slug": "abayas",
  "description": "Elegant abayas with modern designs — golden, glitter, and classic styles.",
  "position": 10
}')
echo "  ✓ Category: Abayas"
echo ""

###############################################################################
# 3. COUPON
###############################################################################
echo "▸ Creating coupons..."
create_entry "coupons" '{
  "code": "CC10",
  "type": "percentage",
  "value": 10,
  "minOrderAmount": 0,
  "maxUses": 10000,
  "active": true
}' >/dev/null
echo "  ✓ Coupon: CC10 (10% off first order)"
echo ""

###############################################################################
# 4. PRODUCTS
###############################################################################
echo "▸ Creating products..."

# --- DRESSES ---
create_product() {
  local name="$1" slug="$2" price="$3" compare="$4" cat_id="$5" desc="$6" featured="$7" stock="$8"
  local cat_field=""
  if [ -n "$cat_id" ]; then
    cat_field="\"category\": \"$cat_id\","
  fi
  local compare_field=""
  if [ -n "$compare" ] && [ "$compare" != "0" ]; then
    compare_field="\"compareAtPrice\": $compare,"
  fi
  local brand_field=""
  if [ -n "$BRAND_ID" ]; then
    brand_field="\"brand\": \"$BRAND_ID\","
  fi

  local data="{
    \"name\": \"$name\",
    \"slug\": \"$slug\",
    \"price\": $price,
    $compare_field
    \"shortDescription\": \"$desc\",
    \"description\": \"$desc\",
    \"stock\": $stock,
    \"featured\": $featured,
    \"sku\": \"CC-${slug}\",
    $cat_field
    $brand_field
    \"averageRating\": 4.5,
    \"reviewCount\": 0
  }"

  local result
  result=$(create_entry "products" "$data")
  if [ -n "$result" ]; then
    echo "  ✓ $name (\$$price)"
  else
    echo "  ○ $name (may already exist)"
  fi
}

echo ""
echo "  --- Dresses ---"
create_product "Bandeau Dress" "bandeau-dress" 39 0 "$CAT_DRESSES_ID" "Elegant bandeau dress, available in multiple colors. Designed and produced in Lebanon." true 50
create_product "Plunge Dress With Shorts" "plunge-dress-with-shorts" 55 0 "$CAT_DRESSES_ID" "Stylish plunge dress with built-in shorts for comfort and confidence." true 30
create_product "Bubble Dress With Shorts" "bubble-dress-with-shorts" 55 0 "$CAT_DRESSES_ID" "Trendy bubble dress with shorts lining. Perfect for a night out." false 25
create_product "Bubble Shirt Dress With Shorts" "bubble-shirt-dress-with-shorts" 59 0 "$CAT_DRESSES_ID" "Chic bubble shirt dress with shorts combo. A statement piece." false 20
create_product "Noelle Dress" "noelle-dress" 65 0 "$CAT_DRESSES_ID" "The Noelle dress — elegant and sophisticated for any occasion." true 15
create_product "Tiara Dress" "tiara-dress" 39 0 "$CAT_DRESSES_ID" "The Tiara dress combines comfort with style. Perfect for day or evening." false 30
create_product "Yulia Lace Dress" "yulia-lace-dress" 59 0 "$CAT_DRESSES_ID" "Beautiful lace detailing on the Yulia dress. Romantic and feminine." true 20
create_product "Hannah Dress" "hannah-dress" 45 0 "$CAT_DRESSES_ID" "The Hannah dress — classic silhouette with a modern twist." false 25
create_product "Camela Dress" "camela-dress" 55 0 "$CAT_DRESSES_ID" "The Camela dress features a flattering cut and premium fabric." false 20
create_product "Glitter Dress" "glitter-dress" 49 0 "$CAT_DRESSES_ID" "Sparkle and shine in the Glitter dress. Perfect for parties and events." true 30
create_product "Mesh Dress" "mesh-dress" 39 0 "$CAT_DRESSES_ID" "The Mesh dress offers a daring look with elegant mesh detailing." false 20
create_product "Backless Glitter Dress" "backless-glitter-dress" 45 0 "$CAT_DRESSES_ID" "A stunning backless glitter dress that turns heads." false 15
create_product "Everly Dress" "everly-dress" 36 45 "$CAT_DRESSES_ID" "The Everly dress — a beautiful design now at a special price." false 20
create_product "Britney Dress" "britney-dress" 55 0 "$CAT_DRESSES_ID" "The Britney dress — bold and confident for the modern woman." false 20
create_product "Leopard Dress" "leopard-dress" 29 0 "$CAT_DRESSES_ID" "Wild and stylish leopard print dress for a bold fashion statement." false 25
create_product "Starlyn Dress" "starlyn-dress" 45 0 "$CAT_DRESSES_ID" "The Starlyn dress — dreamy silhouette with premium details." false 20
create_product "Aurelya Dress" "aurelya-dress" 45 0 "$CAT_DRESSES_ID" "The Aurelya dress — elegant and timeless for special occasions." false 15
create_product "Yoanna Dress" "yoanna-dress" 29 0 "$CAT_DRESSES_ID" "The Yoanna dress — effortless style at an amazing price." false 25

echo ""
echo "  --- Tops ---"
create_product "Plunge Bodysuit" "plunge-bodysuit" 21 0 "$CAT_TOPS_ID" "Flattering plunge bodysuit in multiple colors. A wardrobe essential." true 60
create_product "Emily Corset" "emily-corset" 29 0 "$CAT_TOPS_ID" "The Emily corset — structured and flattering for any body type." true 40
create_product "Kelly Corset" "kelly-corset" 39 0 "$CAT_TOPS_ID" "The Kelly corset offers a bold look with premium construction." false 25
create_product "Cut Out Bodysuit" "cut-out-bodysuit" 29 0 "$CAT_TOPS_ID" "Trendy cut-out bodysuit — daring and stylish." false 30
create_product "Backless Bodysuit" "backless-bodysuit" 25 0 "$CAT_TOPS_ID" "Backless bodysuit for a sleek and modern look." false 35
create_product "Lia Top" "lia-top" 21 0 "$CAT_TOPS_ID" "The Lia top — simple, chic, and versatile." false 40
create_product "Asha Sequin Bodysuit" "asha-sequin-bodysuit" 38 0 "$CAT_TOPS_ID" "Sparkle with the Asha sequin bodysuit. Perfect for parties." false 20
create_product "Leather Corset" "leather-corset" 45 0 "$CAT_TOPS_ID" "Premium leather corset — edgy and sophisticated." true 25
create_product "Leather Corset With Zipper" "leather-corset-with-zipper" 39 0 "$CAT_TOPS_ID" "Leather corset with zipper detail — bold fashion statement." false 20
create_product "Basic Top" "basic-top" 19 0 "$CAT_TOPS_ID" "Essential basic top available in multiple colors. A must-have staple." false 80
create_product "Mesh Bodysuit" "mesh-bodysuit" 25 0 "$CAT_TOPS_ID" "Sheer mesh bodysuit — perfect layering piece." false 25
create_product "Corset Shirt" "corset-shirt" 35 0 "$CAT_TOPS_ID" "Structured corset shirt — sophisticated and trendy." false 30
create_product "Rhinestone Top" "rhinestone-top" 25 0 "$CAT_TOPS_ID" "Sparkling rhinestone top for glamorous occasions." false 30
create_product "Tiana Bodysuit" "tiana-bodysuit" 39 0 "$CAT_TOPS_ID" "The Tiana bodysuit — elegant with premium fit." false 20
create_product "Cut Out Top" "cut-out-top" 29 0 "$CAT_TOPS_ID" "Stylish cut-out top — bold and fashion-forward." false 25
create_product "Ashley Bodysuit" "ashley-bodysuit" 28 0 "$CAT_TOPS_ID" "The Ashley bodysuit — comfortable yet stylish." false 30
create_product "Twist Front Top" "twist-front-top" 25 0 "$CAT_TOPS_ID" "Twist front detailing for a unique look." false 25
create_product "Velvet And Lace Top" "velvet-and-lace-top" 45 0 "$CAT_TOPS_ID" "Luxurious velvet and lace combination top." false 15
create_product "Angelina Top" "angelina-top" 35 0 "$CAT_TOPS_ID" "The Angelina top — feminine and flattering." false 20
create_product "Ruffle Top" "ruffle-top" 33 0 "$CAT_TOPS_ID" "Playful ruffle detailing on this chic top." false 25
create_product "Malu Top" "malu-top" 38 0 "$CAT_TOPS_ID" "The Malu top — versatile and stylish for any occasion." false 20
create_product "Milie Top" "milie-top" 35 0 "$CAT_TOPS_ID" "The Milie top — elegant with a modern edge." false 20
create_product "Plunge Basic Top" "plunge-basic-top" 14 19 "$CAT_TOPS_ID" "Everyday plunge basic top at a special price." false 50
create_product "Priscilla Bodysuit" "priscilla-bodysuit" 23 29 "$CAT_TOPS_ID" "The Priscilla bodysuit — sleek and chic." false 25
create_product "Bettina Top" "bettina-top" 25 0 "$CAT_TOPS_ID" "The Bettina top — fresh and stylish for spring/summer." false 30
create_product "Short Sleeve Top" "short-sleeve-top" 15 0 "$CAT_TOPS_ID" "Classic short sleeve top in multiple colors." false 60
create_product "Ribbed Tank Top" "ribbed-tank-top" 18 0 "$CAT_TOPS_ID" "Essential ribbed tank top — soft and comfortable." false 50
create_product "Emma Top" "emma-top" 25 0 "$CAT_TOPS_ID" "The Emma top — timeless and versatile." false 30
create_product "Satin Top" "satin-top" 29 0 "$CAT_TOPS_ID" "Luxurious satin top with a smooth finish." false 25
create_product "Plunge Top" "plunge-top" 19 0 "$CAT_TOPS_ID" "Classic plunge top for everyday styling." false 35
create_product "Crochet Top" "crochet-top" 19 0 "$CAT_TOPS_ID" "Handcrafted-look crochet top — bohemian chic." false 20
create_product "Cut Out Ring Top" "cut-out-ring-top" 22 0 "$CAT_TOPS_ID" "Modern cut-out ring detail top." false 25
create_product "Wrap Sports Top" "wrap-sports-top" 35 0 "$CAT_TOPS_ID" "Wrap-style sports top for active lifestyles." false 30
create_product "Juana Top" "juana-top" 25 0 "$CAT_TOPS_ID" "The Juana top — fresh spring/summer essential." false 30

echo ""
echo "  --- Bottoms ---"
create_product "Jude Pants" "jude-pants" 45 0 "$CAT_BOTTOMS_ID" "The Jude pants — tailored fit with premium fabric." true 30
create_product "Kristen Pants" "kristen-pants" 39 0 "$CAT_BOTTOMS_ID" "The Kristen pants — sleek and stylish for any look." false 25
create_product "Jude Skirt" "jude-skirt" 29 0 "$CAT_BOTTOMS_ID" "The Jude skirt — matching piece to the Jude collection." false 20
create_product "Bubble Skirt With Shorts" "bubble-skirt-with-shorts" 35 0 "$CAT_BOTTOMS_ID" "Fun bubble skirt with built-in shorts." false 25
create_product "Asymmetrical Jeans" "asymmetrical-jeans" 55 0 "$CAT_BOTTOMS_ID" "Unique asymmetrical design jeans — a standout piece." false 20
create_product "Ray Jeans" "ray-jeans" 49 0 "$CAT_BOTTOMS_ID" "Classic Ray jeans with a modern fit." false 25
create_product "Ballon Jeans" "ballon-jeans" 55 0 "$CAT_BOTTOMS_ID" "Trendy balloon silhouette jeans." false 20
create_product "Cuffed Jeans" "cuffed-jeans" 55 0 "$CAT_BOTTOMS_ID" "Stylish cuffed jeans — casual yet polished." false 20
create_product "Flare Leg Jeans" "flare-leg-jeans" 49 0 "$CAT_BOTTOMS_ID" "Retro-inspired flare leg jeans." false 25
create_product "Asha Flare Leg Pants" "asha-flare-leg-pants" 29 0 "$CAT_BOTTOMS_ID" "The Asha flare leg pants — comfortable and chic." false 30
create_product "Kyana Leggings" "kyana-leggings" 29 0 "$CAT_BOTTOMS_ID" "The Kyana leggings — perfect for everyday comfort." false 35
create_product "Leather Shorts" "leather-shorts" 35 0 "$CAT_BOTTOMS_ID" "Edgy leather shorts for a bold look." false 25
create_product "Skinny Jeans" "skinny-jeans" 45 0 "$CAT_BOTTOMS_ID" "Classic skinny jeans — flattering and versatile." false 30
create_product "Leather Pants" "leather-pants" 45 0 "$CAT_BOTTOMS_ID" "Premium leather pants — sleek and sophisticated." true 20
create_product "Moana Jeans" "moana-jeans" 55 0 "$CAT_BOTTOMS_ID" "The Moana jeans — trendy and comfortable." false 20
create_product "Juana Pants" "juana-pants" 45 0 "$CAT_BOTTOMS_ID" "The Juana pants — elegant tailored pants." false 25
create_product "Sequin Skirt" "sequin-skirt" 39 0 "$CAT_BOTTOMS_ID" "Sparkling sequin skirt for glamorous nights." false 20
create_product "Leather Skirt With Belt" "leather-skirt-with-belt" 39 0 "$CAT_BOTTOMS_ID" "Leather skirt with a chic belt detail." false 20
create_product "Syla Leggings" "syla-leggings" 25 0 "$CAT_BOTTOMS_ID" "The Syla leggings — soft and stretchy comfort." false 35
create_product "Pleated Skort" "pleated-skort" 29 0 "$CAT_BOTTOMS_ID" "Versatile pleated skort — skirt meets shorts." false 25
create_product "Satin Pants" "satin-pants" 33 0 "$CAT_BOTTOMS_ID" "Luxurious satin pants with an elegant drape." false 20
create_product "Kaelle Pants" "kaelle-pants" 39 0 "$CAT_BOTTOMS_ID" "The Kaelle pants — tailored and flattering." false 25
create_product "Pleated Skirt With Shorts" "pleated-skirt-with-shorts" 29 0 "$CAT_BOTTOMS_ID" "Pleated skirt with built-in shorts for coverage." false 25
create_product "Belted Jeans" "belted-jeans" 59 0 "$CAT_BOTTOMS_ID" "Stylish belted jeans — a wardrobe statement piece." false 20
create_product "Milie Pants" "milie-pants" 25 35 "$CAT_BOTTOMS_ID" "The Milie pants at a special sale price." false 30
create_product "Satin Long Skirt" "satin-long-skirt" 29 0 "$CAT_BOTTOMS_ID" "Elegant satin long skirt — flowy and feminine." false 25
create_product "Youmna Jeans" "youmna-jeans" 55 0 "$CAT_BOTTOMS_ID" "The Youmna jeans — premium denim with style." false 20
create_product "Wide Leg Jeans" "wide-leg-jeans" 27 55 "$CAT_BOTTOMS_ID" "Trendy wide leg jeans at a special price." false 25
create_product "Jessie Jeans" "jessie-jeans" 25 49 "$CAT_BOTTOMS_ID" "The Jessie jeans — classic denim at a great deal." false 25
create_product "Striped Jeans" "striped-jeans" 49 0 "$CAT_BOTTOMS_ID" "Unique striped jeans for a standout look." false 20
create_product "Cargo Pants" "cargo-pants" 22 45 "$CAT_BOTTOMS_ID" "Utility-inspired cargo pants — trendy and practical." false 30
create_product "Parachute Pants" "parachute-pants" 18 36 "$CAT_BOTTOMS_ID" "The Parachute pants at an amazing sale price." false 25
create_product "Milana Skort" "milana-skort" 29 0 "$CAT_BOTTOMS_ID" "The Milana skort — perfect for warm weather." false 25
create_product "Linen Pants" "linen-pants" 28 33 "$CAT_BOTTOMS_ID" "Breathable linen pants — perfect for summer." false 30
create_product "Lily Skirt" "lily-skirt" 30 38 "$CAT_BOTTOMS_ID" "The Lily skirt — feminine and flattering." false 20
create_product "Mila Skirt" "mila-skirt" 8 17 "$CAT_BOTTOMS_ID" "The Mila skirt at a deep discount." false 20
create_product "Satin Skirt" "satin-skirt" 8 18 "$CAT_BOTTOMS_ID" "Elegant satin skirt at an incredible price." false 25
create_product "Wide Leg Sweatpants" "wide-leg-sweatpants" 29 0 "$CAT_BOTTOMS_ID" "Cozy wide leg sweatpants — comfort meets style." false 35
create_product "Basic Leggings" "basic-leggings" 19 29 "$CAT_BOTTOMS_ID" "Essential basic leggings at a great price." false 40
create_product "Ripped Jeans" "ripped-jeans" 33 55 "$CAT_BOTTOMS_ID" "Edgy ripped jeans — distressed detailing." false 20
create_product "Loana Linen Shorts" "loana-linen-shorts" 17 25 "$CAT_BOTTOMS_ID" "Light and breezy linen shorts for summer." false 30

echo ""
echo "  --- Co-ords / Sets ---"
create_product "Tweed 3pcs Set" "tweed-3pcs-set" 129 0 "$CAT_COORDS_ID" "Luxurious tweed 3-piece set — jacket, top, and skirt." true 10
create_product "Jude Corset" "jude-corset" 45 0 "$CAT_COORDS_ID" "The Jude corset — structured elegance." false 20
create_product "Kristen Waisted Shirt" "kristen-waisted-shirt" 35 0 "$CAT_COORDS_ID" "The Kristen waisted shirt — cinched silhouette." false 25
create_product "Tara Waisted Shirt" "tara-waisted-shirt" 35 0 "$CAT_COORDS_ID" "The Tara waisted shirt — classic with a twist." false 25
create_product "Paola Set" "paola-set" 55 0 "$CAT_COORDS_ID" "The Paola matching set — effortless coordination." false 15
create_product "Wool Set" "wool-set" 59 0 "$CAT_COORDS_ID" "Cozy wool set — perfect for cooler weather." false 15
create_product "Lola Set" "lola-set" 39 59 "$CAT_COORDS_ID" "The Lola set at a special sale price — 34% off!" false 20
create_product "Faye Set" "faye-set" 55 0 "$CAT_COORDS_ID" "The Faye set — sophisticated matching outfit." false 15
create_product "Aiona Set" "aiona-set" 27 39 "$CAT_COORDS_ID" "The Aiona set at a special discount — 31% off!" false 20
create_product "Emily Set" "emily-set" 23 59 "$CAT_COORDS_ID" "The Emily set — massive savings at 61% off!" false 15
create_product "Melissa Satin Set" "melissa-satin-set" 59 0 "$CAT_COORDS_ID" "Luxurious Melissa satin set — smooth and elegant." false 15
create_product "Criss Cross Set" "criss-cross-set" 25 39 "$CAT_COORDS_ID" "The Criss Cross set at 36% off." false 20
create_product "Kimberly Set" "kimberly-set" 25 45 "$CAT_COORDS_ID" "The Kimberly Set — 44% off." false 20
create_product "Courtney Set" "courtney-set" 149 0 "$CAT_COORDS_ID" "The premium Courtney set — our most luxurious co-ord." true 8

echo ""
echo "  --- Outerwear ---"
create_product "Jude Blazer" "jude-blazer" 69 0 "$CAT_OUTERWEAR_ID" "The Jude blazer — structured and polished for any occasion." true 15
create_product "Faux Fur Jacket" "faux-fur-jacket" 89 0 "$CAT_OUTERWEAR_ID" "Luxurious faux fur jacket — cozy and glamorous." true 10
create_product "Juana Blazer" "juana-blazer" 59 0 "$CAT_OUTERWEAR_ID" "The Juana blazer — oversized and chic." false 15
create_product "Oversized Blazer With Belt" "oversized-blazer-with-belt" 69 0 "$CAT_OUTERWEAR_ID" "Oversized blazer with belt — statement outerwear piece." false 12
create_product "Leather Coat" "leather-coat" 109 129 "$CAT_OUTERWEAR_ID" "Premium leather coat at a special price — 16% off." true 8
create_product "Leather Trench Coat" "leather-trench-coat" 129 0 "$CAT_OUTERWEAR_ID" "Classic leather trench coat — timeless and luxurious." false 8
create_product "Wool Trench Coat" "wool-trench-coat" 109 0 "$CAT_OUTERWEAR_ID" "The Wool trench coat — warm and sophisticated." false 10

echo ""
echo "  --- Sportswear ---"
create_product "Sports Set" "sports-set" 69 0 "$CAT_SPORTSWEAR_ID" "Complete sports set — top and leggings for your workout." true 20
create_product "Sports Leggings" "sports-leggings" 29 0 "$CAT_SPORTSWEAR_ID" "High-performance sports leggings — stretchy and supportive." false 35
create_product "Sports Bra" "sports-bra" 27 0 "$CAT_SPORTSWEAR_ID" "Supportive sports bra for active lifestyles." false 30
create_product "Fleece Tracksuit" "fleece-tracksuit" 69 0 "$CAT_SPORTSWEAR_ID" "Warm and cozy fleece tracksuit — perfect for lounging or exercise." false 15
create_product "Striped Tracksuit" "striped-tracksuit" 67 79 "$CAT_SPORTSWEAR_ID" "Stylish striped tracksuit at 15% off." false 15
create_product "Sports Set Summer" "sports-set-summer" 42 0 "$CAT_SPORTSWEAR_ID" "Lightweight sports set for summer workouts." false 20

echo ""
echo "  --- Swimwear ---"
create_product "Isla Bikini" "isla-bikini" 23 29 "$CAT_SWIMWEAR_ID" "The Isla bikini — flattering and chic for the beach." false 20
create_product "Bandeau Bikini" "bandeau-bikini" 23 29 "$CAT_SWIMWEAR_ID" "Classic bandeau style bikini — timeless summer favorite." false 20
create_product "Dominica Bikini" "dominica-bikini" 23 29 "$CAT_SWIMWEAR_ID" "The Dominica bikini — tropical vibes." false 15
create_product "Kaia Bikini" "kaia-bikini" 26 33 "$CAT_SWIMWEAR_ID" "The Kaia bikini — premium quality at a great price." false 15
create_product "Triangle Bikini" "triangle-bikini" 23 29 "$CAT_SWIMWEAR_ID" "Classic triangle bikini — a summer essential." false 20
create_product "Lana Bikini" "lana-bikini" 23 29 "$CAT_SWIMWEAR_ID" "The Lana bikini — comfortable and stylish." false 15
create_product "Leopard Bikini" "leopard-bikini" 18 22 "$CAT_SWIMWEAR_ID" "Bold leopard print bikini." false 20
create_product "Flower Bikini" "flower-bikini" 22 28 "$CAT_SWIMWEAR_ID" "Floral pattern flower bikini." false 15
create_product "Ombre Bikini" "ombre-bikini" 27 0 "$CAT_SWIMWEAR_ID" "Trendy ombre gradient bikini." false 15
create_product "Tropical Bikini" "tropical-bikini" 26 32 "$CAT_SWIMWEAR_ID" "Vibrant tropical print bikini." false 15
create_product "Ray Bikini" "ray-bikini" 26 32 "$CAT_SWIMWEAR_ID" "The Ray bikini — bright and bold." false 15
create_product "Rushed Underwire Bikini" "rushed-underwire-bikini" 22 27 "$CAT_SWIMWEAR_ID" "Supportive underwire bikini — flattering fit." false 15
create_product "Ilaya Bikini" "ilaya-bikini" 20 25 "$CAT_SWIMWEAR_ID" "The Ilaya bikini — simple elegance for summer." false 15
create_product "Gianna Bikini" "gianna-bikini" 26 32 "$CAT_SWIMWEAR_ID" "The Gianna bikini — premium summer style." false 15
create_product "Tuline Bikini" "tuline-bikini" 20 25 "$CAT_SWIMWEAR_ID" "The Tuline bikini — comfort and style combined." false 15
create_product "Kaila Bikini" "kaila-bikini" 17 21 "$CAT_SWIMWEAR_ID" "The Kaila bikini at a great price." false 15
create_product "Siena Bikini" "siena-bikini" 18 22 "$CAT_SWIMWEAR_ID" "The Siena bikini — Italian-inspired design." false 15

echo ""
echo "  --- Accessories ---"
create_product "Aurora Tights" "aurora-tights" 9 0 "$CAT_ACCESSORIES_ID" "Aurora tights available in multiple colors." false 60
create_product "Boobytape" "boobytape" 8 0 "$CAT_ACCESSORIES_ID" "Body tape for a secure and lifted look." false 100
create_product "Adhesive Push Up Pad" "adhesive-push-up-pad" 9 0 "$CAT_ACCESSORIES_ID" "Push up pads for instant lift." false 80
create_product "Adhesive Bra" "adhesive-bra" 12 0 "$CAT_ACCESSORIES_ID" "Strapless adhesive bra — invisible under any outfit." false 60
create_product "Nipple Cover" "nipple-cover" 6 0 "$CAT_ACCESSORIES_ID" "Discreet nipple covers for a smooth silhouette." false 100
create_product "Double Tape" "double-tape" 6 0 "$CAT_ACCESSORIES_ID" "Fashion double tape for secure styling." false 100
create_product "Adhesive Panty" "adhesive-panty" 8 0 "$CAT_ACCESSORIES_ID" "Adhesive panty — invisible underwear solution." false 80
create_product "Gift Card" "gift-card" 10 0 "$CAT_ACCESSORIES_ID" "Chic Clique gift card — the perfect gift for fashion lovers." false 999

echo ""
echo "  --- Abayas ---"
create_product "Golden Abaya" "golden-abaya" 59 0 "$CAT_ABAYAS_ID" "Elegant golden abaya — luxurious and modest." true 15
create_product "Glitter Abaya" "glitter-abaya" 65 0 "$CAT_ABAYAS_ID" "Sparkling glitter abaya — modern modest fashion." true 15

echo ""
echo "  --- Sale Items ---"
create_product "Satin Top With Buckle" "satin-top-with-buckle" 12 25 "$CAT_SALE_ID" "Satin top with buckle detail — 52% off!" false 20
create_product "Reina Top" "reina-top" 12 25 "$CAT_SALE_ID" "The Reina top at an amazing 52% off." false 25
create_product "Juliette Top" "juliette-top" 9 18 "$CAT_SALE_ID" "The Juliette top — 50% off!" false 25
create_product "Cami Long Dress" "cami-long-dress" 22 27 "$CAT_SALE_ID" "Elegant cami long dress at 19% off." false 20
create_product "Halter Top" "halter-top" 8 12 "$CAT_SALE_ID" "Classic halter top — 33% off in multiple colors." false 30
create_product "Loana Dress" "loana-dress" 28 42 "$CAT_SALE_ID" "The Loana dress at 33% off." false 15
create_product "Jax Jumpsuit" "jax-jumpsuit" 25 45 "$CAT_SALE_ID" "The Jax jumpsuit — 44% off." false 15
create_product "Floral Dress" "floral-dress" 12 29 "$CAT_SALE_ID" "Beautiful floral dress at up to 59% off." false 20
create_product "Timy Set" "timy-set" 12 36 "$CAT_SALE_ID" "The Timy set — 67% off! Amazing deal." false 15
create_product "Paris Oversized Tee" "paris-oversized-tee" 9 24 "$CAT_SALE_ID" "Paris oversized tee — 63% off." false 20
create_product "Twist Dress" "twist-dress" 18 29 "$CAT_SALE_ID" "The Twist dress at 38% off." false 20
create_product "Amaya Dress" "amaya-dress" 59 69 "$CAT_SALE_ID" "The Amaya dress at 14% off." false 15
create_product "Amora Dress" "amora-dress" 29 45 "$CAT_SALE_ID" "The Amora dress at 36% off." false 15
create_product "Kiana Dress" "kiana-dress" 10 27 "$CAT_SALE_ID" "The Kiana dress at 63% off — incredible deal!" false 15
create_product "Satin Dress" "satin-dress" 42 49 "$CAT_SALE_ID" "Elegant satin dress at 14% off." false 15
create_product "Amelia Dress" "amelia-dress" 38 45 "$CAT_SALE_ID" "The Amelia dress at 16% off." false 15
create_product "Nina Dress" "nina-dress" 27 35 "$CAT_SALE_ID" "The Nina dress at 23% off." false 15
create_product "Melany Dress" "melany-dress" 29 45 "$CAT_SALE_ID" "The Melany dress at 36% off." false 15
create_product "Floral Dress Long" "floral-dress-long" 20 39 "$CAT_SALE_ID" "Long floral dress at 49% off." false 15
create_product "Nori Dress" "nori-dress" 23 29 "$CAT_SALE_ID" "The Nori dress at 21% off." false 15
create_product "Alma Dress" "alma-dress" 27 39 "$CAT_SALE_ID" "The Alma dress at 31% off." false 20
create_product "Mesh Top" "mesh-top" 9 14 "$CAT_SALE_ID" "Mesh top at 36% off." false 25
create_product "Yalina Top" "yalina-top" 17 29 "$CAT_SALE_ID" "The Yalina top at 41% off." false 20
create_product "Hannah Top" "hannah-top" 18 25 "$CAT_SALE_ID" "The Hannah top at 28% off." false 25
create_product "Ombre Cut Out Dress" "ombre-cut-out-dress" 39 49 "$CAT_SALE_ID" "Ombre cut out dress at 20% off." false 15
create_product "Maia Dress" "maia-dress" 19 25 "$CAT_SALE_ID" "The Maia dress at 24% off." false 15
create_product "Linen Shirt" "linen-shirt" 18 25 "$CAT_SALE_ID" "Breezy linen shirt at 28% off." false 25
create_product "Lily Top" "lily-top" 20 25 "$CAT_SALE_ID" "The Lily top at 20% off." false 25
create_product "Loana Linen Top" "loana-linen-top" 16 23 "$CAT_SALE_ID" "Loana linen top at 30% off." false 25
create_product "Pinella Corset" "pinella-corset" 22 27 "$CAT_SALE_ID" "The Pinella corset at 19% off." false 20
create_product "Asymmetrical Crop Top" "asymmetrical-crop-top" 5 13 "$CAT_SALE_ID" "Asymmetrical crop top at 62% off — steal deal!" false 20
create_product "Freya Jumpsuit" "freya-jumpsuit" 59 0 "$CAT_SALE_ID" "The Freya jumpsuit — elegant one-piece style." false 15

echo ""

###############################################################################
# 5. GLOBAL SETTINGS
###############################################################################
echo "▸ Updating global settings..."
RESULT=$(update_single "global-setting" '{
  "siteName": "Chic Clique",
  "siteDescription": "Chic Clique — Leading online fashion & clothing brand designed and produced in Lebanon. New arrivals every week.",
  "currency": "USD",
  "currencySymbol": "$",
  "taxRate": 0,
  "socialLinks": {
    "facebook": "https://www.facebook.com/p/Chicclique-61575058804314/",
    "instagram": "https://www.instagram.com/chiccliquelb/",
    "whatsapp": "http://wa.link/tyjtec"
  },
  "contactEmail": "info@chiccliquestore.com",
  "contactPhone": "+961",
  "address": "Lebanon"
}')
echo "  ✓ Global settings updated"
echo ""

###############################################################################
# 6. ABOUT PAGE
###############################################################################
echo "▸ Updating about page..."
RESULT=$(update_single "about-page" '{
  "title": "About Chic Clique",
  "content": "## Our Story\n\nChic Clique is a leading online fashion and clothing brand designed and produced in Lebanon.\n\nWe believe that every woman deserves to feel confident and stylish, regardless of her size, shape, or personal style. That'\''s why we create fashion-forward pieces that cater to every body type and aesthetic.\n\n## Our Mission\n\nOur mission is to provide for all sizes, shapes, and styles with supreme quality at the best prices. We are dedicated to making high-quality fashion accessible to everyone.\n\n## Designed & Produced in Lebanon\n\nEvery piece in our collection is proudly designed and produced in Lebanon. We take pride in our Lebanese craftsmanship and attention to detail, ensuring that every garment meets our high standards of quality.\n\n## New Arrivals Every Week\n\nWe constantly refresh our collection with new styles and designs. Follow us on Instagram @chiccliquelb to stay updated on the latest drops.",
  "mission": "Our mission is to provide for all sizes, shapes, and styles with supreme quality at the best prices. Designed and produced in Lebanon."
}')
echo "  ✓ About page updated"
echo ""

###############################################################################
# 7. LEGAL PAGES (Shipping & Return Policies)
###############################################################################
echo "▸ Updating legal pages..."
RESULT=$(update_single "legal-page" '{
  "shippingPolicy": "## Shipping Information\n\n### Delivery in Lebanon\n- **Standard Delivery**: 80,000 L.L.\n- **Delivery Time**: 1 to 3 business days\n- **FREE Delivery**: On all orders above $40\n\n### Important Notes\n- Orders are processed and shipped within 1-3 business days.\n- Same-day delivery may be available for select areas.\n- Tracking information will be provided once your order is shipped.\n- For any questions about your delivery, please contact us.",
  "returnPolicy": "## Return & Exchange Policy\n\n### Exchange Window\n- Items can be exchanged within **3 days** of receiving your order.\n\n### Exchange Conditions\n- Items must be in their original condition with tags attached.\n- Items must not have been worn, washed, or altered.\n- Sale items are **non-exchangeable**.\n\n### Refund Policy\n- We do not offer cash refunds.\n- Exchanges are offered as **store credit only**.\n\n### How to Request an Exchange\n1. Contact us within 3 days of receiving your order.\n2. Explain the reason for the exchange.\n3. We will provide instructions on how to return the item.\n4. Once we receive and inspect the item, your store credit will be issued.",
  "privacyPolicy": "## Privacy Policy\n\nChic Clique respects your privacy. We collect personal information only when necessary to process your orders and improve your shopping experience.\n\n### Information We Collect\n- Name, email, phone number, and shipping address for order processing.\n- Payment information is processed securely and not stored on our servers.\n\n### How We Use Your Information\n- To process and deliver your orders.\n- To send you updates about your order status.\n- To notify you about new arrivals and promotions (with your consent).\n\n### Contact\nFor any privacy concerns, contact us through our website.",
  "termsOfService": "## Terms of Service\n\nBy using Chic Clique'\''s website and services, you agree to the following terms:\n\n### Orders\n- All orders are subject to availability.\n- Prices are listed in USD.\n- We reserve the right to cancel orders if items are out of stock.\n\n### Exchanges\n- Please refer to our Return & Exchange Policy for details.\n\n### Intellectual Property\n- All content, designs, and branding are the property of Chic Clique.\n\n### Limitation of Liability\n- Chic Clique is not responsible for delays caused by shipping carriers."
}')
echo "  ✓ Legal pages updated"
echo ""

###############################################################################
# 8. CONTACT PAGE
###############################################################################
echo "▸ Updating contact page..."
RESULT=$(update_single "contact-page" '{
  "title": "Contact Us",
  "content": "We would love to hear from you! Whether you have a question about our products, an order, or anything else — our team is here to help.\n\nFollow us on social media:\n- Instagram: @chiccliquelb\n- Facebook: Chicclique\n- WhatsApp: Available for quick support",
  "email": "info@chiccliquestore.com",
  "phone": "+961",
  "address": "Lebanon"
}')
echo "  ✓ Contact page updated"
echo ""

###############################################################################
# 9. FAQ PAGE
###############################################################################
echo "▸ Updating FAQ page..."
RESULT=$(update_single "faq-page" '{
  "title": "Frequently Asked Questions"
}')
echo "  ✓ FAQ page updated"
echo ""

###############################################################################
# 10. HOMEPAGE
###############################################################################
echo "▸ Updating homepage..."
RESULT=$(update_single "homepage" '{
  "newArrivalsTitle": "New Arrivals Every Week",
  "newsletterTitle": "Want to Collab?",
  "newsletterDescription": "Sign up for discounts + updates on the latest arrivals. Use code CC10 for 10% off your first order!"
}')
echo "  ✓ Homepage updated"
echo ""

###############################################################################
# 11. SHIPPING ZONE
###############################################################################
echo "▸ Creating shipping zone..."
create_entry "shipping-zones" '{
  "name": "Lebanon",
  "countries": ["LB"],
  "rates": [
    {
      "name": "Standard Delivery",
      "price": 3,
      "minOrderAmount": 0,
      "maxOrderAmount": 39.99,
      "estimatedDays": "1-3 business days"
    },
    {
      "name": "Free Delivery",
      "price": 0,
      "minOrderAmount": 40,
      "maxOrderAmount": null,
      "estimatedDays": "1-3 business days"
    }
  ]
}' >/dev/null
echo "  ✓ Shipping zone: Lebanon (free delivery over \$40)"
echo ""

echo "========================================="
echo "  ✓ Chic Clique data seeded!"
echo "========================================="
echo ""
echo "  Summary:"
echo "    • 1 Brand (Chic Clique)"
echo "    • 10 Categories (Dresses, Tops, Bottoms, Co-ords, Outerwear, Sportswear, Swimwear, Accessories, Sale, Abayas)"
echo "    • 150+ Products with prices and descriptions"
echo "    • 1 Coupon (CC10 — 10% off)"
echo "    • 1 Shipping Zone (Lebanon — free over \$40)"
echo "    • Updated: Global Settings, About, Contact, Legal, FAQ, Homepage"
echo ""
echo "  Next steps:"
echo "    1. Add product images via Strapi Admin → $STRAPI_URL/admin"
echo "    2. Publish content that is in draft state"
echo "    3. Update frontend branding (already done in code)"
echo ""
