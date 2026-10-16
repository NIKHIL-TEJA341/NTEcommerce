from datetime import datetime, timezone
from flask import Blueprint, jsonify
from app.database.db import get_supabase_client

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    client = get_supabase_client()
    db_status = "connected" if client else "local_fallback"
    
    return jsonify({
        "status": "healthy",
        "service": "nexus-ecommerce-api",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_status
    }), 200
