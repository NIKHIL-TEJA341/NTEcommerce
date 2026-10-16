import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    print(f"🚀 Starting NEXUS E-Commerce Flask API on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
