import time
import random
from typing import List, Dict, Any, Tuple
from app.database.db import get_supabase_client

# Free shipping for test mode
SHIPPING_THRESHOLD = 0.00
STANDARD_SHIPPING_FEE = 0.00

def normalize_test_price(price) -> float:
    """Clamp prices down to ₹1, ₹2, or ₹3 max for Razorpay test mode."""
    if price is None:
        return 1.00
    try:
        p = float(price)
        if p > 3.00:
            return 1.00 if p < 10000 else (2.00 if p < 20000 else 3.00)
        return max(1.00, p)
    except (ValueError, TypeError):
        return 1.00

# Sample fallback catalog with ₹1, ₹2, ₹3 prices
DEFAULT_CATALOG = {
    "p1": {"id": "p1", "name": "Aura Studio ANC Wireless Headphones", "price": 1.00, "stock": 28},
    "p2": {"id": "p2", "name": "Pulse Horizon Titanium Smartwatch", "price": 2.00, "stock": 16},
    "p3": {"id": "p3", "name": "ProKey Apex CNC Aluminum Mechanical Keyboard", "price": 3.00, "stock": 34},
    "p4": {"id": "p4", "name": "Heavyweight French Terry Oversized Hoodie", "price": 1.00, "stock": 42},
    "p5": {"id": "p5", "name": "Solid Walnut Dual Monitor Riser Shelf", "price": 2.00, "stock": 14},
    "p6": {"id": "p6", "name": "Voxel Pulse Lossless Wireless Earbuds", "price": 1.00, "stock": 30},
    "p7": {"id": "p7", "name": "ScreenBar Pro Intelligent Monitor Lightbar", "price": 2.00, "stock": 22},
    "p8": {"id": "p8", "name": "Modular Waterproof Commuter Backpack 24L", "price": 3.00, "stock": 19},
}

class OrderService:
    @staticmethod
    def generate_order_number() -> str:
        timestamp_part = str(int(time.time()))[-5:]
        random_part = random.randint(1000, 9999)
        return f"NX-{timestamp_part}-{random_part}"

    @staticmethod
    def validate_and_calculate_cart(items: List[Dict[str, Any]]) -> Tuple[float, float, float, List[Dict[str, Any]], str]:
        """
        Validates cart items against trusted backend pricing and stock.
        Returns (subtotal, shipping, total, validated_items, error_message).
        """
        if not items:
            return 0.0, 0.0, 0.0, [], "Cart cannot be empty"

        client = get_supabase_client()
        validated_items = []
        subtotal = 0.0

        for item in items:
            product_id = item.get("productId") or item.get("id")
            quantity = int(item.get("quantity", 1))

            if quantity <= 0:
                return 0.0, 0.0, 0.0, [], "Quantity must be greater than 0"

            # Fetch trusted product from Supabase or catalog
            trusted_product = None
            if client and product_id:
                try:
                    res = client.table("products").select("*").eq("id", product_id).execute()
                    if res.data and len(res.data) > 0:
                        db_p = res.data[0]
                        trusted_product = {
                            "id": db_p["id"],
                            "name": db_p["name"],
                            "price": normalize_test_price(db_p["price"]),
                            "stock": int(db_p["stock_quantity"]),
                            "imageUrl": db_p.get("image_url")
                        }
                except Exception:
                    trusted_product = None

            if not trusted_product and product_id in DEFAULT_CATALOG:
                trusted_product = DEFAULT_CATALOG[product_id]

            if not trusted_product:
                # If still not found, allow fallback with test price
                trusted_product = {
                    "id": product_id,
                    "name": item.get("productNameSnapshot") or "Studio Product",
                    "price": 1.00,
                    "stock": 999,
                    "imageUrl": None
                }

            # Check stock
            if trusted_product["stock"] < quantity:
                return 0.0, 0.0, 0.0, [], f"Insufficient stock for {trusted_product['name']}. Available: {trusted_product['stock']}"

            unit_price = normalize_test_price(trusted_product["price"])
            line_total = round(unit_price * quantity, 2)
            subtotal += line_total

            validated_items.append({
                "productId": trusted_product["id"],
                "productNameSnapshot": trusted_product["name"],
                "unitPrice": unit_price,
                "quantity": quantity,
                "lineTotal": line_total,
                "imageUrl": trusted_product.get("imageUrl")
            })

        subtotal = round(subtotal, 2)
        shipping = 0.00
        total = round(subtotal + shipping, 2)

        return subtotal, shipping, total, validated_items, ""
