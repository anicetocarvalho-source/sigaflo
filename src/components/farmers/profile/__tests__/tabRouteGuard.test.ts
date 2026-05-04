import { describe, it, expect } from 'vitest';
import {
  PROFILE_GROUPS,
  getVisibleTabs,
  findGroupForTab,
  isTabAllowedForType,
  type FarmerType,
  type TabValue,
} from '../profileTabsConfig';

/**
 * Reproduz a lógica de auto-ajuste em FarmerProfileComplete (useEffect que reage
 * a farmer_type / URL ?tab=...). Quando o tab pedido via URL não é permitido para
 * o tipo de entidade, o utilizador é redirecionado para o primeiro tab visível do
 * mesmo grupo, ou para o primeiro tab do primeiro grupo, ou para 'identification'.
 */
function resolveTabForType(requestedTab: TabValue, type: FarmerType): TabValue {
  if (isTabAllowedForType(requestedTab, type)) return requestedTab;
  const groupKey = findGroupForTab(requestedTab);
  const group = PROFILE_GROUPS.find((g) => g.key === groupKey)!;
  const visibleInGroup = getVisibleTabs(group, type);
  return (
    (visibleInGroup[0]?.value as TabValue) ||
    (getVisibleTabs(PROFILE_GROUPS[0], type)[0]?.value as TabValue) ||
    'identification'
  );
}

describe('Guarda de rota para tabs proibidos por tipo de entidade', () => {
  describe('Cooperativa', () => {
    it('redireciona /perfil?tab=card para um tab permitido (não card/biometria)', () => {
      const resolved = resolveTabForType('card', 'cooperative');
      expect(resolved).not.toBe('card');
      expect(isTabAllowedForType(resolved, 'cooperative')).toBe(true);
    });

    it('redireciona tab=biometry para tab permitido', () => {
      const resolved = resolveTabForType('biometry', 'cooperative');
      expect(resolved).not.toBe('biometry');
      expect(isTabAllowedForType(resolved, 'cooperative')).toBe(true);
    });

    it('redireciona tab=agropay (financeiro individual) para tab permitido do grupo', () => {
      const resolved = resolveTabForType('agropay', 'cooperative');
      expect(resolved).not.toBe('agropay');
      // Cooperativa só tem 'incentives' no grupo Financeiro
      expect(resolved).toBe('incentives');
    });

    it('redireciona tab=scores para tab permitido', () => {
      const resolved = resolveTabForType('scores', 'cooperative');
      expect(isTabAllowedForType(resolved, 'cooperative')).toBe(true);
    });

    it('preserva tab permitido (members)', () => {
      expect(resolveTabForType('members', 'cooperative')).toBe('members');
    });
  });

  describe('Escola de Campo (ECA)', () => {
    it('redireciona tab=card para tab permitido', () => {
      const resolved = resolveTabForType('card', 'field_school');
      expect(resolved).not.toBe('card');
      expect(isTabAllowedForType(resolved, 'field_school')).toBe(true);
    });

    it('redireciona tab=mechanization (não pedagógico) para tab permitido', () => {
      const resolved = resolveTabForType('mechanization', 'field_school');
      expect(resolved).not.toBe('mechanization');
      // ECA no grupo Operação só tem 'members'
      expect(resolved).toBe('members');
    });

    it('redireciona tab=parcels para tab permitido', () => {
      const resolved = resolveTabForType('parcels', 'field_school');
      expect(isTabAllowedForType(resolved, 'field_school')).toBe(true);
    });

    it('redireciona tab=agropay para tab permitido (ECA não tem grupo Financeiro)', () => {
      const resolved = resolveTabForType('agropay', 'field_school');
      expect(isTabAllowedForType(resolved, 'field_school')).toBe(true);
    });

    it('redireciona tab=representatives para tab permitido', () => {
      const resolved = resolveTabForType('representatives', 'field_school');
      expect(isTabAllowedForType(resolved, 'field_school')).toBe(true);
    });

    it('preserva tab permitido (occurrences)', () => {
      expect(resolveTabForType('occurrences', 'field_school')).toBe('occurrences');
    });
  });

  describe('Empresa (company)', () => {
    it('redireciona tab=biometry (apenas individual/family) para tab permitido', () => {
      const resolved = resolveTabForType('biometry', 'company');
      expect(resolved).not.toBe('biometry');
      expect(isTabAllowedForType(resolved, 'company')).toBe(true);
    });

    it('redireciona tab=household (apenas individual) para tab permitido', () => {
      const resolved = resolveTabForType('household', 'company');
      expect(resolved).not.toBe('household');
      expect(isTabAllowedForType(resolved, 'company')).toBe(true);
    });

    it('redireciona tab=members (só coop/ECA) para tab permitido', () => {
      const resolved = resolveTabForType('members', 'company');
      expect(resolved).not.toBe('members');
      expect(isTabAllowedForType(resolved, 'company')).toBe(true);
    });

    it('preserva tab permitido (card, agropay, scores, mechanization)', () => {
      expect(resolveTabForType('card', 'company')).toBe('card');
      expect(resolveTabForType('agropay', 'company')).toBe('agropay');
      expect(resolveTabForType('scores', 'company')).toBe('scores');
      expect(resolveTabForType('mechanization', 'company')).toBe('mechanization');
    });
  });

  it('o tab resolvido é sempre permitido para o tipo, para qualquer combinação', () => {
    const types: FarmerType[] = ['individual', 'family', 'cooperative', 'field_school', 'company'];
    const allTabs: TabValue[] = [
      'identification', 'household', 'documents', 'card', 'biometry', 'entity-details',
      'parcels', 'campaigns', 'production', 'mechanization', 'members',
      'agropay', 'purchases', 'incentives', 'scores', 'certificates',
      'occurrences', 'monitoring', 'forecast', 'representatives',
    ];
    for (const type of types) {
      for (const tab of allTabs) {
        const resolved = resolveTabForType(tab, type);
        expect(
          isTabAllowedForType(resolved, type),
          `tipo=${type} tab=${tab} resolvido=${resolved} deveria ser permitido`
        ).toBe(true);
      }
    }
  });
});
