ALTER TABLE public.farmers
  ADD COLUMN IF NOT EXISTS activity_category TEXT NOT NULL DEFAULT 'agricultural'
    CHECK (activity_category IN ('agricultural', 'pfnl', 'mixed')),
  ADD COLUMN IF NOT EXISTS pfnl_products TEXT[],
  ADD COLUMN IF NOT EXISTS pfnl_collection_area_ha NUMERIC,
  ADD COLUMN IF NOT EXISTS pfnl_target_species TEXT[],
  ADD COLUMN IF NOT EXISTS pfnl_seasonality TEXT,
  ADD COLUMN IF NOT EXISTS pfnl_forest_authorization_ref TEXT;

CREATE INDEX IF NOT EXISTS idx_farmers_activity_category ON public.farmers(activity_category);