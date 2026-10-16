import os
from supabase import create_client, Client
from typing import Optional

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """
    Initializes and returns the singleton Supabase client using server-side credentials.
    Returns None if environment variables are not configured (allowing graceful local fallback).
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SECRET_KEY")

    if not supabase_url or not supabase_key or "your-project-id" in supabase_url:
        return None

    try:
        _supabase_client = create_client(supabase_url, supabase_key)
        return _supabase_client
    except Exception as e:
        print(f"Warning: Could not initialize Supabase client: {e}")
        return None
