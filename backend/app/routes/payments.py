from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from app.services.razorpay_service import RazorpayService
from app.database.db import get_supabase_client

payments_bp = Blueprint("payments", __name__)
razorpay_service = RazorpayService()

@payments_bp.route("/payments/verify", methods=["POST"])
def verify_payment():
    data = request.get_json() or {}
    order_number = data.get("orderNumber")
    razorpay_order_id = data.get("razorpayOrderId")
    razorpay_payment_id = data.get("razorpayPaymentId")
    razorpay_signature = data.get("razorpaySignature")

    if not razorpay_order_id or not razorpay_payment_id:
        return jsonify({"error": "Missing payment identifiers"}), 400

    # 1. Verify signature
    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id, razorpay_payment_id, razorpay_signature or ""
    )

    if not is_valid:
        return jsonify({
            "success": False,
            "error": "Payment verification failed: Invalid signature"
        }), 400

    # 2. Update order status and record payment in database
    client = get_supabase_client()
    if client and order_number:
        try:
            # Update order
            client.table("orders").update({
                "status": "paid",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("order_number", order_number).execute()

            # Record payment entry
            order_res = client.table("orders").select("id, total_amount").eq("order_number", order_number).execute()
            if order_res.data:
                order_rec = order_res.data[0]
                client.table("payments").insert({
                    "order_id": order_rec["id"],
                    "provider": "razorpay",
                    "provider_order_id": razorpay_order_id,
                    "provider_payment_id": razorpay_payment_id,
                    "amount": order_rec["total_amount"],
                    "currency": "INR",
                    "status": "captured",
                    "verified_at": datetime.now(timezone.utc).isoformat()
                }).execute()
        except Exception as e:
            print(f"Warning: Could not update order in DB: {e}")

    return jsonify({
        "success": True,
        "message": "Payment verified successfully",
        "orderNumber": order_number,
        "status": "paid",
        "paymentId": razorpay_payment_id
    }), 200

@payments_bp.route("/webhooks/razorpay", methods=["POST"])
def handle_webhook():
    signature = request.headers.get("X-Razorpay-Signature", "")
    body_text = request.get_data(as_text=True)

    # 1. Verify webhook authenticity
    if not razorpay_service.verify_webhook_signature(body_text, signature):
        return jsonify({"error": "Invalid webhook signature"}), 400

    payload = request.get_json() or {}
    event_id = payload.get("event_id") or payload.get("id")
    event_type = payload.get("event")

    client = get_supabase_client()
    if client and event_id:
        try:
            # Check idempotency
            existing = client.table("webhook_events").select("id").eq("provider_event_id", event_id).execute()
            if existing.data and len(existing.data) > 0:
                return jsonify({"status": "ignored", "message": "Event already processed"}), 200

            # Record webhook event
            client.table("webhook_events").insert({
                "provider": "razorpay",
                "provider_event_id": event_id,
                "event_type": event_type,
                "payload": payload,
                "processing_status": "processed",
                "processed_at": datetime.now(timezone.utc).isoformat()
            }).execute()

            # Handle event specifics
            if event_type == "payment.captured":
                payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
                rzp_order_id = payment_entity.get("order_id")
                # Update corresponding order status
                print(f"Captured payment for order {rzp_order_id}")
        except Exception as e:
            print(f"Webhook processing error: {e}")

    return jsonify({"status": "received"}), 200
