

-- Table: admin sets the inspection fee for each property type
CREATE TABLE IF NOT EXISTS public.inspection_fee_config (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_type public.property_type_enum NOT NULL UNIQUE, 
  fee           numeric(12,2) NOT NULL DEFAULT 5000,
  description   text,
  updated_by    uuid REFERENCES auth.users(id),
  updated_at    timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.inspection_fee_config OWNER TO postgres;
ALTER TABLE public.inspection_fee_config ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can READ the fee config (needed when tenant books)
CREATE POLICY "anyone_read_fee_config"
  ON public.inspection_fee_config FOR SELECT TO authenticated
  USING (true);

-- Only admins can write
CREATE POLICY "Only SuperAdmin_manage_fee_config"
  ON public.inspection_fee_config FOR ALL TO authenticated
  USING (public.is_super_admin());

-- Seed default fees

INSERT INTO public.inspection_fee_config (property_type, fee, description) VALUES
  ('apartment',  5000,  'Standard inspection fee for apartments'),
  ('house',      7500,  'Standard inspection fee for houses'),
  ('commercial', 15000, 'Standard inspection fee for commercial properties'),
  ('land',       10000, 'Standard inspection fee for land'),
  ('shortlet',   3000,  'Standard inspection fee for shortlets')
ON CONFLICT (property_type) DO NOTHING;




-- Helper function: get inspection fee for a property
CREATE OR REPLACE FUNCTION public.get_inspection_fee(p_property_id uuid)
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ifc.fee
  FROM public.properties p
  JOIN public.inspection_fee_config ifc ON ifc.property_type = p.property_type
  WHERE p.id = p_property_id;
$$;

ALTER FUNCTION public.get_inspection_fee(uuid) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.get_inspection_fee(uuid) TO authenticated;
