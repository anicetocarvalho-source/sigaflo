
-- 1) Enum grain_type
DO $$ BEGIN
  CREATE TYPE public.grain_type AS ENUM (
    'arroz','milho','trigo','sorgo','massambala','massango','cevada','aveia'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Adicionar coluna grain_type nas tabelas (default arroz para backfill)
ALTER TABLE public.rice_production  ADD COLUMN IF NOT EXISTS grain_type public.grain_type NOT NULL DEFAULT 'arroz';
ALTER TABLE public.rice_imports     ADD COLUMN IF NOT EXISTS grain_type public.grain_type NOT NULL DEFAULT 'arroz';
ALTER TABLE public.rice_prices      ADD COLUMN IF NOT EXISTS grain_type public.grain_type NOT NULL DEFAULT 'arroz';
ALTER TABLE public.rice_consumption ADD COLUMN IF NOT EXISTS grain_type public.grain_type NOT NULL DEFAULT 'arroz';
ALTER TABLE public.rice_alerts      ADD COLUMN IF NOT EXISTS grain_type public.grain_type NOT NULL DEFAULT 'arroz';

-- 3) Índices
CREATE INDEX IF NOT EXISTS idx_rice_production_grain_year  ON public.rice_production (grain_type, year);
CREATE INDEX IF NOT EXISTS idx_rice_imports_grain_year     ON public.rice_imports (grain_type, year);
CREATE INDEX IF NOT EXISTS idx_rice_prices_grain_date      ON public.rice_prices (grain_type, recorded_date);
CREATE INDEX IF NOT EXISTS idx_rice_consumption_grain_year ON public.rice_consumption (grain_type, year);
CREATE INDEX IF NOT EXISTS idx_rice_alerts_grain_created   ON public.rice_alerts (grain_type, created_at);

-- 4) Adicionar 'grains' ao enum app_module e migrar permissões
ALTER TYPE public.app_module ADD VALUE IF NOT EXISTS 'grains';
