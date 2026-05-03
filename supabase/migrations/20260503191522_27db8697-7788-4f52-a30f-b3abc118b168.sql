create or replace function public.verify_card_by_code(_code text)
returns table(
  qr_token text,
  serial text,
  card_status text,
  is_active boolean,
  version int,
  issued_at timestamptz,
  updated_at timestamptz,
  farmer_name text,
  farmer_type text,
  province_name text,
  municipality_name text,
  cultivated_area_ha numeric,
  main_crops text[],
  photo_url text,
  match_kind text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_code text := trim(coalesce(_code, ''));
  v_kind text := null;
begin
  if v_code = '' or length(v_code) > 64 then
    return;
  end if;

  if v_code ~* '^[a-f0-9]{32}$' then
    v_kind := 'qr_token';
  elsif v_code ~* '^CART-\d{4}-\d{6}$' then
    v_kind := 'serial';
  elsif v_code ~* '^(AGR|FAM|COOP|ECA|EMP)-\d{6}$' then
    v_kind := 'registration_number';
  else
    return;
  end if;

  return query
  select
    v.qr_token, v.serial, v.card_status::text, v.is_active, v.version,
    v.issued_at, v.updated_at, v.farmer_name, v.farmer_type::text,
    v.province_name, v.municipality_name, v.cultivated_area_ha, v.main_crops, v.photo_url,
    v_kind
  from public.card_verification_view v
  left join public.farmer_cards c on c.qr_token = v.qr_token
  left join public.farmers f on f.id = c.farmer_id
  where (v_kind = 'qr_token'            and v.qr_token = lower(v_code))
     or (v_kind = 'serial'              and v.serial   = upper(v_code))
     or (v_kind = 'registration_number' and f.registration_number = upper(v_code))
  limit 1;
end;
$$;

grant execute on function public.verify_card_by_code(text) to anon, authenticated;

comment on function public.verify_card_by_code(text) is
  'Public verification by qr_token | serial | registration_number. Validates format server-side and returns a single match.';
