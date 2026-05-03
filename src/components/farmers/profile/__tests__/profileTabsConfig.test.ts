import { describe, it, expect } from 'vitest';
import { PROFILE_GROUPS, getVisibleTabs, findGroupForTab, ALL_TAB_VALUES, type FarmerType } from '../profileTabsConfig';

const groupByKey = (k: string) => PROFILE_GROUPS.find((g) => g.key === k)!;

describe('profileTabsConfig — agrupamento e filtros por farmer_type', () => {
  it('expõe os 5 grupos esperados', () => {
    expect(PROFILE_GROUPS.map((g) => g.key)).toEqual([
      'identification', 'operation', 'financial', 'monitoring', 'governance',
    ]);
  });

  it('individual: mostra Agregado e Biometria, esconde detalhes de coop/ECA e Membros', () => {
    const ident = getVisibleTabs(groupByKey('identification'), 'individual').map((t) => t.label);
    expect(ident).toContain('Agregado');
    expect(ident).toContain('Biometria');
    expect(ident).not.toContain('Detalhes da Cooperativa');
    expect(ident).not.toContain('Detalhes da ECA');

    const op = getVisibleTabs(groupByKey('operation'), 'individual').map((t) => t.label);
    expect(op).not.toContain('Membros');
    expect(op).toContain('Mecanização');
  });

  it('cooperative: mostra Detalhes da Cooperativa + Membros, esconde Agregado e Biometria', () => {
    const ident = getVisibleTabs(groupByKey('identification'), 'cooperative').map((t) => t.label);
    expect(ident).toContain('Detalhes da Cooperativa');
    expect(ident).not.toContain('Detalhes da ECA');
    expect(ident).not.toContain('Agregado');
    expect(ident).not.toContain('Biometria');

    const op = getVisibleTabs(groupByKey('operation'), 'cooperative').map((t) => t.label);
    expect(op).toContain('Membros');
    expect(op).toContain('Mecanização');
  });

  it('field_school: mostra Detalhes da ECA + Membros, esconde Mecanização e Biometria', () => {
    const ident = getVisibleTabs(groupByKey('identification'), 'field_school').map((t) => t.label);
    expect(ident).toContain('Detalhes da ECA');
    expect(ident).not.toContain('Detalhes da Cooperativa');
    expect(ident).not.toContain('Biometria');

    const op = getVisibleTabs(groupByKey('operation'), 'field_school').map((t) => t.label);
    expect(op).toContain('Membros');
    expect(op).not.toContain('Mecanização');
  });

  it('company: sem Agregado, sem Biometria, sem Membros, com Mecanização', () => {
    const ident = getVisibleTabs(groupByKey('identification'), 'company').map((t) => t.label);
    expect(ident).not.toContain('Agregado');
    expect(ident).not.toContain('Biometria');

    const op = getVisibleTabs(groupByKey('operation'), 'company').map((t) => t.label);
    expect(op).not.toContain('Membros');
    expect(op).toContain('Mecanização');
  });

  it('findGroupForTab mapeia abas para o grupo correto', () => {
    expect(findGroupForTab('identification')).toBe('identification');
    expect(findGroupForTab('entity-details')).toBe('identification');
    expect(findGroupForTab('members')).toBe('operation');
    expect(findGroupForTab('mechanization')).toBe('operation');
    expect(findGroupForTab('agropay')).toBe('financial');
    expect(findGroupForTab('occurrences')).toBe('monitoring');
    expect(findGroupForTab('representatives')).toBe('governance');
  });

  it('ALL_TAB_VALUES contém todas as abas declaradas, sem duplicados', () => {
    const types: FarmerType[] = ['individual', 'family', 'cooperative', 'field_school', 'company'];
    const collected = new Set<string>();
    for (const t of types) {
      for (const g of PROFILE_GROUPS) {
        for (const tab of getVisibleTabs(g, t)) collected.add(tab.value);
      }
    }
    for (const v of collected) expect(ALL_TAB_VALUES).toContain(v as any);
    expect(ALL_TAB_VALUES.length).toBe(new Set(ALL_TAB_VALUES).size);
  });
});
