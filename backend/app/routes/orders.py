from flask import Blueprint, jsonify, request
from app.database.db import get_supabase_client
from app.auth.token_verifier import verify_token_from_header

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/orders", methods=["GET"])
def get_orders():
    """
    Returns orders isolated per customer account.
    - Verified admin: returns all store orders.
    - Authenticated customer: returns orders belonging to this user ID / email.
    - Explicit query param (email/userId): returns filtered matching orders.
    """
    client = get_supabase_client()
    if not client:
        return jsonify({"orders": []}), 200

    user = verify_token_from_header()
    query_email = request.args.get("email", "").strip()
    query_user_id = request.args.get("userId", "").strip()

    try:
        # Case 1: Authenticated with Supabase Bearer token
        if user:
            u_id = user.id if hasattr(user, "id") else user.get("id")
            u_email = (user.email if hasattr(user, "email") else user.get("email") or "").lower()

            # Check if user is an administrator
            is_admin = False
            try:
                res_role = client.table("user_roles").select("role").eq("user_id", u_id).eq("role", "admin").execute()
                if res_role.data and len(res_role.data) > 0:
                    is_admin = True
            except Exception:
                pass

            if is_admin:
                res = client.table("orders").select("*, order_items(*)").order("created_at", desc=True).execute()
                return jsonify({"orders": res.data or []}), 200

            # Authenticated customer: filter strictly for their account
            filter_conditions = []
            if u_id:
                filter_conditions.append(f"user_id.eq.{u_id}")
            if u_email:
                filter_conditions.append(f"shipping_address_snapshot->>email.eq.{u_email}")

            if filter_conditions:
                res = client.table("orders").select("*, order_items(*)").or_(",".join(filter_conditions)).order("created_at", desc=True).execute()
                return jsonify({"orders": res.data or []}), 200

        # Case 2: Unauthenticated with explicit email or user ID query
        if query_user_id or query_email:
            query = client.table("orders").select("*, order_items(*)")
            if query_user_id and len(query_user_id) == 36 and "-" in query_user_id:
                query = query.eq("user_id", query_user_id)
            elif query_email:
                query = query.eq("shipping_address_snapshot->>email", query_email.lower())
            
            res = query.order("created_at", desc=True).execute()
            return jsonify({"orders": res.data or []}), 200

    except Exception as e:
        print(f"Error fetching orders: {e}")

    # Default to empty list when unauthenticated with no filter
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
