import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "nexus-default-secret-key")

    # Restrictive CORS configuration
    frontend_origin = os.environ.get("FRONTEND_ORIGIN", "*")
    CORS(app, origins=[frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"], supports_credentials=True)

    # Root welcome route
    @app.route("/", methods=["GET"])
    def root_welcome():
        return jsonify({
            "service": "NEXUS E-Commerce REST API",
            "status": "online",
            "version": "1.0.0",
            "api_base": "/api/v1",
            "endpoints": [
                "/api/v1/health",
                "/api/v1/products",
                "/api/v1/categories",
                "/api/v1/checkout",
                "/api/v1/orders",
                "/api/v1/admin/analytics"
            ]
        }), 200

    # Register blueprints under /api/v1
    from app.routes.health import health_bp
    from app.routes.products import products_bp
    from app.routes.checkout import checkout_bp
    from app.routes.payments import payments_bp
    from app.routes.orders import orders_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(products_bp, url_prefix="/api/v1")
    app.register_blueprint(checkout_bp, url_prefix="/api/v1")
    app.register_blueprint(payments_bp, url_prefix="/api/v1")
    app.register_blueprint(orders_bp, url_prefix="/api/v1")
    app.register_blueprint(admin_bp, url_prefix="/api/v1")

    return app

# Expose app instance directly so `gunicorn app:app` finds it inside the `app` package
app = create_app()
