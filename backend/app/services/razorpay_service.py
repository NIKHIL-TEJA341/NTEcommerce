import os
import hmac
import hashlib
from typing import Dict, Any, Optional
import razorpay

class RazorpayService:
    def __init__(self):
        self.key_id = os.environ.get("RAZORPAY_KEY_ID")
        self.key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
        self.webhook_secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET")

        if self.key_id and self.key_secret and "your_key_id" not in self.key_id:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
        else:
            self.client = None

    def create_order(self, amount_rupees: float, order_number: str) -> Dict[str, Any]:
        """
        Creates an order on Razorpay.
        Amount must be in paise (1 INR = 100 paise).
        """
        amount_paise = int(round(amount_rupees * 100))
        
        if not self.client:
            # Simulated Razorpay order for development/demo mode
            return {
                "id": f"order_simulated_{order_number}",
                "entity": "order",
                "amount": amount_paise,
                "amount_paid": 0,
                "amount_due": amount_paise,
                "currency": "INR",
                "receipt": order_number,
                "status": "created",
                "attempts": 0,
                "is_simulated": True
            }

        data = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": order_number,
            "payment_capture": 1  # Auto capture
        }
        return self.client.order.create(data=data)

    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Verifies the HMAC-SHA256 signature returned by Razorpay Checkout.
        """
        if not self.client:
            # In simulated mode, accept valid-looking string
            return bool(razorpay_signature)

        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            self.key_secret.encode("utf-8"),
            msg.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(generated_signature, razorpay_signature)

    def verify_webhook_signature(self, webhook_body: str, signature: str) -> bool:
        """
        Verifies webhook authenticity against RAZORPAY_WEBHOOK_SECRET.
        """
        if not self.webhook_secret or not signature:
            return False

        generated_signature = hmac.new(
            self.webhook_secret.encode("utf-8"),
            webhook_body.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(generated_signature, signature)
