-- Enums
DO $$ BEGIN CREATE TYPE public.property_status_enum AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'revised',
  'suspended'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN CREATE TYPE public.property_type_enum AS ENUM (
  'apartment',
  'house',
  'commercial',
  'land',
  'shortlet'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN CREATE TYPE public.listing_type_enum AS ENUM ('rent', 'lease', 'sale');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE public.inspection_status_enum AS ENUM (
  'pending',
  'scheduled',
  'completed',
  'cancelled',
  'expired'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN CREATE TYPE public.tenancy_status_enum AS ENUM (
  'active',
  'expired',
  'terminated'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN CREATE TYPE public.task_status_enum AS ENUM (
  'pending',
  'in_progress',
  'in_review',
  'completed',
  'forwarded',
  'cancelled'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN CREATE TYPE public.task_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN CREATE TYPE public.payment_plan_enum AS ENUM ('full', 'instalment');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;


-- Properties 
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  property_type public.property_type_enum NOT NULL,
  listing_type public.listing_type_enum NOT NULL,
  status public.property_status_enum NOT NULL DEFAULT 'draft',
  location jsonb NOT NULL DEFAULT '{}',
  duration_years int NOT NULL default 1,
  features jsonb NOT NULL DEFAULT '{}',
  pricing jsonb NOT NULL DEFAULT '{}',
  feature_image text NOT NULL DEFAULT '',
  gallery text [] NOT NULL DEFAULT '{}',
  proof_of_ownership text NOT NULL DEFAULT '',
  video_tour_url text,
  available_units int NOT NULL DEFAULT 1,
  current_tenants int NOT NULL DEFAULT 0,
  max_duration_years int NOT NULL DEFAULT 2,
  legal_services_available boolean NOT NULL DEFAULT false,
  tags text [] DEFAULT '{}',
  views_count int NOT NULL DEFAULT 0,
  bookmarks_count int NOT NULL DEFAULT 0,
  rating_average numeric(3, 2) DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


ALTER TABLE public.properties OWNER TO postgres;


ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;


CREATE POLICY "landlord_manage_own" ON public.properties FOR ALL TO authenticated USING (landlord_id = auth.uid());


CREATE POLICY "view_approved" ON public.properties FOR
SELECT TO authenticated USING (status = 'approved');


CREATE POLICY "admin_all_properties" ON public.properties FOR ALL TO authenticated USING (public.is_admin());


--  Inspections 
CREATE TABLE IF NOT EXISTS public.inspections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES user_profiles(id),
  status public.inspection_status_enum NOT NULL DEFAULT 'pending',
  inspection_fee numeric(12, 2) NOT NULL,
  payment_reference text NOT NULL,
  scheduled_date timestamptz default null,
  completed_date timestamptz default null,
  notes text,
  expires_at timestamptz default null,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  has_committed_to_property boolean NOT NULL DEFAULT false
);


ALTER TABLE public.inspections OWNER TO postgres;


ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tenant_view_inspections" ON public.inspections FOR
SELECT TO authenticated USING (tenant_id = auth.uid());


CREATE POLICY "landlord_view_inspections" ON public.inspections FOR
SELECT TO authenticated USING (landlord_id = auth.uid());


CREATE POLICY "tenant_insert_inspection" ON public.inspections FOR
INSERT TO authenticated WITH CHECK (tenant_id = auth.uid());


CREATE POLICY "admin_all_inspections" ON public.inspections FOR ALL TO authenticated USING (public.is_admin());


--  Tenancies 
CREATE TABLE IF NOT EXISTS public.tenancies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES public.properties(id),
  tenant_id uuid NOT NULL REFERENCES user_profiles(id),
  landlord_id uuid NOT NULL REFERENCES user_profiles(id),
  inspection_id uuid REFERENCES public.inspections(id),
  status public.tenancy_status_enum NOT NULL DEFAULT 'active',
  listing_type public.listing_type_enum NOT NULL,
  duration_years int NOT NULL,
  start_date date,
  end_date date,
  total_amount numeric(12, 2) NOT NULL,
  admin_fee_percent numeric(5, 2) NOT NULL DEFAULT 10,
  legal_fee_percent numeric(5, 2) NOT NULL DEFAULT 0,
  landlord_payout numeric(12, 2) NOT NULL,
  legal_services_opted boolean NOT NULL DEFAULT false,
  payment_plan public.payment_plan_enum NOT NULL DEFAULT 'full',
  payment_reference text NOT NULL,
  instalment_schedule jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


ALTER TABLE public.tenancies OWNER TO postgres;


ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tenant_view_tenancies" ON public.tenancies FOR
SELECT TO authenticated USING (tenant_id = auth.uid());


CREATE POLICY "landlord_view_tenancies" ON public.tenancies FOR
SELECT TO authenticated USING (landlord_id = auth.uid());


CREATE POLICY "admin_all_tenancies" ON public.tenancies FOR ALL TO authenticated USING (public.is_admin());


-- Tasks 
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  checklist       jsonb DEFAULT '[]' ,
  reference_table text default NULL,
  context_id uuid default NULL,
    assigned_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    assigned_to uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    forwarded_from uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
    status public.task_status_enum NOT NULL DEFAULT 'pending',
    priority public.task_priority_enum NOT NULL DEFAULT 'medium',
    due_date timestamptz,
    completed_at timestamptz,
    attachments text [] DEFAULT '{}',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);


ALTER TABLE public.tasks OWNER TO postgres;


ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_view_tasks" ON public.tasks FOR


SELECT TO authenticated USING (
    assigned_to = auth.uid()
    OR assigned_by = auth.uid()
  );

CREATE POLICY "users_update_tasks" ON public.tasks FOR
UPDATE TO authenticated USING (assigned_to = auth.uid());

CREATE POLICY "admin_all_tasks" ON public.tasks FOR ALL TO authenticated USING (public.is_admin());


--  Bookmarks 
CREATE TABLE IF NOT EXISTS public.property_bookmarks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
);


ALTER TABLE public.property_bookmarks OWNER TO postgres;


ALTER TABLE public.property_bookmarks ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_manage_bookmarks" ON public.property_bookmarks FOR ALL TO authenticated USING (user_id = auth.uid());


-- Ratings 
CREATE TABLE IF NOT EXISTS public.property_ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (
    rating BETWEEN 1 AND 5
  ),
  review text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, property_id)
);


ALTER TABLE public.property_ratings OWNER TO postgres;


ALTER TABLE public.property_ratings ENABLE ROW LEVEL SECURITY;


CREATE POLICY "anyone_view_ratings" ON public.property_ratings FOR
SELECT TO authenticated USING (true);

CREATE POLICY "tenant_own_ratings" ON public.property_ratings FOR ALL TO authenticated USING (tenant_id = auth.uid());

-- Account suspension requests 
CREATE TABLE IF NOT EXISTS public.account_suspension_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_user_id uuid NOT NULL REFERENCES user_profiles(id) ,
  requested_by uuid NOT NULL REFERENCES user_profiles(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES user_profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);


ALTER TABLE public.account_suspension_requests OWNER TO postgres;

ALTER TABLE public.account_suspension_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_suspension_requests" ON public.account_suspension_requests FOR ALL TO authenticated USING (public.is_admin());


-- Helper functions 

CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'superAdmin'
  );
$$;

ALTER FUNCTION public.is_super_admin() OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS text LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
SELECT role
FROM public.user_roles
WHERE user_id = auth.uid()
LIMIT 1;
$$;


ALTER FUNCTION public.get_my_role() OWNER TO postgres;


CREATE OR REPLACE FUNCTION public.increment_property_views(p_property_id uuid) RETURNS void LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
UPDATE public.properties
SET views_count = views_count + 1
WHERE id = p_property_id;
$$;


ALTER FUNCTION public.increment_property_views(uuid) OWNER TO postgres;


CREATE OR REPLACE FUNCTION public.process_property_payment(
    p_tenant_wallet_id uuid,
    p_admin_wallet_id uuid,
    p_landlord_wallet_id uuid,
    p_tenant_total numeric,
    p_landlord_payout numeric,
    p_total_admin_fee numeric
  ) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_bal numeric;
BEGIN
SELECT balance INTO v_bal
FROM wallets
WHERE id = p_tenant_wallet_id FOR
UPDATE;
IF v_bal < p_tenant_total THEN RAISE EXCEPTION 'Insufficient balance';
END IF;
UPDATE wallets
SET balance = balance - p_tenant_total,
  total_spent = total_spent + p_tenant_total
WHERE id = p_tenant_wallet_id;
UPDATE wallets
SET balance = balance + p_total_admin_fee,
  total_deposit = total_deposit + p_total_admin_fee
WHERE id = p_admin_wallet_id;
UPDATE wallets
SET balance = balance + p_landlord_payout,
  total_deposit = total_deposit + p_landlord_payout
WHERE id = p_landlord_wallet_id;
END;
$$;


ALTER FUNCTION public.process_property_payment(uuid, uuid, uuid, numeric, numeric, numeric) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.expire_inspections() 
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public AS $$ 
BEGIN
  WITH expired_rows AS (
    UPDATE public.inspections
    SET 
      status = 'expired',
      updated_at = now()
    WHERE status IN ('completed')
      AND has_committed_to_property = true
      AND expires_at < now()
      AND status != 'expired'
    RETURNING property_id
  )
  UPDATE public.properties p
  SET 
    current_tenants = current_tenants - 1,
    available_units = available_units + 1
  FROM expired_rows er
  WHERE p.id = er.property_id;

END;
$$;



ALTER FUNCTION public.expire_inspections() OWNER TO postgres;


--  Triggers


CREATE OR REPLACE FUNCTION public.update_property_rating() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
UPDATE public.properties
SET rating_average = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.property_ratings
    WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
  ),
  rating_count = (
    SELECT COUNT(*)
    FROM public.property_ratings
    WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
  )
WHERE id = COALESCE(NEW.property_id, OLD.property_id);
RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS trg_property_rating ON public.property_ratings;
CREATE TRIGGER trg_property_rating
AFTER
INSERT
  OR
UPDATE
  OR DELETE ON public.property_ratings FOR EACH ROW EXECUTE FUNCTION public.update_property_rating();


CREATE OR REPLACE FUNCTION public.update_bookmark_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
UPDATE public.properties
SET bookmarks_count = (
    SELECT COUNT(*)
    FROM public.property_bookmarks
    WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
  )
WHERE id = COALESCE(NEW.property_id, OLD.property_id);
RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_bookmark_count ON public.property_bookmarks;
CREATE TRIGGER trg_bookmark_count
AFTER
INSERT
  OR DELETE ON public.property_bookmarks FOR EACH ROW EXECUTE FUNCTION public.update_bookmark_count();

  
-- Cron (uncomment once pg_cron enabled):
SELECT cron.schedule(
    'expire-inspections',
    '0 * * * *',
    'SELECT public.expire_inspections()'
  );