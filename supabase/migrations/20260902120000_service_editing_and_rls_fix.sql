-- Phase 2: full service editability for admin + super_admin, and expandable
-- public service details.

-- 1. New column for the expandable "more details" section on the public
--    services page. Nullable — falls back to the short description if unset.
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS long_description text;

-- 2. Fix a real bug: has_role() does an EXACT role match, so a super_admin
--    (who typically does not also hold a separate literal 'admin' row) was
--    being silently blocked from editing services by the old policies below.
DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Admins can update services" ON public.services;
DROP POLICY IF EXISTS "Admins can delete services" ON public.services;

CREATE POLICY "Admins and super admins can insert services" ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins and super admins can update services" ON public.services
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins and super admins can delete services" ON public.services
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
