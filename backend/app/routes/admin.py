from flask import Blueprint, request, jsonify
from app.database.db import get_supabase_client

admin_bp = Blueprint("admin", __name__)

VALID_STATUSES = [
    "pending_payment",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "payment_failed",
    "refund_pending",
    "refunded"
]

@admin_bp.route("/admin/orders", methods=["GET"])
def admin_get_orders():
    client = get_supabase_client()
    if client:
        try:
            res = client.table("orders").select("*, order_items(*), payments(*)").order("created_at", desc=True).execute()
            if res.data:
                return jsonify({"orders": res.data}), 200
        except Exception as e:
            print(f"Admin fetch orders error: {e}")

    return jsonify({"orders": []}), 200

@admin_bp.route("/admin/orders/<order_id>/status", methods=["PATCH"])
def admin_update_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get("status")

    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"}), 400

    client = get_supabase_client()
    if client:
        try:
            res = client.table("orders").update({"status": new_status}).or_(f"id.eq.{order_id},order_number.eq.{order_id}").execute()
            if res.data and len(res.data) > 0:
                return jsonify({"success": True, "order": res.data[0]}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to update status: {e}"}), 500

    return jsonify({"success": True, "status": new_status, "orderId": order_id}), 200

@admin_bp.route("/admin/products", methods=["POST"])
def admin_create_product():
    data = request.get_json() or {}
    name = data.get("name")
    price = data.get("price")
    stock = data.get("stockQuantity", 0)

    if not name or price is None:
        return jsonify({"error": "Product name and price are required"}), 400

    client = get_supabase_client()
    if client:
        try:
            res = client.table("products").insert(data).execute()
            if res.data:
                return jsonify({"product": res.data[0]}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    return jsonify({"product": data, "message": "Product registered"}), 201

@admin_bp.route("/admin/products/<product_id>", methods=["PATCH"])
def admin_update_product(product_id):
    data = request.get_json() or {}
    client = get_supabase_client()
    if client:
        try:
            res = client.table("products").update(data).eq("id", product_id).execute()
            if res.data:
                return jsonify({"product": res.data[0]}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    return jsonify({"product": data, "id": product_id}), 200

@admin_bp.route("/admin/analytics", methods=["GET"])
def admin_get_analytics():
    client = get_supabase_client()
    total_sales = 0.0
    total_orders = 0
    low_stock_count = 0

    if client:
        try:
            orders_res = client.table("orders").select("total_amount, status").execute()
            if orders_res.data:
                total_orders = len(orders_res.data)
                for o in orders_res.data:
                    if o.get("status") in ("paid", "processing", "shipped", "delivered"):
                        total_sales += float(o.get("total_amount", 0))

            products_res = client.table("products").select("stock_quantity").execute()
            if products_res.data:
                low_stock_count = sum(1 for p in products_res.data if p.get("stock_quantity", 0) <= 5)
        except Exception as e:
            print(f"Analytics query error: {e}")

    return jsonify({
        "totalSales": total_sales,
        "totalOrders": total_orders,
        "lowStockCount": low_stock_count,
        "currency": "INR"
    }), 200
