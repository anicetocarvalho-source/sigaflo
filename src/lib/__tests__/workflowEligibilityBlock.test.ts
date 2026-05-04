/**
 * Verifica que a lógica de elegibilidade alinhada com o trigger backend
 * (`tg_assert_card_eligibility` / `tg_assert_wallet_eligibility`) bloqueia
 * a emissão de cartão / criação de carteira para cooperativas e escolas
 * de campo, e permite-a para individual / family / company.
 *
 * O trigger backend rejeita o INSERT em `farmer_cards` / `farmer_wallets`
 * quando `farmer.farmer_type IN ('cooperative','field_school')`.
 * Este teste é o contrato unitário equivalente: garante que a constante
 * `CARD_ELIGIBLE_TYPES` que o frontend usa para condicionar a UI nunca
 * fica fora de sincronia com o bloqueio de DB.
 */
import { describe, it, expect } from 'vitest';
import {
  CARD_ELIGIBLE_TYPES,
  isCardEligibleType,
  getFinalTransitionLabel,
  getIssuedStateLabel,
} from '@/lib/workflowLabels';

const BACKEND_BLOCKED_TYPES = ['cooperative', 'field_school'] as const;
const BACKEND_ALLOWED_TYPES = ['individual', 'family', 'company'] as const;

describe('Bloqueio backend de elegibilidade (contrato com triggers SQL)', () => {
  describe('Tipos bloqueados pelo trigger', () => {
    it.each(BACKEND_BLOCKED_TYPES)(
      '%s: NÃO está em CARD_ELIGIBLE_TYPES',
      (type) => {
        expect(CARD_ELIGIBLE_TYPES.has(type)).toBe(false);
        expect(isCardEligibleType(type)).toBe(false);
      }
    );

    it.each(BACKEND_BLOCKED_TYPES)(
      '%s: rótulo final é "Activar Registo" (sem cartão)',
      (type) => {
        expect(getFinalTransitionLabel(type)).toBe('Activar Registo');
        expect(getIssuedStateLabel(type)).toBe('Activo');
      }
    );
  });

  describe('Tipos permitidos pelo trigger', () => {
    it.each(BACKEND_ALLOWED_TYPES)(
      '%s: ESTÁ em CARD_ELIGIBLE_TYPES',
      (type) => {
        expect(CARD_ELIGIBLE_TYPES.has(type)).toBe(true);
        expect(isCardEligibleType(type)).toBe(true);
      }
    );

    it.each(BACKEND_ALLOWED_TYPES)(
      '%s: rótulo final é "Emitir Cartão"',
      (type) => {
        expect(getFinalTransitionLabel(type)).toBe('Emitir Cartão');
        expect(getIssuedStateLabel(type)).toBe('Emitido');
      }
    );
  });

  describe('Sincronização frontend ↔ backend', () => {
    it('CARD_ELIGIBLE_TYPES é exactamente o complemento dos tipos bloqueados pelo trigger', () => {
      // Defesa: se alguém adicionar um tipo elegível, deve actualizar também
      // a função tg_assert_card_eligibility e remover do BACKEND_BLOCKED_TYPES.
      for (const t of BACKEND_BLOCKED_TYPES) {
        expect(CARD_ELIGIBLE_TYPES.has(t)).toBe(false);
      }
      for (const t of BACKEND_ALLOWED_TYPES) {
        expect(CARD_ELIGIBLE_TYPES.has(t)).toBe(true);
      }
      expect(CARD_ELIGIBLE_TYPES.size).toBe(BACKEND_ALLOWED_TYPES.length);
    });

    it('tipo desconhecido / nulo é tratado como elegível por defeito (compat)', () => {
      // Comportamento de fallback documentado em workflowLabels.ts
      expect(isCardEligibleType(undefined)).toBe(true);
      expect(isCardEligibleType(null)).toBe(true);
      expect(isCardEligibleType('')).toBe(true);
    });

    it('tipo arbitrário NÃO listado é tratado como bloqueado', () => {
      expect(isCardEligibleType('association')).toBe(false);
      expect(isCardEligibleType('government')).toBe(false);
      expect(getFinalTransitionLabel('association')).toBe('Activar Registo');
    });
  });
});

describe('Simulação do bloqueio em camada de aplicação', () => {
  /**
   * Função utilitária que simula o gate de aplicação antes de tocar no DB.
   * Reflecte a mesma decisão que o trigger backend toma.
   */
  const canIssueCard = (farmerType: string) => CARD_ELIGIBLE_TYPES.has(farmerType);

  it.each(BACKEND_BLOCKED_TYPES)(
    '%s: tentativa de emitir cartão é rejeitada antes de chegar ao DB',
    (type) => {
      expect(canIssueCard(type)).toBe(false);
    }
  );

  it.each(BACKEND_ALLOWED_TYPES)(
    '%s: emissão de cartão é permitida',
    (type) => {
      expect(canIssueCard(type)).toBe(true);
    }
  );
});
