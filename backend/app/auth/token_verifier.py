from functools import wraps
from flask import request, jsonify, g
from app.database.db import get_supabase_client

def verify_token_from_header():
    """Extracts and verifies Bearer token from the Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    client = get_supabase_client()
    if not client:
        # If running in local mock development mode without live Supabase
        return {"id": "mock-user-123", "email": "test@nexusgear.in", "role": "admin"}

    try:
        user_response = client.auth.get_user(token)
        if user_response and user_response.user:
            return user_response.user
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

    return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = verify_token_from_header()
        if not user:
            return jsonify({"error": "Unauthorized", "message": "Valid Bearer token required"}), 401
        g.user = user
        return f(*args, **kwargs)
    return decorated

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = verify_token_from_header()
        if not user:
            return jsonify({"error": "Unauthorized", "message": "Valid Bearer token required"}), 401

        # Check role from user_roles table or metadata
        client = get_supabase_client()
        if client:
            user_id = user.id if hasattr(user, "id") else user.get("id")
            res = client.table("user_roles").select("role").eq("user_id", user_id).eq("role", "admin").execute()
            if not res.data or len(res.data) == 0:
                return jsonify({"error": "Forbidden", "message": "Administrator privileges required"}), 403
        
        g.user = user
        return f(*args, **kwargs)
    return decorated
