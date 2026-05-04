
-- 1) Extensão dblink para transação autónoma (audit fora do rollback)
create extension if not exists dblink;

-- 2) Tabela de auditoria de bloqueios
create table if not exists public.eligibility_block_log (
  id uuid primary key default gen_random_uuid(),
  target_table text not null check (target_table in ('farmer_cards','farmer_wallets')),
  farmer_id uuid,
  farmer_type public.farmer_type,
  reason text not null,
  attempted_payload jsonb,
  attempted_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_eligibility_block_log_farmer on public.eligibility_block_log(farmer_id);
create index if not exists idx_eligibility_block_log_created on public.eligibility_block_log(created_at desc);
create index if not exists idx_eligibility_block_log_target on public.eligibility_block_log(target_table);

alter table public.eligibility_block_log enable row level security;

-- Apenas técnicos/admins podem ler. Inserts feitos via SECURITY DEFINER (sem policy de insert para utilizadores).
drop policy if exists "Eligibility log readable by staff" on public.eligibility_block_log;
create policy "Eligibility log readable by staff"
  on public.eligibility_block_log
  for select
  to authenticated
  using (public.is_technician_or_admin(auth.uid()));

-- 3) Helper para registar via dblink (autonomous transaction)
create or replace function public.log_eligibility_block(
  _target_table text,
  _farmer_id uuid,
  _farmer_type public.farmer_type,
  _reason text,
  _payload jsonb,
  _attempted_by uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conn text := current_setting('eligibility.dblink_conn', true);
  v_sql text;
begin
  -- Sempre regista nos logs do Postgres (visível em supabase logs)
  raise log 'eligibility_block target=% farmer=% type=% reason=% by=%',
    _target_table, _farmer_id, _farmer_type, _reason, _attempted_by;

  -- Constrói SQL parametrizado de forma segura via format() com %L
  v_sql := format(
    'insert into public.eligibility_block_log
       (target_table, farmer_id, farmer_type, reason, attempted_payload, attempted_by)
     values (%L, %L, %L, %L, %L::jsonb, %L)',
    _target_table, _farmer_id, _farmer_type::text, _reason,
    coalesce(_payload::text, '{}'), _attempted_by
  );

  -- Conexão de loopback. Quando configurada, garante persistência via tx autónoma.
  if v_conn is not null and v_conn <> '' then
    begin
      perform dblink_exec(v_conn, v_sql);
    exception when others then
      raise log 'eligibility_block_log dblink failed: %', sqlerrm;
    end;
  else
    -- Fallback: insert directo (será revertido se o trigger fizer RAISE EXCEPTION,
    -- mas mantém o log do Postgres acima como fonte de verdade).
    begin
      execute v_sql;
    exception when others then
      raise log 'eligibility_block_log direct insert failed: %', sqlerrm;
    end;
  end if;
end;
$$;

-- 4) Triggers atualizados — registam ANTES de bloquear
create or replace function public.tg_assert_card_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_type public.farmer_type; v_reason text;
begin
  select farmer_type into v_type from public.farmers where id = new.farmer_id;
  if v_type in ('cooperative','field_school') then
    v_reason := format(
      'Cooperativas e Escolas de Campo não são elegíveis para cartão SIGAFLO (tipo: %s)',
      v_type
    );
    perform public.log_eligibility_block(
      'farmer_cards', new.farmer_id, v_type, v_reason, to_jsonb(new), auth.uid()
    );
    raise exception '%', v_reason using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create or replace function public.tg_assert_wallet_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_type public.farmer_type; v_reason text;
begin
  select farmer_type into v_type from public.farmers where id = new.farmer_id;
  if v_type in ('cooperative','field_school') then
    v_reason := format(
      'Cooperativas e Escolas de Campo não são elegíveis para AgroPay (tipo: %s)',
      v_type
    );
    perform public.log_eligibility_block(
      'farmer_wallets', new.farmer_id, v_type, v_reason, to_jsonb(new), auth.uid()
    );
    raise exception '%', v_reason using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
