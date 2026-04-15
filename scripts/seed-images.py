#!/usr/bin/env python3
"""
Seed Unsplash images into Strapi for all categories and products.
Downloads images from Unsplash's CDN and uploads to Strapi media library,
then links them to the appropriate content entries.
"""
import sys, json, os, time, hashlib
import urllib.request, urllib.error
from pathlib import Path

STRAPI_URL = "http://localhost:1337"
ADMIN_EMAIL = "stephanelkhoury2000@gmail.com"
ADMIN_PASSWORD = "Stephann@180100"
TMP_DIR = Path("/tmp/unsplash_images")
TMP_DIR.mkdir(exist_ok=True)

# ─── Unsplash image URLs per category (curated fashion photos) ───
# Using Unsplash source/photo URLs at specific sizes
CATEGORY_IMAGES = {
    "dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop&q=80",
    "tops": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=600&fit=crop&q=80",
    "bottoms": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=600&fit=crop&q=80",
    "co-ords": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop&q=80",
    "outerwear": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop&q=80",
    "sportswear": "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=800&h=600&fit=crop&q=80",
    "swimwear": "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&h=600&fit=crop&q=80",
    "accessories": "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&h=600&fit=crop&q=80",
    "sale": "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop&q=80",
    "abayas": "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800&h=600&fit=crop&q=80",
}

# Product images by category (multiple per category for variety)
PRODUCT_IMAGES = {
    "dresses": [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=600&fit=crop&q=80",
    ],
    "tops": [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&h=600&fit=crop&q=80",
    ],
    "bottoms": [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop&q=80",
    ],
    "co-ords": [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=600&fit=crop&q=80",
    ],
    "outerwear": [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&h=600&fit=crop&q=80",
    ],
    "sportswear": [
        "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop&q=80",
    ],
    "swimwear": [
        "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1520262454473-a1a82276a574?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=600&fit=crop&q=80",
    ],
    "accessories": [
        "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=600&fit=crop&q=80",
    ],
    "sale": [
        "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop&q=80",
    ],
    "abayas": [
        "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600&h=600&fit=crop&q=80",
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=600&fit=crop&q=80",
    ],
}

def get_jwt():
    data = json.dumps({"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).encode()
    req = urllib.request.Request(
        f"{STRAPI_URL}/admin/login",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["data"]["token"]

def download_image(url, filename):
    """Download image from URL to /tmp."""
    filepath = TMP_DIR / filename
    if filepath.exists() and filepath.stat().st_size > 1000:
        return filepath
    
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            with open(filepath, "wb") as f:
                f.write(resp.read())
        return filepath
    except Exception as e:
        print(f"  WARN: Failed to download {url}: {e}")
        return None

def upload_to_strapi(filepath, jwt, alt_text=""):
    """Upload an image file to Strapi media library."""
    import mimetypes
    
    boundary = "----FormBoundary" + hashlib.md5(str(time.time()).encode()).hexdigest()[:16]
    filename = filepath.name
    mime_type = mimetypes.guess_type(filename)[0] or "image/jpeg"
    
    with open(filepath, "rb") as f:
        file_data = f.read()
    
    # Build multipart form data manually
    body = b""
    # File field
    body += f"--{boundary}\r\n".encode()
    body += f'Content-Disposition: form-data; name="files"; filename="{filename}"\r\n'.encode()
    body += f"Content-Type: {mime_type}\r\n\r\n".encode()
    body += file_data
    body += b"\r\n"
    # fileInfo field
    file_info = json.dumps({"alternativeText": alt_text, "caption": alt_text})
    body += f"--{boundary}\r\n".encode()
    body += f'Content-Disposition: form-data; name="fileInfo"\r\n'.encode()
    body += b"Content-Type: application/json\r\n\r\n"
    body += file_info.encode()
    body += b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    
    req = urllib.request.Request(
        f"{STRAPI_URL}/upload",
        data=body,
        headers={
            "Authorization": f"Bearer {jwt}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            if isinstance(result, list) and len(result) > 0:
                return result[0]["id"]
            return None
    except urllib.error.HTTPError as e:
        print(f"  WARN: Upload failed {e.code}: {e.read().decode()[:200]}")
        return None

def api_request(path, jwt, method="GET", data=None):
    url = f"{STRAPI_URL}{path}"
    headers = {
        "Authorization": f"Bearer {jwt}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, headers=headers, method=method)
    if data:
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  ERROR {e.code} on {method} {path}: {body[:200]}")
        return None

def link_image_to_category(category_doc_id, image_id, jwt):
    """Link uploaded image to a category via content-manager API."""
    result = api_request(
        f"/content-manager/collection-types/api::category.category/{category_doc_id}",
        jwt,
        method="PUT",
        data={"image": image_id}
    )
    return result is not None

def link_images_to_product(product_doc_id, image_ids, jwt):
    """Link uploaded images to a product via content-manager API."""
    result = api_request(
        f"/content-manager/collection-types/api::product.product/{product_doc_id}",
        jwt,
        method="PUT",
        data={"images": image_ids}
    )
    return result is not None

def publish_entry(uid, doc_id, jwt, is_single=False):
    """Publish a content entry."""
    if is_single:
        path = f"/content-manager/single-types/{uid}/actions/publish"
    else:
        path = f"/content-manager/collection-types/{uid}/{doc_id}/actions/publish"
    return api_request(path, jwt, method="POST", data={})


def main():
    print("=" * 60)
    print("  Unsplash Image Seeder for Chic Clique")
    print("=" * 60)
    
    print("\n[1/5] Authenticating...")
    jwt = get_jwt()
    print(f"  JWT obtained: {jwt[:20]}...")
    
    # ─── STEP 2: Upload & assign category images ───
    print("\n[2/5] Downloading & uploading category images...")
    
    # Get all categories via content-manager
    cats_resp = api_request("/content-manager/collection-types/api::category.category?page=1&pageSize=100&sort=position:asc", jwt)
    categories = cats_resp.get("results", [])
    print(f"  Found {len(categories)} categories")
    
    category_image_cache = {}  # slug -> image_id for reuse
    
    for cat in categories:
        slug = cat["slug"]
        name = cat["name"]
        doc_id = cat["documentId"]
        
        url = CATEGORY_IMAGES.get(slug)
        if not url:
            print(f"  SKIP: No image mapping for category '{slug}'")
            continue
        
        filename = f"cat-{slug}.jpg"
        print(f"  Downloading {name}...", end=" ", flush=True)
        filepath = download_image(url, filename)
        if not filepath:
            print("FAILED")
            continue
        
        print("uploading...", end=" ", flush=True)
        image_id = upload_to_strapi(filepath, jwt, f"{name} category - Chic Clique fashion")
        if not image_id:
            print("UPLOAD FAILED")
            continue
        
        category_image_cache[slug] = image_id
        
        print("linking...", end=" ", flush=True)
        if link_image_to_category(doc_id, image_id, jwt):
            print("OK")
        else:
            print("LINK FAILED")
        
        time.sleep(0.3)
    
    # ─── STEP 3: Download all product images upfront ───
    print("\n[3/5] Pre-downloading product images...")
    
    product_image_ids = {}  # category_slug -> [image_ids]
    
    for cat_slug, urls in PRODUCT_IMAGES.items():
        product_image_ids[cat_slug] = []
        for i, url in enumerate(urls):
            filename = f"prod-{cat_slug}-{i}.jpg"
            filepath = download_image(url, filename)
            if not filepath:
                continue
            
            alt_text = f"Chic Clique {cat_slug} fashion product"
            image_id = upload_to_strapi(filepath, jwt, alt_text)
            if image_id:
                product_image_ids[cat_slug].append(image_id)
                print(f"  Uploaded {filename} -> media ID {image_id}")
            
            time.sleep(0.2)
    
    total_uploaded = sum(len(ids) for ids in product_image_ids.values())
    print(f"  Total product images uploaded: {total_uploaded}")
    
    # ─── STEP 4: Assign images to products ───
    print("\n[4/5] Assigning images to products...")
    
    page = 1
    assigned = 0
    failed = 0
    
    while True:
        resp = api_request(
            f"/content-manager/collection-types/api::product.product?page={page}&pageSize=100&populate%5B0%5D=category",
            jwt
        )
        if not resp:
            break
        
        products = resp.get("results", [])
        if not products:
            break
        
        total = resp.get("pagination", {}).get("total", 0)
        
        for product in products:
            doc_id = product["documentId"]
            name = product["name"]
            cat = product.get("category") or {}
            cat_slug = cat.get("slug", "sale")
            
            # Get images for this category
            available_images = product_image_ids.get(cat_slug, [])
            if not available_images:
                # Fallback to sale images
                available_images = product_image_ids.get("sale", [])
            
            if not available_images:
                failed += 1
                continue
            
            # Pick 1-2 images based on product index for variety
            idx = assigned % len(available_images)
            selected = [available_images[idx]]
            # Add a second image for variety if available
            if len(available_images) > 1:
                idx2 = (assigned + 1) % len(available_images)
                if idx2 != idx:
                    selected.append(available_images[idx2])
            
            if link_images_to_product(doc_id, selected, jwt):
                assigned += 1
                if assigned % 20 == 0:
                    print(f"  Progress: {assigned}/{total} products assigned")
            else:
                failed += 1
            
            time.sleep(0.1)
        
        pagination = resp.get("pagination", {})
        if page * 100 >= pagination.get("total", 0):
            break
        page += 1
    
    print(f"  Done: {assigned} assigned, {failed} failed")
    
    # ─── STEP 5: Re-publish all updated entries ───
    print("\n[5/5] Re-publishing updated entries...")
    
    # Re-publish categories
    for cat in categories:
        publish_entry("api::category.category", cat["documentId"], jwt)
    print(f"  Re-published {len(categories)} categories")
    
    # Re-publish products (paginated)
    page = 1
    republished = 0
    while True:
        resp = api_request(
            f"/content-manager/collection-types/api::product.product?page={page}&pageSize=100",
            jwt
        )
        if not resp:
            break
        results = resp.get("results", [])
        if not results:
            break
        
        for p in results:
            publish_entry("api::product.product", p["documentId"], jwt)
            republished += 1
        
        total = resp.get("pagination", {}).get("total", 0)
        if page * 100 >= total:
            break
        page += 1
        time.sleep(0.2)
    
    print(f"  Re-published {republished} products")
    
    print("\n" + "=" * 60)
    print("  DONE! All images seeded successfully.")
    print(f"  Categories: {len(category_image_cache)} with images")
    print(f"  Products: {assigned} with images")
    print(f"  Total media uploaded: {total_uploaded + len(category_image_cache)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
