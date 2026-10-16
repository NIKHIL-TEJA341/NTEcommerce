import os
from flask import Blueprint, request, jsonify
from app.services.order_service import OrderService
from app.services.razorpay_service import RazorpayService
from app.database.db import get_supabase_client

checkout_bp = Blueprint("checkout", __name__)
razorpay_service = RazorpayService()

@checkout_bp.route("/checkout", methods=["POST"])
def create_checkout():
    data = request.get_json() or {}
    items = data.get("items", [])
    shipping_address = data.get("shippingAddress")

    if not items:
        return jsonify({"error": "Cart items are required"}), 400

    if not shipping_address or not (shipping_address.get("recipientName") or shipping_address.get("fullName")) or not shipping_address.get("phone"):
        return jsonify({"error": "Valid shipping address and phone number are required"}), 400

    # 1. Server-side cart validation and price calculation (never trust client amounts!)
    subtotal, shipping, total, validated_items, err = OrderService.validate_and_calculate_cart(items)
    if err:
        return jsonify({"error": err}), 400

    # 2. Generate unique internal order number
    order_number = OrderService.generate_order_number()

    # 3. Create server-side Razorpay order
    rzp_order = razorpay_service.create_order(amount_rupees=total, order_number=order_number)

    # 4. Save pending order to Supabase if connected
    client = get_supabase_client()
    internal_order_id = f"ord_{order_number}"

    if client:
        try:
            order_data = {
                "order_number": order_number,
                "status": "pending_payment",
                "currency": "INR",
                "subtotal": subtotal,
                "shipping_amount": shipping,
                "discount_amount": 0.00,
                "total_amount": total,
                "shipping_address_snapshot": shipping_address,
            }
            order_res = client.table("orders").insert(order_data).execute()
            if order_res.data and len(order_res.data) > 0:
                internal_order_id = order_res.data[0]["id"]
                # Insert order items snapshot
                for v_item in validated_items:
                    try:
                        p_id = v_item["productId"]
                        # Only insert valid UUIDs into PostgreSQL foreign key column
                        db_pid = p_id if (isinstance(p_id, str) and len(p_id) == 36 and "-" in p_id) else None
                        client.table("order_items").insert({
                            "order_id": internal_order_id,
                            "product_id": db_pid,
                            "product_name_snapshot": v_item["productNameSnapshot"],
                            "unit_price": v_item["unitPrice"],
                            "quantity": v_item["quantity"],
                            "line_total": v_item["lineTotal"]
                        }).execute()
                    except Exception as item_err:
                        print(f"Warning: could not insert order item: {item_err}")
        except Exception as e:
            print(f"Warning: Could not persist pending order to DB: {e}")

    return jsonify({
        "orderNumber": order_number,
        "internalOrderId": internal_order_id,
        "razorpayOrderId": rzp_order.get("id"),
        "subtotal": subtotal,
        "shippingAmount": shipping,
        "totalAmount": total,
        "currency": "INR",
        "keyId": os.environ.get("RAZORPAY_KEY_ID", "rzp_test_public_key"),
        "status": "pending_payment"
    }), 201
