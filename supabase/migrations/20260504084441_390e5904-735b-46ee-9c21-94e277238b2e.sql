-- Reanexar triggers de bloqueio de elegibilidade em farmer_cards e farmer_wallets.
-- As funções tg_assert_card_eligibility() e tg_assert_wallet_eligibility() já existem
-- (com SECURITY DEFINER, search_path=public) mas os triggers não estavam attachados,
-- deixando o bloqueio backend inactivo para cooperativas e escolas de campo.

DROP TRIGGER IF EXISTS trg_assert_card_eligibility ON public.farmer_cards;
CREATE TRIGGER trg_assert_card_eligibility
  BEFORE INSERT ON public.farmer_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_assert_card_eligibility();

DROP TRIGGER IF EXISTS trg_assert_wallet_eligibility ON public.farmer_wallets;
CREATE TRIGGER trg_assert_wallet_eligibility
  BEFORE INSERT ON public.farmer_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_assert_wallet_eligibility();