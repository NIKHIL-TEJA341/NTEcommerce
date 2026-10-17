import os
import traceback
from flask import Blueprint, request, jsonify
from app.services.order_service import OrderService
from app.services.razorpay_service import RazorpayService
from app.database.db import get_supabase_client
from app.auth.token_verifier import verify_token_from_header

checkout_bp = Blueprint("checkout", __name__)
razorpay_service = RazorpayService()

@checkout_bp.route("/checkout", methods=["POST"])
def create_checkout():
    """
    Creates a server-side Razorpay order and reliably records a pending order in Supabase.
    Never trusts client amounts; enforces authoritative server-side price calculation.
    """
    data = request.get_json() or {}
    items = data.get("items", [])
    shipping_address = data.get("shippingAddress") or {}

    if not items:
        return jsonify({"error": "Cart items are required"}), 400

    if not shipping_address or not (shipping_address.get("recipientName") or shipping_address.get("fullName")) or not shipping_address.get("phone"):
        return jsonify({"error": "Valid shipping address and phone number are required"}), 400

    # 1. Authoritative Customer Identification
    user = verify_token_from_header()
    user_id = None
    if user:
        raw_uid = user.id if hasattr(user, "id") else user.get("id")
        if isinstance(raw_uid, str) and len(raw_uid) == 36 and "-" in raw_uid:
            user_id = raw_uid
    elif data.get("userId"):
        cand_id = data.get("userId")
        if isinstance(cand_id, str) and len(cand_id) == 36 and "-" in cand_id:
            user_id = cand_id

    customer_email = None
    if user:
        customer_email = (user.email if hasattr(user, "email") else user.get("email") or "").lower()
    elif data.get("customerEmail"):
        customer_email = data.get("customerEmail").strip().lower()
    elif shipping_address.get("email"):
        customer_email = shipping_address.get("email").strip().lower()

    if customer_email:
        shipping_address["email"] = customer_email

    # 2. Server-side cart validation and price calculation (Authoritative Pricing)
    subtotal, shipping, total, validated_items, err = OrderService.validate_and_calculate_cart(items)
    if err:
        return jsonify({"error": err}), 400

    # 3. Generate unique internal order number
    order_number = OrderService.generate_order_number()

    # 4. Create authoritative server-side Razorpay order
    try:
        rzp_order = razorpay_service.create_order(amount_rupees=total, order_number=order_number)
    except Exception as rzp_err:
        print(f"[Razorpay Service Error] Could not create order: {rzp_err}")
        return jsonify({"error": f"Payment gateway error: {str(rzp_err)}"}), 502

    razorpay_order_id = rzp_order.get("id")
    if not razorpay_order_id:
        return jsonify({"error": "Failed to generate Razorpay order ID"}), 502

    # 5. Persist pending order to Supabase
    client = get_supabase_client()
    internal_order_id = f"ord_{order_number}"

    if client:
        try:
            order_data = {
                "order_number": order_number,
                "razorpay_order_id": razorpay_order_id,
                "user_id": user_id,
                "customer_email": customer_email,
                "status": "pending_payment",
                "currency": "INR",
                "subtotal": subtotal,
                "shipping_amount": shipping,
                "discount_amount": 0.00,
                "total_amount": total,
                "shipping_address_snapshot": shipping_address,
            }

            try:
                order_res = client.table("orders").insert(order_data).execute()
            except Exception as insert_err:
                # If foreign key on user_id fails (e.g. unconfirmed user in auth.users), retry with user_id = None
                if user_id:
                    print(f"[Checkout Warning] Retrying order insert with user_id=None due to: {insert_err}")
                    order_data["user_id"] = None
                    order_res = client.table("orders").insert(order_data).execute()
                else:
                    raise insert_err

            if order_res.data and len(order_res.data) > 0:
                internal_order_id = order_res.data[0]["id"]

                # Insert line items snapshot
                for v_item in validated_items:
                    try:
                        p_id = v_item["productId"]
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
                        print(f"[Checkout Warning] Could not insert order item: {item_err}")

                print(f"[Checkout Success] Pending order created in Supabase: {order_number} (ID: {internal_order_id})")

        except Exception as db_err:
            print(f"[Checkout Error] Could not persist pending order to DB: {db_err}")
            traceback.print_exc()

    return jsonify({
        "orderNumber": order_number,
        "internalOrderId": internal_order_id,
        "razorpayOrderId": razorpay_order_id,
        "subtotal": subtotal,
        "shippingAmount": shipping,
        "totalAmount": total,
        "currency": "INR",
        "keyId": razorpay_service.key_id or os.environ.get("RAZORPAY_KEY_ID", "rzp_test_public_key"),
        "status": "pending_payment"
    }), 201
