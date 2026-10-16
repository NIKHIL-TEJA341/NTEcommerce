import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "nexus-ecommerce-api"

def test_get_products(client):
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.get_json()
    assert "products" in data
    assert len(data["products"]) > 0

def test_checkout_empty_cart(client):
    response = client.post("/api/v1/checkout", json={
        "items": [],
        "shippingAddress": {"recipientName": "Test", "phone": "9876543210"}
    })
    assert response.status_code == 400

def test_checkout_valid_calculation(client):
    response = client.post("/api/v1/checkout", json={
        "items": [{"productId": "p1", "quantity": 1}],
        "shippingAddress": {
            "recipientName": "Nikhil Sharma",
            "phone": "9876543210",
            "addressLine1": "100 Indiranagar",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postalCode": "560001"
        }
    })
    assert response.status_code == 201
    data = response.get_json()
    assert "orderNumber" in data
    assert data["totalAmount"] == 14999.00
    assert data["currency"] == "INR"
