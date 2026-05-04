import { describe, it, expect } from 'vitest';
import {
  CARD_ELIGIBLE_TYPES,
  isCardEligibleType,
  getFinalTransitionLabel,
  getFinalTransitionDescription,
  getIssuedStateLabel,
} from '@/lib/workflowLabels';

/**
 * Cobertura do fluxo Aprovação → Emissão/Activação por farmer_type.
 * Garante consistência de rótulos UI alinhada com o bloqueio backend
 * (triggers tg_assert_card_eligibility e tg_assert_wallet_eligibility).
 */

const ELIGIBLE = ['individual', 'family', 'company'] as const;
const INELIGIBLE = ['cooperative', 'field_school'] as const;

describe('Workflow labels — emissão/activação por farmer_type', () => {
  describe('Tipos elegíveis a cartão SIGAFLO', () => {
    it.each(ELIGIBLE)('%s deve mostrar "Emitir Cartão" como acção final', (type) => {
      expect(isCardEligibleType(type)).toBe(true);
      expect(CARD_ELIGIBLE_TYPES.has(type)).toBe(true);
      expect(getFinalTransitionLabel(type)).toBe('Emitir Cartão');
      expect(getFinalTransitionDescription(type)).toContain('cartão do agricultor');
      expect(getIssuedStateLabel(type)).toBe('Emitido');
    });
  });

  describe('Tipos NÃO elegíveis a cartão (cooperativas / escolas de campo)', () => {
    it.each(INELIGIBLE)('%s deve mostrar "Activar Registo" e nunca mencionar cartão', (type) => {
      expect(isCardEligibleType(type)).toBe(false);
      expect(CARD_ELIGIBLE_TYPES.has(type)).toBe(false);
      expect(getFinalTransitionLabel(type)).toBe('Activar Registo');
      const desc = getFinalTransitionDescription(type);
      expect(desc).toContain('Activar o registo');
      expect(desc).toContain('não emite cartão');
      expect(getIssuedStateLabel(type)).toBe('Activo');
    });
  });

  describe('Casos limite', () => {
    it('tipo indefinido assume elegível (compat com registos antigos)', () => {
      expect(isCardEligibleType(undefined)).toBe(true);
      expect(getFinalTransitionLabel(undefined)).toBe('Emitir Cartão');
      expect(getIssuedStateLabel(null)).toBe('Emitido');
    });

    it('tipo desconhecido é tratado como NÃO elegível (fail-safe)', () => {
      expect(isCardEligibleType('unknown_type')).toBe(false);
      expect(getFinalTransitionLabel('unknown_type')).toBe('Activar Registo');
    });
  });

  describe('Invariantes de consistência rótulo↔backend', () => {
    it('CARD_ELIGIBLE_TYPES deve ser exactamente individual/family/company', () => {
      expect([...CARD_ELIGIBLE_TYPES].sort()).toEqual(['company', 'family', 'individual']);
    });

    it('cooperativas e escolas de campo nunca devem ver textos de cartão', () => {
      for (const type of INELIGIBLE) {
        expect(getFinalTransitionLabel(type).toLowerCase()).not.toContain('cartão');
        expect(getIssuedStateLabel(type).toLowerCase()).not.toContain('emit');
      }
    });
  });
});
