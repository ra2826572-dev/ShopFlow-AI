import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  Loader2, 
  Key, 
  Globe, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  getSupabaseConfig, 
  updateSupabaseConfig, 
  testSupabaseConnection 
} from '../lib/supabase';

export const SettingsView: React.FC = () => {
  const { data, updateSettings } = useApp();
  const business = data?.business;

  const [form, setForm] = useState({
    name: business?.name || '',
    tagline: business?.description || (business as any)?.tagline || '',
    currency: business?.currency || 'PKR',
    currencySymbol: business?.currencySymbol || '₨',
    taxRate: business?.taxRate || 5,
    email: business?.email || '',
    phone: business?.phone || '',
    address: business?.address || '',
  });

  const [success, setSuccess] = useState(false);

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);
  const [supabaseSaveSuccess, setSupabaseSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setSupabaseUrl(cfg.url);
    setSupabaseAnonKey(cfg.anonKey);
    if (cfg.isConfigured) {
      testSupabaseConnection().then(setSupabaseStatus);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleTestSupabase = async () => {
    setIsTesting(true);
    setSupabaseStatus(null);
    const res = await testSupabaseConnection();
    setSupabaseStatus(res);
    setIsTesting(false);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSupabase(true);
    const res = updateSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setIsSavingSupabase(false);

    if (res.success) {
      setSupabaseSaveSuccess(true);
      setTimeout(() => setSupabaseSaveSuccess(false), 4000);
      handleTestSupabase();
    } else {
      setSupabaseStatus({ connected: false, message: res.error || 'Invalid configuration' });
    }
  };

  const handleCopySql = () => {
    const sqlScript = `-- ==============================================================================
-- SHOPFLOW MULTI-TENANT SAAS SUPABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Fully Idempotent - Fixes "type user_role already exists" error
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums (Safe Idempotent Creation)
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

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role public.user_role DEFAULT 'shop_owner' NOT NULL,
  status public.account_status DEFAULT 'Active' NOT NULL,
  status_reason TEXT,
  shop_id UUID,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_active TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Shops Table (Each user gets a separate shop)
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

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Products Table
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

-- 5. Customers Table
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

-- 6. Orders Table
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

-- 7. Order Items Table
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

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.user_has_shop_access(target_shop_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shops
    WHERE id = target_shop_id AND (owner_id = auth.uid() OR public.is_super_admin())
  );
$$;

-- RLS Policies
DROP POLICY IF EXISTS "Shops access policy" ON public.shops;
CREATE POLICY "Shops access policy" ON public.shops FOR ALL
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "Products access policy" ON public.products;
CREATE POLICY "Products access policy" ON public.products FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

DROP POLICY IF EXISTS "Orders access policy" ON public.orders;
CREATE POLICY "Orders access policy" ON public.orders FOR ALL
  USING (public.user_has_shop_access(shop_id))
  WITH CHECK (public.user_has_shop_access(shop_id));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true) ON CONFLICT (id) DO UPDATE SET public = true;`;

    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-4xl font-sans pb-16">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">System & Business Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure your store identity, currency, and Supabase Cloud database connection.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. STORE PROFILE & GENERAL DEFAULTS                           */}
      {/* ------------------------------------------------------------- */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold animate-in fade-in">
          Store settings updated successfully!
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
          <Settings className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-extrabold text-slate-800">Store Profile & Invoicing Defaults</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Business Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => {
                  const curr = e.target.value;
                  const sym = curr === 'PKR' ? '₨' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : '£';
                  setForm({ ...form, currency: curr, currencySymbol: sym });
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="PKR">PKR (₨)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Symbol</label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tax Rate (%)</label>
              <input
                type="number"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Business Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Business Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-md hover:bg-purple-700 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Store Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
