
ALTER TABLE public.card_export_jobs
  ADD COLUMN IF NOT EXISTS failed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS succeeded integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS finished_at timestamptz;

DO $$ BEGIN
  CREATE TYPE public.card_export_log_level AS ENUM ('info','warning','error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.card_export_job_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.card_export_jobs(id) ON DELETE CASCADE,
  level public.card_export_log_level NOT NULL DEFAULT 'info',
  message text NOT NULL,
  farmer_id uuid REFERENCES public.farmers(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_export_job_logs_job ON public.card_export_job_logs(job_id, created_at DESC);

ALTER TABLE public.card_export_job_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tech/admin pode ver logs de exportação" ON public.card_export_job_logs;
CREATE POLICY "Tech/admin pode ver logs de exportação"
  ON public.card_export_job_logs FOR SELECT
  USING (
    public.is_technician_or_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.card_export_jobs j WHERE j.id = job_id AND j.requested_by = auth.uid())
  );

DROP POLICY IF EXISTS "Tech/admin pode inserir logs" ON public.card_export_job_logs;
CREATE POLICY "Tech/admin pode inserir logs"
  ON public.card_export_job_logs FOR INSERT
  WITH CHECK (public.is_technician_or_admin(auth.uid()));
