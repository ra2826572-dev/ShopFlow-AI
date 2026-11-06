-- ShopFlow AI - Complete PostgreSQL Database Schema with Row Level Security (RLS)
-- Enables strict business-level data isolation, role-based authorization, subscriptions, and super admin control.

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'business_owner', 'manager', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('Active', 'Inactive', 'Suspended', 'Pending Verification');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('Free', 'Starter', 'Professional', 'Enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT DEFAULT 'Manage Your Business. Track Every Sale. Grow Smarter.',
  currency TEXT DEFAULT 'PKR',
  currency_symbol TEXT DEFAULT '₨',
  tax_rate NUMERIC(5,2) DEFAULT 5.00,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT DEFAULT 'Retail',
  status account_status DEFAULT 'Active' NOT NULL,
  status_reason TEXT,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  logo_url TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'business_owner' NOT NULL,
  status account_status DEFAULT 'Active' NOT NULL,
  status_reason TEXT,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  phone TEXT,
  avatar_url TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Business Members Table (Multi-Staff & RBAC)
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'business_owner' NOT NULL,
  status account_status DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- 5. Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name subscription_tier NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT DEFAULT 'Monthly' NOT NULL,
  max_products INT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb NOT NULL,
  status TEXT DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT DEFAULT 'Active' NOT NULL, -- Active, Expired, Cancelled, Trial
  price NUMERIC(10,2) NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  payment_status TEXT DEFAULT 'Paid' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Platform Payments Table (Real transaction records)
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'PKR' NOT NULL,
  plan_tier subscription_tier NOT NULL,
  payment_method TEXT NOT NULL, -- Bank Transfer, Card, JazzCash, EasyPaisa
  status TEXT DEFAULT 'Completed' NOT NULL, -- Completed, Pending, Refunded
  transaction_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  barcode TEXT,
  category TEXT NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL,
  selling_price NUMERIC(12,2) NOT NULL,
  stock INT DEFAULT 0 NOT NULL,
  min_stock INT DEFAULT 5 NOT NULL,
  status TEXT DEFAULT 'In Stock',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Orders & Order Items Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  total NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  grand_total NUMERIC(12,2) NOT NULL,
  status order_status DEFAULT 'Pending' NOT NULL,
  payment_method TEXT DEFAULT 'Cash' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  price NUMERIC(12,2) NOT NULL
);

-- 12. Customers, Suppliers, Expenses Tables
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  total_spent NUMERIC(12,2) DEFAULT 0,
  orders_count INT DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  supplied_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's business_id
CREATE OR REPLACE FUNCTION public.get_current_business_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  b_id UUID;
BEGIN
  SELECT business_id INTO b_id FROM public.profiles WHERE id = user_id;
  RETURN b_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
CREATE POLICY "Users can view own profile or Super Admin all" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_super_admin(auth.uid()));

CREATE POLICY "Super Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can access own active business" ON public.businesses
  FOR ALL USING (
    (id = public.get_current_business_id(auth.uid()) AND status = 'Active' AND is_deleted = FALSE)
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "Super Admins manage admin logs" ON public.admin_activity_logs
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super Admins manage system settings" ON public.system_settings
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Access own business products" ON public.products
  FOR ALL USING (business_id = public.get_current_business_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Access own business orders" ON public.orders
  FOR ALL USING (business_id = public.get_current_business_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Access own business expenses" ON public.expenses
  FOR ALL USING (business_id = public.get_current_business_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Access own business customers" ON public.customers
  FOR ALL USING (business_id = public.get_current_business_id(auth.uid()) OR public.is_super_admin(auth.uid()));

-- 14. Seed Default Subscription Plans
INSERT INTO public.subscription_plans (id, name, price, billing_cycle, max_products, features)
VALUES 
  ('plan_free', 'Free', 0, 'Monthly', 50, '["Basic Inventory", "1 Staff Account", "Sales Reports"]'::jsonb),
  ('plan_starter', 'Starter', 3500, 'Monthly', 500, '["Unlimited Orders", "3 Staff Accounts", "Export CSV", "Email Alerts"]'::jsonb),
  ('plan_pro', 'Professional', 8500, 'Monthly', 5000, '["Multi-Branch Support", "10 Staff Accounts", "AI Business Analyst", "Priority Support"]'::jsonb),
  ('plan_enterprise', 'Enterprise', 25000, 'Monthly', 50000, '["Unlimited Everything", "Dedicated Account Manager", "Custom API & Webhooks", "Automated Daily Backups"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
