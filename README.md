# NEXUS — Modern Full-Stack E-Commerce Platform

> Portfolio-quality, production-ready e-commerce platform tailored for the Indian market, featuring React 19, TypeScript, Tailwind CSS, Python Flask REST API, Supabase PostgreSQL, and Razorpay test-mode payment gateway integration.

---

## 1. System Architecture

```text
ecommerce-platform/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Navbar, Footer, HeroBanner, ProductCard, CartDrawer, etc.
│   │   ├── pages/                # HomePage, CatalogPage, ProductDetailPage, CheckoutPage, OrdersPage, AdminPage
│   │   ├── store/                # Zustand persistent client cart store
│   │   ├── services/             # API client connecting to Flask /api/v1
│   │   ├── types/                # TypeScript interfaces (Product, Order, Variant, Address)
│   │   └── data/                 # Rich catalog fallback data (₹ INR)
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Python 3 + Flask REST API
│   ├── app/
│   │   ├── routes/               # /health, /products, /checkout, /payments, /orders, /admin
│   │   ├── services/             # Razorpay payment & Order pricing services
│   │   ├── auth/                 # Token verification & role-based permissions
│   │   └── database/             # Supabase PostgreSQL client
│   ├── tests/                    # Pytest test suite
│   ├── app.py                    # Entry point (Gunicorn-ready for Render)
│   └── requirements.txt
├── database/
│   ├── migrations/               # 001_initial_schema.sql (12 core tables & RLS policies)
│   └── seed.sql                  # Initial categories & products priced in INR (₹)
├── .gitignore
└── README.md
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite | Fast, responsive UI with strict type safety |
| **Styling** | Tailwind CSS v4 | Dark mode aesthetic, glassmorphic UI, responsive layouts |
| **State Management** | Zustand | Persistent local cart state with live quantity & stock checks |
| **Backend** | Python 3 + Flask | Trusted REST API (`/api/v1`) & WSGI server (Gunicorn) |
| **Database & Auth** | Supabase PostgreSQL | Managed relational database with Row Level Security (RLS) |
| **Payment Gateway** | Razorpay (Test Mode) | Server-side order creation, HMAC signature verification & webhooks |
| **Deployment** | Vercel (Frontend) & Render (Backend) | ₹0 free-tier budget architecture |

---

## 3. Getting Started Locally

### Prerequisites
- **Node.js**: v18+ (tested on v22)
- **Python**: 3.10+ (tested on 3.13)
- **Git**

---

### Step 1: Run the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 2: Run the Backend (Flask API)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
5. Start the Flask API:
   ```bash
   python app.py
   ```
   The API will be available at [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health).

---

## 4. Database Setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run the schema script: [`database/migrations/001_initial_schema.sql`](database/migrations/001_initial_schema.sql).
4. Run the seed data script: [`database/seed.sql`](database/seed.sql).
5. Copy your **Project URL** and **Service Role Key** to `backend/.env`.

---

## 5. Razorpay Test Mode Setup

1. Sign up for a free test account at [razorpay.com](https://razorpay.com).
2. Navigate to **Account & Settings > API Keys** and generate **Test Keys**.
3. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env`.
4. Add `VITE_RAZORPAY_KEY_ID` to `frontend/.env`.

---

## 6. Key Endpoints (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health check |
| `GET` | `/api/v1/products` | Catalog search & category filter |
| `GET` | `/api/v1/products/<id>` | Product details with specs & variants |
| `GET` | `/api/v1/categories` | Active categories |
| `POST` | `/api/v1/checkout` | Recalculates cart server-side & creates Razorpay order |
| `POST` | `/api/v1/payments/verify` | Verifies HMAC-SHA256 signature & marks order paid |
| `POST` | `/api/v1/webhooks/razorpay` | Idempotent webhook event receiver |
| `GET` | `/api/v1/orders` | Customer order history |
| `GET` | `/api/v1/admin/orders` | Admin orders listing |
| `PATCH` | `/api/v1/admin/orders/<id>/status` | Update fulfillment status (`paid`, `shipped`, etc.) |
| `GET` | `/api/v1/admin/analytics` | Sales & inventory KPIs |

---

## 7. Security Highlights

- **Server-Side Price Authority:** Client-provided prices are never trusted during checkout. Prices and inventory are verified from the server/database.
- **HMAC Signature Verification:** Payment callbacks and webhook events verify cryptographic signatures before mutating order statuses.
- **Zero Sensitive Credential Exposure:** Secret keys (`RAZORPAY_KEY_SECRET`, `SUPABASE_SECRET_KEY`) remain strictly on the backend.
- **Row Level Security (RLS):** Supabase database policies restrict public data read access and protect customer orders and addresses.
