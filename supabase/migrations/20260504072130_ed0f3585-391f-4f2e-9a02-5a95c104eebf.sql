-- 1) Tabela de limiares configuráveis
create table if not exists public.eligibility_alert_thresholds (
  id uuid primary key default gen_random_uuid(),
  target_table text not null check (target_table in ('farmer_cards','farmer_wallets','*')),
  farmer_type text not null, -- valores de farmer_type ou '*' para qualquer
  reason_pattern text not null default '*', -- ILIKE pattern, '*' = qualquer motivo
  window_minutes integer not null default 60 check (window_minutes between 1 and 10080),
  min_absolute_count integer not null default 10 check (min_absolute_count >= 1),
  baseline_multiplier numeric not null default 3.0 check (baseline_multiplier >= 1.0),
  baseline_days integer not null default 7 check (baseline_days between 1 and 90),
  severity text not null default 'warning' check (severity in ('info','warning','error')),
  is_active boolean not null default true,
  notes text,
  priority integer not null default 100, -- menor = mais específico, avaliado primeiro
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  unique (target_table, farmer_type, reason_pattern)
);

create index if not exists idx_elig_thresholds_active
  on public.eligibility_alert_thresholds (is_active, priority);

-- Trigger updated_at
drop trigger if exists trg_elig_thresholds_updated_at on public.eligibility_alert_thresholds;
create trigger trg_elig_thresholds_updated_at
  before update on public.eligibility_alert_thresholds
  for each row execute function public.update_updated_at_column();

-- RLS
alter table public.eligibility_alert_thresholds enable row level security;

drop policy if exists "Admins manage eligibility thresholds" on public.eligibility_alert_thresholds;
create policy "Admins manage eligibility thresholds"
  on public.eligibility_alert_thresholds
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Technicians view eligibility thresholds" on public.eligibility_alert_thresholds;
create policy "Technicians view eligibility thresholds"
  on public.eligibility_alert_thresholds
  for select
  using (public.is_technician_or_admin(auth.uid()));

-- 2) Default global rule (catch-all)
insert into public.eligibility_alert_thresholds
  (target_table, farmer_type, reason_pattern, window_minutes, min_absolute_count,
   baseline_multiplier, baseline_days, severity, priority, notes)
values
  ('*','*','*',60,10,3.0,7,'warning',1000,'Regra padrão global. Editar valores aqui afecta todos os tipos sem regra específica.')
on conflict (target_table, farmer_type, reason_pattern) do nothing;

-- 3) Função de detecção de anomalias usando os limiares configuráveis
create or replace function public.detect_eligibility_block_anomalies()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_recent_count integer;
  v_baseline_avg numeric;
  v_threshold numeric;
  v_alerts_created integer := 0;
  v_title text;
  v_message text;
begin
  -- Itera grupos recentes de bloqueios (última hora alargada para 24h máximo)
  for r in
    select distinct target_table, farmer_type::text as farmer_type, reason
    from public.eligibility_block_log
    where created_at > now() - interval '24 hours'
      and farmer_type is not null
  loop
    -- Encontra a regra mais específica aplicável (menor priority)
    declare
      t public.eligibility_alert_thresholds%rowtype;
    begin
      select * into t
      from public.eligibility_alert_thresholds
      where is_active = true
        and (target_table = r.target_table or target_table = '*')
        and (farmer_type = r.farmer_type or farmer_type = '*')
        and (reason_pattern = '*' or r.reason ilike reason_pattern)
      order by
        (case when target_table = r.target_table then 0 else 1 end)
        + (case when farmer_type = r.farmer_type then 0 else 1 end)
        + (case when reason_pattern <> '*' then 0 else 1 end),
        priority
      limit 1;

      if not found then
        continue;
      end if;

      -- Contagem na janela recente
      select count(*) into v_recent_count
      from public.eligibility_block_log
      where target_table = r.target_table
        and farmer_type::text = r.farmer_type
        and reason = r.reason
        and created_at > now() - make_interval(mins => t.window_minutes);

      -- Baseline: média de blocos por janela equivalente nos últimos N dias
      select coalesce(
        count(*)::numeric / greatest(
          (t.baseline_days * 24 * 60)::numeric / t.window_minutes::numeric, 1
        ), 0)
      into v_baseline_avg
      from public.eligibility_block_log
      where target_table = r.target_table
        and farmer_type::text = r.farmer_type
        and reason = r.reason
        and created_at between now() - make_interval(days => t.baseline_days)
                           and now() - make_interval(mins => t.window_minutes);

      v_threshold := greatest(t.min_absolute_count::numeric,
                              v_baseline_avg * t.baseline_multiplier);

      if v_recent_count >= v_threshold then
        -- Evita duplicar: não cria se já houver alerta semelhante na janela
        if not exists (
          select 1 from public.system_notifications
          where category = 'system'
            and title like 'Pico de bloqueios%'
            and message like '%' || r.target_table || '%' || r.farmer_type || '%'
            and created_at > now() - make_interval(mins => t.window_minutes)
        ) then
          v_title := format('Pico de bloqueios em %s', r.target_table);
          v_message := format(
            'Detectados %s bloqueios em %s min para tipo "%s" (motivo: %s). Baseline ~%s, limiar %s. Reveja regras de elegibilidade.',
            v_recent_count, t.window_minutes, r.farmer_type,
            left(r.reason, 80), round(v_baseline_avg, 2), round(v_threshold, 2)
          );

          insert into public.system_notifications
            (user_id, title, message, notification_type, category)
          values
            (null, v_title, v_message, t.severity, 'system');

          v_alerts_created := v_alerts_created + 1;
        end if;
      end if;
    end;
  end loop;

  return v_alerts_created;
end;
$$;

revoke execute on function public.detect_eligibility_block_anomalies() from public, anon, authenticated;
grant execute on function public.detect_eligibility_block_anomalies() to service_role;