from flask import Blueprint, request, jsonify
from app.database.db import get_supabase_client

products_bp = Blueprint("products", __name__)

def normalize_test_price(price):
    """Normalize catalog prices down to ₹1, ₹2, or ₹3 max for test mode."""
    if price is None:
        return 1.00
    try:
        p = float(price)
        if p > 3.00:
            return 1.00 if p < 10000 else (2.00 if p < 20000 else 3.00)
        return max(1.00, p)
    except (ValueError, TypeError):
        return 1.00

# Sample catalog fallback with test pricing (₹1 - ₹3)
SAMPLE_PRODUCTS = [
    {
        "id": "p1",
        "categoryId": "c1",
        "categoryName": "Audio & Acoustics",
        "name": "Aura Studio ANC Wireless Headphones",
        "slug": "aura-studio-anc-wireless-headphones",
        "description": "Precision engineered with 40mm titanium diaphragm drivers, dual hybrid active noise cancellation, and 45 hours battery life.",
        "price": 1.00,
        "originalPrice": 2.00,
        "currency": "INR",
        "stockQuantity": 28,
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "rating": 4.9,
        "reviewsCount": 128,
        "isActive": True,
        "isFeatured": True
    },
    {
        "id": "p2",
        "categoryId": "c2",
        "categoryName": "Smart Wearables",
        "name": "Pulse Horizon Titanium Smartwatch",
        "slug": "pulse-horizon-titanium-smartwatch",
        "description": "Grade 5 aerospace titanium with sapphire crystal, continuous ECG telemetry, and offline GPS trail maps.",
        "price": 2.00,
        "originalPrice": 3.00,
        "currency": "INR",
        "stockQuantity": 16,
        "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        "rating": 4.8,
        "reviewsCount": 84,
        "isActive": True,
        "isFeatured": True
    },
    {
        "id": "p3",
        "categoryId": "c3",
        "categoryName": "Computing & Studio",
        "name": "ProKey Apex CNC Aluminum Mechanical Keyboard",
        "slug": "prokey-apex-cnc-aluminum-mechanical-keyboard",
        "description": "Anodized 6063 aluminum chassis featuring gasket-mount leaf springs, lubricated linear switches, and PBT double-shot keycaps.",
        "price": 3.00,
        "originalPrice": 4.00,
        "currency": "INR",
        "stockQuantity": 34,
        "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        "rating": 4.9,
        "reviewsCount": 65,
        "isActive": True,
        "isFeatured": True
    },
    {
        "id": "p4",
        "categoryId": "c4",
        "categoryName": "Minimalist Apparel",
        "name": "Heavyweight French Terry Oversized Hoodie",
        "slug": "heavyweight-french-terry-oversized-hoodie",
        "description": "Crafted from 480 GSM combed organic cotton. Preshrunk with drop shoulders and double-needle ribbed hems.",
        "price": 1.00,
        "originalPrice": 2.00,
        "currency": "INR",
        "stockQuantity": 42,
        "imageUrl": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        "rating": 4.7,
        "reviewsCount": 92,
        "isActive": True,
        "isFeatured": False
    },
    {
        "id": "p5",
        "categoryId": "c5",
        "categoryName": "Workspace Living",
        "name": "Solid Walnut Dual Monitor Riser Shelf",
        "slug": "solid-walnut-dual-monitor-riser-shelf",
        "description": "Precision milled from sustainable American Black Walnut with heavy-gauge powder coated steel legs.",
        "price": 2.00,
        "originalPrice": 3.00,
        "currency": "INR",
        "stockQuantity": 14,
        "imageUrl": "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=800&q=80",
        "rating": 4.9,
        "reviewsCount": 45,
        "isActive": True,
        "isFeatured": True
    }
]

SAMPLE_CATEGORIES = [
    {"id": "c1", "name": "Audio & Acoustics", "slug": "audio-acoustics", "isActive": True},
    {"id": "c2", "name": "Smart Wearables", "slug": "smart-wearables", "isActive": True},
    {"id": "c3", "name": "Computing & Studio", "slug": "computing-studio", "isActive": True},
    {"id": "c4", "name": "Minimalist Apparel", "slug": "minimalist-apparel", "isActive": True},
    {"id": "c5", "name": "Workspace Living", "slug": "workspace-living", "isActive": True}
]

@products_bp.route("/products", methods=["GET"])
def get_products():
    client = get_supabase_client()
    category = request.args.get("category")
    search = request.args.get("search")

    if client:
        try:
            query = client.table("products").select("*, categories(name, slug)").eq("is_active", True)
            if category:
                query = query.eq("category_id", category)
            res = query.execute()
            if res.data:
                # Normalize all product prices to ₹1 - ₹3 test mode
                for p in res.data:
                    p["price"] = normalize_test_price(p.get("price"))
                    if p.get("original_price"):
                        p["original_price"] = min(p["price"] + 1.00, 4.00)
                return jsonify({"products": res.data, "count": len(res.data)}), 200
        except Exception as e:
            print(f"DB query error: {e}")

    # Fallback filtering
    filtered = SAMPLE_PRODUCTS
    if category and category != "all":
        filtered = [p for p in filtered if p["categoryId"] == category or p["categoryName"].lower() == category.lower()]
    if search:
        s = search.lower()
        filtered = [p for p in filtered if s in p["name"].lower() or s in p["description"].lower()]

    return jsonify({"products": filtered, "count": len(filtered)}), 200

@products_bp.route("/products/<product_id>", methods=["GET"])
def get_product(product_id):
    client = get_supabase_client()
    if client:
        try:
            res = client.table("products").select("*, categories(name, slug), product_variants(*)").eq("id", product_id).execute()
            if res.data and len(res.data) > 0:
                p = res.data[0]
                p["price"] = normalize_test_price(p.get("price"))
                if p.get("original_price"):
                    p["original_price"] = min(p["price"] + 1.00, 4.00)
                for v in p.get("product_variants", []):
                    if v.get("price_override"):
                        v["price_override"] = normalize_test_price(v.get("price_override"))
                return jsonify({"product": p}), 200
        except Exception as e:
            print(f"DB query error: {e}")

    for p in SAMPLE_PRODUCTS:
        if p["id"] == product_id or p["slug"] == product_id:
            return jsonify({"product": p}), 200

    return jsonify({"error": "Product not found"}), 404

@products_bp.route("/categories", methods=["GET"])
def get_categories():
    client = get_supabase_client()
    if client:
        try:
            res = client.table("categories").select("*").eq("is_active", True).execute()
            if res.data:
                return jsonify({"categories": res.data}), 200
        except Exception as e:
            print(f"DB query error: {e}")

    return jsonify({"categories": SAMPLE_CATEGORIES}), 200
