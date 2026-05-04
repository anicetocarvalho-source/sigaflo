-- Block card and wallet creation for cooperatives and field schools

CREATE OR REPLACE FUNCTION public.tg_assert_card_eligibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_type public.farmer_type;
BEGIN
  SELECT farmer_type INTO v_type FROM public.farmers WHERE id = NEW.farmer_id;
  IF v_type IN ('cooperative','field_school') THEN
    RAISE EXCEPTION 'Cooperativas e Escolas de Campo não são elegíveis para cartão SIGAFLO (tipo: %)', v_type
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_card_eligibility ON public.farmer_cards;
CREATE TRIGGER trg_card_eligibility
  BEFORE INSERT ON public.farmer_cards
  FOR EACH ROW EXECUTE FUNCTION public.tg_assert_card_eligibility();

CREATE OR REPLACE FUNCTION public.tg_assert_wallet_eligibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_type public.farmer_type;
BEGIN
  SELECT farmer_type INTO v_type FROM public.farmers WHERE id = NEW.farmer_id;
  IF v_type IN ('cooperative','field_school') THEN
    RAISE EXCEPTION 'Cooperativas e Escolas de Campo não são elegíveis para AgroPay (tipo: %)', v_type
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='farmer_wallets') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_wallet_eligibility ON public.farmer_wallets';
    EXECUTE 'CREATE TRIGGER trg_wallet_eligibility BEFORE INSERT ON public.farmer_wallets FOR EACH ROW EXECUTE FUNCTION public.tg_assert_wallet_eligibility()';
  END IF;
END $$;