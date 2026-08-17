-- 1. Extend role enum with the super_admin (God Mode) tier
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
