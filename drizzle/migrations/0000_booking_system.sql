CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.assign_admin_role() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'themindfulcollective05@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_admin_role();

CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_key text NOT NULL,
  class_name text NOT NULL,
  starts_at timestamptz NOT NULL,
  duration_min int NOT NULL DEFAULT 60,
  price_paise int NOT NULL CHECK (price_paise >= 0),
  capacity int NOT NULL DEFAULT 10 CHECK (capacity > 0),
  mode text NOT NULL DEFAULT 'Online and offline',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sessions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads sessions" ON public.sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin writes sessions" ON public.sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.my_customer_ids() RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.customers WHERE email = lower(auth.jwt() ->> 'email')
$$;
CREATE POLICY "own or admin customers" ON public.customers FOR SELECT TO authenticated
  USING (id IN (SELECT public.my_customer_ids()) OR public.has_role(auth.uid(),'admin'));

CREATE TYPE public.booking_status AS ENUM ('held','confirmed','waitlisted','cancel_requested','cancelled');
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  item_name text NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'held',
  amount_paise int NOT NULL,
  payment_id text UNIQUE,
  provider_order_id text UNIQUE,
  hold_expires_at timestamptz,
  attended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin bookings" ON public.bookings FOR SELECT TO authenticated
  USING (customer_id IN (SELECT public.my_customer_ids()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin updates bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.intake_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.intake_answers TO authenticated;
GRANT ALL ON public.intake_answers TO service_role;
ALTER TABLE public.intake_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin intake" ON public.intake_answers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR booking_id IN (
    SELECT id FROM public.bookings WHERE customer_id IN (SELECT public.my_customer_ids())));

CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  plan text NOT NULL,
  classes_remaining int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin packages" ON public.packages FOR SELECT TO authenticated
  USING (customer_id IN (SELECT public.my_customer_ids()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin writes packages" ON public.packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Spots taken per session (confirmed + unexpired holds), public, no personal data.
CREATE OR REPLACE FUNCTION public.session_spots_taken(_session_id uuid) RETURNS int
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.bookings
  WHERE session_id = _session_id
    AND (status IN ('confirmed','cancel_requested') OR (status = 'held' AND hold_expires_at > now()))
$$;
GRANT EXECUTE ON FUNCTION public.session_spots_taken(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.request_cancel(_booking_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.bookings SET status = 'cancel_requested'
  WHERE id = _booking_id AND status IN ('confirmed','held','waitlisted')
    AND customer_id IN (SELECT public.my_customer_ids());
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.request_cancel(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.request_cancel(uuid) TO authenticated;