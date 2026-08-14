CREATE TYPE public.app_role AS ENUM ('admin','staff','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  description text NOT NULL,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are publicly readable" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  service_requested text NOT NULL,
  project_location text,
  site_type text,
  project_details text,
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.quote_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a quote request" ON public.quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read quote requests" ON public.quote_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update quote requests" ON public.quote_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete quote requests" ON public.quote_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.services (title, slug, category, description, image_url, is_available, sort_order) VALUES
('Truck & Trailer Rental','truck-trailer-rental','rental','Over-dimensional and heavy load transportation using specialized multi-axle trailers with experienced pilot crews.','https://lh3.googleusercontent.com/aida-public/AB6AXuApM9pzWfEbo1kl4yo621wrLNTwq9LgA3ARQwbzMvpCnuNxayZd6-TC515G5t8Gc8TQwTp0InCAHQ-0Gtq6W8INLaTr-cOUhCtyhd04qfB_hE_lHKisqU1Tmtum3TAlzE7n1q9hARRE3nXJNC2sOy9aaHebfsSOkhxB-_j6MoHJJBp3muVK3AFYtT07DI6hpiXjnJWS8ttvJ7MXBRwP5r1sWlZJAwhjdkoNQdihOTsqfijRS4Jb3krH3Q',true,1),
('Heavy Equipment & Crane Rental','crane-equipment-rental','rental','Mobile, crawler and tower cranes from 25 to 500 tons, mobilized with certified operators and full lift plans.','https://lh3.googleusercontent.com/aida-public/AB6AXuCsLQtEUPs9RrvNwMl9x6Zn3jywPzmbSmkg7Iul8dAFq4oH400rtDBIw7p5C8JllciGvsC2TRmUTi7uvVDIfV_6Y30Pd3-fv7lQsd5znHbUGkTCpnYxa7U9t9TXa1t11LW9PfMvkjC6fiVm-FqP08dDFMXk7OfNGPUixapQG-7pRBxqGER4kb09523K6IDJTOgEF3JlIyhlUXqKW2lWvYG_EOPwxZH6vKR9dGS5D8KxpFKOV8Kp_Z0yTQ',true,2),
('Container Storage & Handling','container-storage-handling','storage','Secured yard storage, container stuffing/de-stuffing and reach-stacker handling with live inventory tracking.','https://lh3.googleusercontent.com/aida-public/AB6AXuBB1BOASEUlLlMAdnXW6waJIeYKkehfZfUJr-6vR3GRvAFPqc536fDk4SDHC-dLn5muaZroFETX1PNansIyDr2ovSoS6y6fo_9AvJ-D9Da8SViCjD73uj9yHegghzb04VTyKNhRbBDLJxqkKO5XYabFAaTT-Ki3VtjEq-8fbRgxlUH_Fr_yoe9yzLq8SB6BkCZS8iAsxCR76KDA6ROV2Qml1J_OyBInkdD5eor-EssCPTuuqSP047g1XA',true,3),
('Heavy Machinery Dismantling','machinery-dismantling','dismantling','Precision dismantling of production lines and industrial plant, with every connection point documented before disassembly.','https://lh3.googleusercontent.com/aida-public/AB6AXuBXjtqExIWks3K8qBRy2AJE25rqNgwB-7W-h7SG6g35pi8E-vX9jUcJmlaM01MW3n_pDF_gUfBuuKwkmdtzmmJAicXGvI2uaQIseyb6pGPoTlcm5U32DLQPRBifeSAl3cEQuPuKL3NExA76QkLcypUnLruLrFYFHaFVxTIEQqdKjxD7P5fOfmAXCZ4w7ymVnw1ggd9ySf-61WB1ANBNGJnIsutKR9IOSCfAGfOmNMUwvmfpgrkqSyrqSw',false,4),
('Machinery Assembling & Installation','machinery-assembly','assembly','Re-assembly, alignment and commissioning support for relocated equipment, within millimetre tolerances.','https://lh3.googleusercontent.com/aida-public/AB6AXuA7awRAEvEXn_Q60qeuSDI8oJfa4AlLTOFn8uAfYKZQkETRaEws5m3WAla6atiBTmYXxfTtSquf33saOcN5xuNcMyIidFz5_3nWnn3RvhPwsd9VF-Z8gYdlR5wHhH2S27RPxIpq4kAl97R7ijb3VnjzjXSlzJq12N-sPlecazRTYINRO4uqgbNPx2fJI-QyDQT3jwrJOqXc_M0uIhKHtZ8W3XefUvis8h8gUL_sZkOVQViuaNrCHc0o0g',true,5),
('Industrial Lashing, Rigging & Loading','industrial-rigging-lashing','rigging','Certified rigging crews, lashing and securing plans for road, rail and sea transport of oversized cargo.','https://lh3.googleusercontent.com/aida-public/AB6AXuBjTCIK_eA4ZEd5GMPC7kYpIZvQ-brKmMuR3CDQgXxKF-H3wnJg6dKrDwYdGOEBkBzmIxGAY--BZWyHYQsVjWdv4P7oBs2bQ_eLJkTOrK7HbLD8KvMyO3OOWhLaUAiJdWcuEXqek_6k4ROu4SvptYvTQk4aaFxq1UqHc5CHNUPMeGmIN9PEIPsIbRfBaXymAzSw5q0dQoVG6c7DkZUdeT_G9VWC3hHL51Ggtblpvb8oVVh9q8NDzdaITg',true,6);