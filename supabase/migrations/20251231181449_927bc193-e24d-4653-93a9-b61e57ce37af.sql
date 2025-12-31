-- Add columns for household/family aggregate registration
ALTER TABLE public.farmers
ADD COLUMN IF NOT EXISTS household_members_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dependents_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS spouse_name TEXT,
ADD COLUMN IF NOT EXISTS spouse_bi_nif TEXT,
ADD COLUMN IF NOT EXISTS children_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS children_under_5 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS children_5_to_14 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS children_15_to_18 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS family_workers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS head_of_household BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS household_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.farmers.household_members_count IS 'Total number of people living in the household';
COMMENT ON COLUMN public.farmers.dependents_count IS 'Number of dependents (not working)';
COMMENT ON COLUMN public.farmers.spouse_name IS 'Name of spouse/partner';
COMMENT ON COLUMN public.farmers.spouse_bi_nif IS 'BI/NIF of spouse/partner';
COMMENT ON COLUMN public.farmers.children_count IS 'Total number of children';
COMMENT ON COLUMN public.farmers.children_under_5 IS 'Number of children under 5 years old';
COMMENT ON COLUMN public.farmers.children_5_to_14 IS 'Number of children between 5-14 years old';
COMMENT ON COLUMN public.farmers.children_15_to_18 IS 'Number of children between 15-18 years old';
COMMENT ON COLUMN public.farmers.family_workers_count IS 'Number of family members working on the farm';
COMMENT ON COLUMN public.farmers.head_of_household IS 'Whether this farmer is the head of household';
COMMENT ON COLUMN public.farmers.household_notes IS 'Additional notes about the household';