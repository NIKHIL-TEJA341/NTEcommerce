from flask import Blueprint, jsonify
from app.database.db import get_supabase_client

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/orders", methods=["GET"])
def get_orders():
    client = get_supabase_client()
    if client:
        try:
            res = client.table("orders").select("*, order_items(*)").order("created_at", desc=True).execute()
            if res.data:
                return jsonify({"orders": res.data}), 200
        except Exception as e:
            print(f"Error fetching orders: {e}")

    return jsonify({"orders": []}), 200

@orders_bp.route("/orders/<order_id>", methods=["GET"])
def get_order_by_id(order_id):
    client = get_supabase_client()
    if client:
        try:
            res = client.table("orders").select("*, order_items(*), payments(*)").or_(f"id.eq.{order_id},order_number.eq.{order_id}").execute()
            if res.data and len(res.data) > 0:
                return jsonify({"order": res.data[0]}), 200
        except Exception as e:
            print(f"Error fetching order: {e}")

    return jsonify({"error": "Order not found"}), 404
