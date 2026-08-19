-- The role-check helper must be callable by signed-in users: it is SECURITY
-- DEFINER so it bypasses RLS on user_roles, which is exactly what breaks the
-- infinite-recursion loop caused by inline EXISTS subqueries on user_roles.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('staff','admin','super_admin')
  )
$$;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

-- user_roles
DROP POLICY IF EXISTS "Super admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;
CREATE POLICY "Super admins can read all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can insert roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can update roles" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can delete roles" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- services
DROP POLICY IF EXISTS "Staff and admins can update services" ON public.services;
DROP POLICY IF EXISTS "Super admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Super admins can delete services" ON public.services;
CREATE POLICY "Staff and admins can update services" ON public.services FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Super admins can insert services" ON public.services FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can delete services" ON public.services FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- quote_requests
DROP POLICY IF EXISTS "Staff and admins can read quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Staff and admins can update quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Super admins can delete quote requests" ON public.quote_requests;
CREATE POLICY "Staff and admins can read quote requests" ON public.quote_requests FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff and admins can update quote requests" ON public.quote_requests FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Super admins can delete quote requests" ON public.quote_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- contact_messages
DROP POLICY IF EXISTS "Staff and admins can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Staff and admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Super admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Staff and admins can read contact messages" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff and admins can update contact messages" ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Super admins can delete contact messages" ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- audit_logs
DROP POLICY IF EXISTS "Super admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Super admins can read audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- staff_accounts
DROP POLICY IF EXISTS "Super admins can read staff accounts" ON public.staff_accounts;
DROP POLICY IF EXISTS "Super admins can insert staff accounts" ON public.staff_accounts;
DROP POLICY IF EXISTS "Super admins can update staff accounts" ON public.staff_accounts;
DROP POLICY IF EXISTS "Super admins can delete staff accounts" ON public.staff_accounts;
CREATE POLICY "Super admins can read staff accounts" ON public.staff_accounts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can insert staff accounts" ON public.staff_accounts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can update staff accounts" ON public.staff_accounts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can delete staff accounts" ON public.staff_accounts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));