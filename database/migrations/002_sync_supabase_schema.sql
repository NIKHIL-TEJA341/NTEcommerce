-- ==============================================================================
-- Migration: 002_sync_supabase_schema.sql
-- Description: Non-destructive schema sync to align existing Supabase tables with PRD requirements
-- Safe to execute: Uses ADD COLUMN IF NOT EXISTS, CREATE TABLE IF NOT EXISTS, and IF NOT EXISTS policy guards
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Create Missing Core Tables
-- ------------------------------------------------------------------------------

-- User Roles Table (Required for Admin Role Verification)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (user_id, role)
);

-- Product Variants Table (Required for Size/Color/Switch SKU Variants)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    price_override NUMERIC(12, 2) CHECK (price_override IS NULL OR price_override >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. Add Missing Columns to Existing Tables (Zero Data Loss)
-- ------------------------------------------------------------------------------

-- Categories: image_url
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Products: original_price, images gallery, rating, reviews_count, is_featured
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS original_price NUMERIC(12, 2) CHECK (original_price IS NULL OR original_price >= price),
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE NOT NULL;

-- Profiles: avatar_url
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Addresses: is_default
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE NOT NULL;

-- Orders: notes
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Cart Items: variant_id
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE;

-- Order Items: variant_id, sku_snapshot
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sku_snapshot TEXT;

-- Webhook Events: payload
ALTER TABLE public.webhook_events 
ADD COLUMN IF NOT EXISTS payload JSONB;

-- ------------------------------------------------------------------------------
-- 3. Helper Functions, Performance Indexes & RLS Policies
-- ------------------------------------------------------------------------------

-- is_admin helper function (Checks trusted user_roles table)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on newly created tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- User Roles Policies (Guarded by tablename and policyname)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage user roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own role' AND tablename = 'user_roles') THEN
    CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Product Variants Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active variants' AND tablename = 'product_variants') THEN
    CREATE POLICY "Anyone can view active variants" ON public.product_variants FOR SELECT USING (is_active = TRUE OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage variants' AND tablename = 'product_variants') THEN
    CREATE POLICY "Admins manage variants" ON public.product_variants FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Categories & Products Admin Management Policies (If not already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage categories' AND tablename = 'categories') THEN
    CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage products' AND tablename = 'products') THEN
    CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
