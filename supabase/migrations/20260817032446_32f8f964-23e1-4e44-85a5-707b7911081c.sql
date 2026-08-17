-- Helper: role membership check (service-definer, callable by signed-in users is NOT granted;
-- policies use inline EXISTS instead, per project security policy)

-- =========================================================
-- AUDIT LOGS
-- =========================================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can read audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

CREATE POLICY "Signed in staff can write their own audit entries"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

-- =========================================================
-- STAFF ACCOUNTS
-- =========================================================
CREATE TABLE public.staff_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  job_title text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_accounts TO authenticated;
GRANT ALL ON public.staff_accounts TO service_role;
ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read their own account row"
ON public.staff_accounts FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admins can read staff accounts"
ON public.staff_accounts FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

CREATE POLICY "Super admins can insert staff accounts"
ON public.staff_accounts FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

CREATE POLICY "Super admins can update staff accounts"
ON public.staff_accounts FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

CREATE POLICY "Super admins can delete staff accounts"
ON public.staff_accounts FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_staff_accounts_updated_at
BEFORE UPDATE ON public.staff_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- USER ROLES: super admin management
-- =========================================================
CREATE POLICY "Super admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

CREATE POLICY "Super admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

CREATE POLICY "Super admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- =========================================================
-- SERVICES: staff can toggle, super admins can manage
-- =========================================================
DROP POLICY IF EXISTS "Admins can update services" ON public.services;
DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Admins can delete services" ON public.services;

CREATE POLICY "Staff and admins can update services"
ON public.services FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('staff'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('staff'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role)
));

CREATE POLICY "Super admins can insert services"
ON public.services FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

CREATE POLICY "Super admins can delete services"
ON public.services FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

-- =========================================================
-- QUOTE REQUESTS
-- =========================================================
DROP POLICY IF EXISTS "Admins can read quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins can update quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins can delete quote requests" ON public.quote_requests;

CREATE POLICY "Staff and admins can read quote requests"
ON public.quote_requests FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('staff'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role)
));

CREATE POLICY "Staff and admins can update quote requests"
ON public.quote_requests FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('staff'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('staff'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role)
));

CREATE POLICY "Super admins can delete quote requests"
ON public.quote_requests FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

-- =========================================================
-- CONTACT MESSAGES
-- =========================================================
DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;

CREATE POLICY "Staff and admins can read contact messages"
ON public.contact_messages FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('staff'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role)
));

CREATE POLICY "Staff and admins can update contact messages"
ON public.contact_messages FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('staff'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('staff'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role)
));

CREATE POLICY "Super admins can delete contact messages"
ON public.contact_messages FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::public.app_role
));

GRANT DELETE ON public.contact_messages TO authenticated;
