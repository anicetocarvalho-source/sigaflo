
revoke execute on function public.log_eligibility_block(text, uuid, public.farmer_type, text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.log_eligibility_block(text, uuid, public.farmer_type, text, jsonb, uuid) to service_role, postgres;
