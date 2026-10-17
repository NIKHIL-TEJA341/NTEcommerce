-- ==============================================================================
-- Migration: 003_fix_razorpay_orders_rls.sql
-- Description: Ensures reliable server-side persistence for Razorpay orders, order items,
--              payments, and webhook events with full service_role RLS permissions.
-- Safe to execute: Fully idempotent with IF NOT EXISTS guards
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Ensure Columns Exist on Orders Table
-- ------------------------------------------------------------------------------
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS customer_email TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ------------------------------------------------------------------------------
-- 2. Ensure Payments Table Exists with Proper Constraints
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    provider_order_id TEXT,
    provider_payment_id TEXT UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    status TEXT NOT NULL DEFAULT 'captured',
    raw_response JSONB DEFAULT '{}'::jsonb,
    verified_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON public.payments(provider_payment_id);

-- ------------------------------------------------------------------------------
-- 3. Ensure Webhook Events Table Exists
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'razorpay',
    provider_event_id TEXT UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB,
    processing_status TEXT DEFAULT 'processed',
    processed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_id ON public.webhook_events(provider_event_id);

-- ------------------------------------------------------------------------------
-- 4. Grant Table Permissions to Service Role & Authenticated Clients
-- ------------------------------------------------------------------------------
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.webhook_events TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT SELECT, INSERT ON public.payments TO authenticated;

-- ------------------------------------------------------------------------------
-- 5. RLS Policies: Allow Server-Side Inserts & Updates
-- ------------------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Orders Policies
DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;
CREATE POLICY "Service role full access on orders" ON public.orders
FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow checkout creation on orders" ON public.orders;
CREATE POLICY "Allow checkout creation on orders" ON public.orders
FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow authenticated view own orders" ON public.orders;
CREATE POLICY "Allow authenticated view own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR customer_email = auth.jwt()->>'email');

-- Order Items Policies
DROP POLICY IF EXISTS "Service role full access on order_items" ON public.order_items;
CREATE POLICY "Service role full access on order_items" ON public.order_items
FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow order items insertion" ON public.order_items;
CREATE POLICY "Allow order items insertion" ON public.order_items
FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow order items selection" ON public.order_items;
CREATE POLICY "Allow order items selection" ON public.order_items
FOR SELECT USING (TRUE);

-- Payments Policies
DROP POLICY IF EXISTS "Service role full access on payments" ON public.payments;
CREATE POLICY "Service role full access on payments" ON public.payments
FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow payments insertion" ON public.payments;
CREATE POLICY "Allow payments insertion" ON public.payments
FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow payments selection" ON public.payments;
CREATE POLICY "Allow payments selection" ON public.payments
FOR SELECT USING (TRUE);

-- Webhook Events Policies
DROP POLICY IF EXISTS "Service role full access on webhook_events" ON public.webhook_events;
CREATE POLICY "Service role full access on webhook_events" ON public.webhook_events
FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow webhook events insertion" ON public.webhook_events;
CREATE POLICY "Allow webhook events insertion" ON public.webhook_events
FOR ALL USING (TRUE) WITH CHECK (TRUE);
