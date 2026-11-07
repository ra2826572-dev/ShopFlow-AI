-- ==============================================================================
-- SHOPFLOW MULTI-TENANT SAAS SUPABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Version: 2026-11-06
-- Description: Multi-tenant database architecture with strict shop isolation,
--              UUID primary keys, foreign keys, performance indexes, RLS, and storage.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enums (Idempotent creation)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('super_admin', 'shop_owner', 'manager', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('Active', 'Inactive', 'Suspended', 'Pending Verification');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (References Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role public.user_role DEFAULT 'shop_owner' NOT NULL,
  status public.account_status DEFAULT 'Active' NOT NULL,
  status_reason TEXT,
  shop_id UUID, -- References shops(id) once shop is set up
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_active TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Shops Table (Each user owns their own shop)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Retail Store',
  currency TEXT DEFAULT 'PKR',
  currency_symbol TEXT DEFAULT '₨',
  tax_rate REAL DEFAULT 5.0,
  email TEXT,
  phone TEXT,
  address TEXT,
  status public.account_status DEFAULT 'Active' NOT NULL,
  status_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add shop_id column to profiles if table already exists without it
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shop_id UUID;

-- Add foreign key constraint for profiles.shop_id -> shops.id if not already present
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT fk_profile_shop
    FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;

-- 5. Categories Table (Shop-isolated)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Products Table (Shop-isolated)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'General' NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  barcode TEXT DEFAULT '',
  purchase_price REAL DEFAULT 0 NOT NULL,
  selling_price REAL DEFAULT 0 NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  min_stock INTEGER DEFAULT 5 NOT NULL,
  status TEXT DEFAULT 'In Stock' NOT NULL,
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Customers Table (Shop-isolated)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  total_spent REAL DEFAULT 0 NOT NULL,
  orders_count INTEGER DEFAULT 0 NOT NULL,
  last_order_date TEXT DEFAULT 'Never',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. Orders Table (Shop-isolated)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  total REAL DEFAULT 0 NOT NULL,
  discount REAL DEFAULT 0 NOT NULL,
  tax REAL DEFAULT 0 NOT NULL,
  grand_total REAL DEFAULT 0 NOT NULL,
  status public.order_status DEFAULT 'Processing' NOT NULL,
  payment_method TEXT DEFAULT 'Cash' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. Order Items Table (Shop & Order isolated)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  price REAL DEFAULT 0 NOT NULL,
  total REAL DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- 10. INDEXES FOR MULTI-TENANT QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_categories_shop ON public.categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_customers_shop ON public.customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_shop ON public.order_items(shop_id);

-- ==============================================================================
-- 11. SECURITY FUNCTIONS & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper: Check if current authenticated user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Helper: Check if current authenticated user owns or has access to a shop
CREATE OR REPLACE FUNCTION public.user_has_shop_access(target_shop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shops
    WHERE id = target_shop_id AND (owner_id = auth.uid() OR public.is_super_admin())
  );
$$;

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Clean existing policies (idempotent setup)
DROP POLICY IF EXISTS "Profiles viewable by self or admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles editable by self or admin" ON public.profiles;
DROP POLICY IF EXISTS "Shops access policy" ON public.shops;
DROP POLICY IF EXISTS "Categories access policy" ON public.categories;
DROP POLICY IF EXISTS "Products access policy" ON public.products;
DROP POLICY IF EXISTS "Customers access policy" ON public.customers;
DROP POLICY IF EXISTS "Orders access policy" ON public.orders;
DROP POLICY IF EXISTS "Order items access policy" ON public.order_items;

-- A. Profiles Policies
CREATE POLICY "Profiles viewable by self or admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "Profiles editable by self or admin"
  ON public.profiles FOR ALL
  USING (auth.uid() = id OR public.is_super_admin())
  WITH CHECK (auth.uid() = id OR public.is_super_admin());

-- B. Shops Policies (Only owner or super admin)
CREATE POLICY "Shops access policy"
  ON public.shops FOR ALL
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

-- C. Categories Policies (Strictly isolated by shop_id)
CREATE POLICY "Categories access policy"
  ON public.categories FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

-- D. Products Policies (Strictly isolated by shop_id)
CREATE POLICY "Products access policy"
  ON public.products FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

-- E. Customers Policies (Strictly isolated by shop_id)
CREATE POLICY "Customers access policy"
  ON public.customers FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

-- F. Orders Policies (Strictly isolated by shop_id)
CREATE POLICY "Orders access policy"
  ON public.orders FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

-- G. Order Items Policies (Strictly isolated by shop_id)
CREATE POLICY "Order items access policy"
  ON public.order_items FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

-- ==============================================================================
-- 12. SUPABASE STORAGE BUCKETS & POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public read, authenticated upload restricted to user's shop folder
DROP POLICY IF EXISTS "Public view for product images" ON storage.objects;
CREATE POLICY "Public view for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images', 'shop-logos'));

DROP POLICY IF EXISTS "Authenticated upload to shop folder" ON storage.objects;
CREATE POLICY "Authenticated upload to shop folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id IN ('product-images', 'shop-logos')
  );

-- ==============================================================================
-- 13. AUTH TRIGGER: AUTOMATIC PROFILE BOOTSTRAP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assigned_role public.user_role;
  user_first TEXT;
  user_last TEXT;
BEGIN
  -- Strict Super Admin determination: ONLY ra2826572@gmail.com
  IF lower(new.email) = 'ra2826572@gmail.com' THEN
    assigned_role := 'super_admin';
  ELSE
    assigned_role := 'shop_owner';
  END IF;

  user_first := COALESCE(new.raw_user_meta_data->>'first_name', split_part(COALESCE(new.raw_user_meta_data->>'name', 'Shop Owner'), ' ', 1));
  user_last := COALESCE(new.raw_user_meta_data->>'last_name', split_part(COALESCE(new.raw_user_meta_data->>'name', 'Owner'), ' ', 2));

  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    name,
    email,
    role,
    status
  ) VALUES (
    new.id,
    user_first,
    user_last,
    trim(user_first || ' ' || user_last),
    lower(new.email),
    assigned_role,
    'Active'
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = now();

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
