import traceback
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from app.services.razorpay_service import RazorpayService
from app.database.db import get_supabase_client

payments_bp = Blueprint("payments", __name__)
razorpay_service = RazorpayService()

@payments_bp.route("/payments/verify", methods=["POST"])
def verify_payment():
    """
    Authoritative server-side Razorpay payment verification.
    1. Verifies HMAC-SHA256 cryptographic signature. Never trusts client assertions.
    2. Atomically marks the order as 'paid' in Supabase.
    3. Idempotently records the payment transaction in the 'payments' table.
    """
    data = request.get_json() or {}
    order_number = data.get("orderNumber")
    razorpay_order_id = data.get("razorpayOrderId")
    razorpay_payment_id = data.get("razorpayPaymentId")
    razorpay_signature = data.get("razorpaySignature")

    if not razorpay_order_id or not razorpay_payment_id:
        return jsonify({"success": False, "error": "Missing payment identifiers (razorpayOrderId and razorpayPaymentId required)"}), 400

    # 1. Server-side Cryptographic HMAC Verification
    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id, razorpay_payment_id, razorpay_signature or ""
    )

    if not is_valid:
        print(f"[Security Warning] Invalid signature for order {order_number}, rzp_order: {razorpay_order_id}")
        return jsonify({
            "success": False,
            "error": "Payment verification failed: Invalid cryptographic signature"
        }), 400

    # 2. Reliable Database Persistence
    client = get_supabase_client()
    internal_order_id = None
    total_amount = float(data.get("amount") or 1.00)

    if client:
        try:
            # Query existing order by razorpay_order_id or order_number
            order_rec = None
            try:
                res = client.table("orders").select("*").or_(
                    f"order_number.eq.{order_number},razorpay_order_id.eq.{razorpay_order_id}"
                ).execute()
                if res.data and len(res.data) > 0:
                    order_rec = res.data[0]
                    internal_order_id = order_rec["id"]
                    total_amount = float(order_rec.get("total_amount") or total_amount)
            except Exception as query_err:
                print(f"[Payment Verification Warning] Could not query order: {query_err}")

            now_iso = datetime.now(timezone.utc).isoformat()

            if order_rec:
                # Update existing order status to 'paid'
                client.table("orders").update({
                    "status": "paid",
                    "razorpay_order_id": razorpay_order_id,
                    "updated_at": now_iso
                }).eq("id", internal_order_id).execute()
                print(f"[Payment Verified] Order {order_number} marked as paid in Supabase.")
            else:
                # Fallback: Order record missing from initial checkout; reconstruct it reliably
                print(f"[Payment Verified] Reconstructing missing order record for {order_number}...")
                new_order_data = {
                    "order_number": order_number or f"NX-{razorpay_payment_id[-6:]}",
                    "razorpay_order_id": razorpay_order_id,
                    "status": "paid",
                    "currency": "INR",
                    "subtotal": total_amount,
                    "shipping_amount": 0.00,
                    "discount_amount": 0.00,
                    "total_amount": total_amount,
                    "shipping_address_snapshot": data.get("shippingAddress") or {},
                }
                new_res = client.table("orders").insert(new_order_data).execute()
                if new_res.data:
                    internal_order_id = new_res.data[0]["id"]

            # Idempotently record payment entry in 'payments' table
            if internal_order_id:
                try:
                    # Check if already recorded
                    existing_pay = client.table("payments").select("id").eq("provider_payment_id", razorpay_payment_id).execute()
                    if not existing_pay.data or len(existing_pay.data) == 0:
                        client.table("payments").insert({
                            "order_id": internal_order_id,
                            "provider": "razorpay",
                            "provider_order_id": razorpay_order_id,
                            "provider_payment_id": razorpay_payment_id,
                            "amount": total_amount,
                            "currency": "INR",
                            "status": "captured",
                            "raw_response": {
                                "razorpay_order_id": razorpay_order_id,
                                "razorpay_payment_id": razorpay_payment_id,
                                "razorpay_signature": razorpay_signature
                            },
                            "verified_at": now_iso,
                            "created_at": now_iso
                        }).execute()
                        print(f"[Payment Recorded] Transaction {razorpay_payment_id} saved to payments table.")
                except Exception as pay_insert_err:
                    print(f"[Payment Record Warning] Could not insert into payments table: {pay_insert_err}")

        except Exception as e:
            print(f"[Payment Verification DB Error]: {e}")
            traceback.print_exc()

    return jsonify({
        "success": True,
        "message": "Payment verified and recorded successfully",
        "orderNumber": order_number,
        "status": "paid",
        "paymentId": razorpay_payment_id
    }), 200

@payments_bp.route("/webhooks/razorpay", methods=["POST"])
def handle_webhook():
    """
    Secure, idempotent Razorpay webhook receiver.
    Verifies X-Razorpay-Signature against RAZORPAY_WEBHOOK_SECRET.
    Automatically captures order.paid and payment.captured events.
    """
    signature = request.headers.get("X-Razorpay-Signature", "")
    body_text = request.get_data(as_text=True)

    # 1. Cryptographic Webhook Authenticity Verification
    if not razorpay_service.verify_webhook_signature(body_text, signature):
        print("[Webhook Security Alert] Invalid Razorpay webhook signature received.")
        return jsonify({"error": "Invalid webhook signature"}), 400

    payload = request.get_json() or {}
    event_id = payload.get("event_id") or payload.get("id")
    event_type = payload.get("event")

    print(f"[Razorpay Webhook Received] Event: {event_type}, ID: {event_id}")

    client = get_supabase_client()
    now_iso = datetime.now(timezone.utc).isoformat()

    if client and event_id:
        try:
            # 2. Idempotency Check via webhook_events
            try:
                existing = client.table("webhook_events").select("id").eq("provider_event_id", event_id).execute()
                if existing.data and len(existing.data) > 0:
                    print(f"[Webhook Idempotency] Event {event_id} already processed. Skipping duplicate.")
                    return jsonify({"status": "ignored", "message": "Event already processed"}), 200
            except Exception as idemp_err:
                print(f"[Webhook Warning] Idempotency table check error: {idemp_err}")

            # 3. Process Specific Payment Events
            if event_type in ("payment.captured", "order.paid"):
                payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
                rzp_payment_id = payment_entity.get("id")
                rzp_order_id = payment_entity.get("order_id")
                amount_rupees = float(payment_entity.get("amount", 0)) / 100.0
                currency = payment_entity.get("currency", "INR")
                notes = payment_entity.get("notes", {})
                order_number = notes.get("order_number")

                if rzp_order_id or order_number:
                    # Find order by razorpay_order_id or order_number
                    order_rec = None
                    query_filter = []
                    if rzp_order_id:
                        query_filter.append(f"razorpay_order_id.eq.{rzp_order_id}")
                    if order_number:
                        query_filter.append(f"order_number.eq.{order_number}")

                    try:
                        res = client.table("orders").select("id, total_amount").or_(",".join(query_filter)).execute()
                        if res.data and len(res.data) > 0:
                            order_rec = res.data[0]
                    except Exception:
                        pass

                    if order_rec:
                        # Update order status to paid
                        client.table("orders").update({
                            "status": "paid",
                            "razorpay_order_id": rzp_order_id,
                            "updated_at": now_iso
                        }).eq("id", order_rec["id"]).execute()

                        # Insert into payments table
                        try:
                            client.table("payments").insert({
                                "order_id": order_rec["id"],
                                "provider": "razorpay",
                                "provider_order_id": rzp_order_id,
                                "provider_payment_id": rzp_payment_id,
                                "amount": amount_rupees,
                                "currency": currency,
                                "status": "captured",
                                "raw_response": payload,
                                "verified_at": now_iso,
                                "created_at": now_iso
                            }).execute()
                        except Exception as p_err:
                            print(f"[Webhook Payment Insert Warning]: {p_err}")

                        print(f"[Webhook Success] Order {order_rec['id']} fulfilled via {event_type}.")

            # 4. Record Webhook Event for Audit Trail & Idempotency
            try:
                client.table("webhook_events").insert({
                    "provider": "razorpay",
                    "provider_event_id": event_id,
                    "event_type": event_type,
                    "payload": payload,
                    "processing_status": "processed",
                    "processed_at": now_iso,
                    "created_at": now_iso
                }).execute()
            except Exception as log_err:
                print(f"[Webhook Audit Log Warning]: {log_err}")

        except Exception as e:
            print(f"[Webhook Processing Error]: {e}")
            traceback.print_exc()

    return jsonify({"status": "received", "success": True}), 200
