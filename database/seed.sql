-- ==============================================================================
-- Seed Data: seed.sql
-- Description: Sample categories and products for local development & testing
-- Currency: INR (₹)
-- Note: Uses valid hexadecimal UUIDs (0-9, a-f) and safe ON CONFLICT upsert
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Insert Categories (Idempotent by id)
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, image_url, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'Audio & Wearables', 'audio-wearables', 'Premium wireless headphones, earbuds, and smart timepieces', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', TRUE),
('c1000000-0000-0000-0000-000000000002', 'Laptops & Computing', 'laptops-computing', 'High-performance laptops, mechanical keyboards, and studio gear', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', TRUE),
('c1000000-0000-0000-0000-000000000003', 'Modern Apparel', 'modern-apparel', 'Minimalist, elevated streetwear and handcrafted everyday essentials', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80', TRUE),
('c1000000-0000-0000-0000-000000000004', 'Home & Workspace', 'home-workspace', 'Ergonomic desk accessories, ceramics, and ambient lighting', 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=800&q=80', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 2. Insert Products (Idempotent by valid hexadecimal UUID)
-- ------------------------------------------------------------------------------
INSERT INTO public.products (
    id, category_id, name, slug, description, price, original_price, currency, stock_quantity, image_url, images, rating, reviews_count, is_active, is_featured
) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Aura ANC Studio Wireless Headphones',
    'aura-anc-studio-wireless-headphones',
    'Engineered with active noise cancellation, custom 40mm titanium drivers, and 45-hour battery life. Hand-stitched memory foam earcups for all-day comfort.',
    14999.00,
    18999.00,
    'INR',
    24,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    4.8,
    42,
    TRUE,
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'Pulse Horizon Smartwatch OLED',
    'pulse-horizon-smartwatch-oled',
    'Aerospace-grade titanium bezel with sapphire crystal glass. Features continuous ECG, SpO2 sensor, offline GPS, and 7-day battery endurance.',
    22499.00,
    26999.00,
    'INR',
    18,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    4.9,
    89,
    TRUE,
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000002',
    'ProKey Precision Mechanical Keyboard',
    'prokey-precision-mechanical-keyboard',
    'CNC machined aluminum case with custom lubricated linear switches, hot-swappable PCB, and PBT double-shot keycaps for satisfying acoustics.',
    8999.00,
    10999.00,
    'INR',
    35,
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    4.7,
    57,
    TRUE,
    TRUE
),
(
    'a1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000003',
    'Heavyweight Organic Cotton Oversized Hoodie',
    'heavyweight-organic-cotton-oversized-hoodie',
    '450 GSM pure organic French terry cotton. Preshrunk with drop-shoulder tailoring and double-needle ribbed hems. Built to last a lifetime.',
    3499.00,
    4499.00,
    'INR',
    50,
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
    ],
    4.6,
    114,
    TRUE,
    FALSE
),
(
    'a1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000004',
    'Solid Walnut Desktop Monitor Stand',
    'solid-walnut-desktop-monitor-stand',
    'Handcrafted from sustainable American black walnut with brushed anodized aluminum legs and integrated felt storage tray.',
    4999.00,
    6499.00,
    'INR',
    12,
    'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=800&q=80'
    ],
    4.9,
    31,
    TRUE,
    FALSE
),
(
    'a1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000001',
    'Acoustic Wave Pro Hi-Fi Speaker',
    'acoustic-wave-pro-hi-fi-speaker',
    'Dual passive radiators with lossless aptX HD Bluetooth audio, 60W RMS power, and woven acoustic fabric exterior.',
    11999.00,
    14999.00,
    'INR',
    15,
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    4.7,
    28,
    TRUE,
    FALSE
)
ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    currency = EXCLUDED.currency,
    stock_quantity = EXCLUDED.stock_quantity,
    image_url = EXCLUDED.image_url,
    images = EXCLUDED.images,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    is_active = EXCLUDED.is_active,
    is_featured = EXCLUDED.is_featured;
