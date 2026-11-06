-- Migration: 20261105000001_add_user_registration_fields.sql
-- Description: Adds first_name and last_name to profiles, updates businesses and business_members for secure ShopFlow AI user registration.

-- 1. Ensure profiles table has first_name and last_name
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
  END IF;
END $$;

-- Populate first_name and last_name for existing records if empty
UPDATE public.profiles
SET 
  first_name = COALESCE(NULLIF(split_part(name, ' ', 1), ''), 'Store'),
  last_name = COALESCE(NULLIF(substr(name, length(split_part(name, ' ', 1)) + 2), ''), 'Owner')
WHERE first_name IS NULL OR last_name IS NULL;

-- 2. Ensure businesses table has owner_id referencing auth.users and created_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.businesses ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Ensure business_members defaults role to 'business_owner'
ALTER TABLE public.business_members ALTER COLUMN role SET DEFAULT 'business_owner'::user_role;

-- 4. Enable Row Level Security (RLS) policies on business_members
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view members of their own business" ON public.business_members
    FOR SELECT USING (
      business_id IN (
        SELECT bm.business_id FROM public.business_members bm WHERE bm.user_id = auth.uid()
      ) OR public.is_super_admin(auth.uid())
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Business owners can manage their business members" ON public.business_members
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id = business_id AND b.owner_id = auth.uid()
      ) OR public.is_super_admin(auth.uid())
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
