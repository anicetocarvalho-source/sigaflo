/**
 * Testes de integração do fluxo backend de finalização do workflow.
 *
 * Cobre o contrato entre o frontend e os triggers SQL:
 *   - tg_assert_card_eligibility  (bloqueia INSERT em farmer_cards)
 *   - tg_assert_wallet_eligibility (bloqueia INSERT em farmer_wallets)
 *   - log_eligibility_block       (regista bloqueio em eligibility_block_log)
 *   - audit_log                   (gravado pelo frontend WorkflowActions)
 *
 * Estratégia: simulamos um "fake" do supabase client que reproduz fielmente
 * o comportamento dos triggers (RAISE EXCEPTION com errcode check_violation
 * para tipos não elegíveis) e verificamos:
 *   1. O bloqueio acontece exclusivamente para cooperative/field_school.
 *   2. Cada tentativa bloqueada gera uma linha em eligibility_block_log.
 *   3. Cada finalização bem-sucedida gera audit_log com a "kind" correcta
 *      (card_issued vs registration_activated).
 *   4. Nenhuma escrita em farmer_cards ocorre quando o tipo é bloqueado.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CARD_ELIGIBLE_TYPES } from '@/lib/workflowLabels';

type FarmerType = 'individual' | 'family' | 'company' | 'cooperative' | 'field_school';

interface FakeAuditRow {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
}

interface FakeBlockLogRow {
  target_table: string;
  farmer_id: string;
  farmer_type: FarmerType;
  reason: string;
  attempted_by: string;
}

/**
 * Backend simulado: replica a lógica dos triggers SQL.
 * `tg_assert_card_eligibility` e `tg_assert_wallet_eligibility` rejeitam
 * cooperative/field_school com errcode 'check_violation' e chamam
 * `log_eligibility_block` antes do RAISE.
 */
class FakeBackend {
  cards: Array<{ id: string; farmer_id: string }> = [];
  wallets: Array<{ id: string; farmer_id: string }> = [];
  blockLog: FakeBlockLogRow[] = [];
  auditLog: FakeAuditRow[] = [];
  private farmerTypes = new Map<string, FarmerType>();

  registerFarmer(id: string, type: FarmerType) {
    this.farmerTypes.set(id, type);
  }

  private assertEligibility(table: 'farmer_cards' | 'farmer_wallets', farmerId: string, actor: string) {
    const t = this.farmerTypes.get(farmerId);
    if (!t) throw new Error(`farmer ${farmerId} not registered`);
    if (t === 'cooperative' || t === 'field_school') {
      const subject = table === 'farmer_cards' ? 'cartão SIGAFLO' : 'AgroPay';
      const reason = `Cooperativas e Escolas de Campo não são elegíveis para ${subject} (tipo: ${t})`;
      // log_eligibility_block executa ANTES do raise (transacção autónoma via dblink)
      this.blockLog.push({
        target_table: table,
        farmer_id: farmerId,
        farmer_type: t,
        reason,
        attempted_by: actor,
      });
      const err = new Error(reason) as Error & { code: string };
      err.code = '23514'; // check_violation
      throw err;
    }
  }

  insertCard(farmerId: string, actor: string) {
    this.assertEligibility('farmer_cards', farmerId, actor);
    const row = { id: `card-${this.cards.length + 1}`, farmer_id: farmerId };
    this.cards.push(row);
    return row;
  }

  insertWallet(farmerId: string, actor: string) {
    this.assertEligibility('farmer_wallets', farmerId, actor);
    const row = { id: `wallet-${this.wallets.length + 1}`, farmer_id: farmerId };
    this.wallets.push(row);
    return row;
  }

  insertAudit(row: FakeAuditRow) {
    this.auditLog.push(row);
  }
}

/**
 * Reproduz o gate da aplicação: o WorkflowActions decide entre emitir cartão
 * (card_issued) e activar registo (registration_activated) com base em
 * CARD_ELIGIBLE_TYPES, e SÓ tenta o insert em farmer_cards quando elegível.
 */
async function finalizeWorkflow(
  backend: FakeBackend,
  farmerId: string,
  farmerType: FarmerType,
  actor: string,
) {
  const eligible = CARD_ELIGIBLE_TYPES.has(farmerType);
  let cardCreated: { id: string } | null = null;
  let blocked = false;

  if (eligible) {
    try {
      cardCreated = backend.insertCard(farmerId, actor);
    } catch (e) {
      blocked = true;
    }
  }

  backend.insertAudit({
    user_id: actor,
    action: eligible ? 'workflow_card_issued' : 'workflow_registration_activated',
    entity_type: 'farmer',
    entity_id: farmerId,
    old_values: { status: 'approved' },
    new_values: {
      status: 'issued',
      finalization: {
        kind: eligible ? 'card_issued' : 'registration_activated',
        farmer_type: farmerType,
        card_eligible: eligible,
        issued_label: eligible ? 'Emitir Cartão' : 'Activar Registo',
      },
    },
  });

  return { cardCreated, blocked };
}

describe('Integração backend: tg_assert_card_eligibility', () => {
  let backend: FakeBackend;
  beforeEach(() => {
    backend = new FakeBackend();
  });

  it.each(['individual', 'family', 'company'] as FarmerType[])(
    '%s: insert em farmer_cards é aceite e não regista bloqueio',
    (type) => {
      backend.registerFarmer('f1', type);
      const row = backend.insertCard('f1', 'admin-1');
      expect(row.farmer_id).toBe('f1');
      expect(backend.cards).toHaveLength(1);
      expect(backend.blockLog).toHaveLength(0);
    },
  );

  it.each(['cooperative', 'field_school'] as FarmerType[])(
    '%s: insert em farmer_cards é rejeitado com check_violation e regista bloqueio',
    (type) => {
      backend.registerFarmer('f1', type);
      expect(() => backend.insertCard('f1', 'admin-1')).toThrowError(
        /não são elegíveis para cartão SIGAFLO/,
      );
      expect(backend.cards).toHaveLength(0);
      expect(backend.blockLog).toHaveLength(1);
      expect(backend.blockLog[0]).toMatchObject({
        target_table: 'farmer_cards',
        farmer_id: 'f1',
        farmer_type: type,
        attempted_by: 'admin-1',
      });
    },
  );

  it('preserva errcode SQLSTATE 23514 (check_violation) no erro lançado', () => {
    backend.registerFarmer('f1', 'cooperative');
    try {
      backend.insertCard('f1', 'admin-1');
      throw new Error('deveria ter sido bloqueado');
    } catch (e) {
      expect((e as { code: string }).code).toBe('23514');
    }
  });
});

describe('Integração backend: tg_assert_wallet_eligibility', () => {
  let backend: FakeBackend;
  beforeEach(() => {
    backend = new FakeBackend();
  });

  it.each(['individual', 'family', 'company'] as FarmerType[])(
    '%s: criação de carteira AgroPay é permitida',
    (type) => {
      backend.registerFarmer('f1', type);
      const row = backend.insertWallet('f1', 'admin-1');
      expect(row.farmer_id).toBe('f1');
      expect(backend.blockLog).toHaveLength(0);
    },
  );

  it.each(['cooperative', 'field_school'] as FarmerType[])(
    '%s: criação de carteira AgroPay é bloqueada',
    (type) => {
      backend.registerFarmer('f1', type);
      expect(() => backend.insertWallet('f1', 'admin-1')).toThrowError(
        /não são elegíveis para AgroPay/,
      );
      expect(backend.wallets).toHaveLength(0);
      expect(backend.blockLog[0]).toMatchObject({
        target_table: 'farmer_wallets',
        farmer_type: type,
      });
    },
  );
});

describe('Integração backend: audit_log na finalização do workflow', () => {
  let backend: FakeBackend;
  beforeEach(() => {
    backend = new FakeBackend();
  });

  it.each(['individual', 'family', 'company'] as FarmerType[])(
    '%s: finalização cria cartão E grava audit_log com kind=card_issued',
    async (type) => {
      backend.registerFarmer('f1', type);
      const r = await finalizeWorkflow(backend, 'f1', type, 'admin-1');
      expect(r.cardCreated).not.toBeNull();
      expect(r.blocked).toBe(false);
      expect(backend.cards).toHaveLength(1);
      expect(backend.blockLog).toHaveLength(0);
      expect(backend.auditLog).toHaveLength(1);
      expect(backend.auditLog[0]).toMatchObject({
        action: 'workflow_card_issued',
        entity_type: 'farmer',
        entity_id: 'f1',
        new_values: {
          status: 'issued',
          finalization: {
            kind: 'card_issued',
            farmer_type: type,
            card_eligible: true,
            issued_label: 'Emitir Cartão',
          },
        },
      });
    },
  );

  it.each(['cooperative', 'field_school'] as FarmerType[])(
    '%s: finalização NÃO cria cartão e grava audit_log com kind=registration_activated',
    async (type) => {
      backend.registerFarmer('f1', type);
      const r = await finalizeWorkflow(backend, 'f1', type, 'admin-1');
      expect(r.cardCreated).toBeNull();
      expect(r.blocked).toBe(false); // gate de aplicação evita o insert
      expect(backend.cards).toHaveLength(0);
      expect(backend.blockLog).toHaveLength(0); // sem tentativa = sem log
      expect(backend.auditLog[0]).toMatchObject({
        action: 'workflow_registration_activated',
        new_values: {
          finalization: {
            kind: 'registration_activated',
            farmer_type: type,
            card_eligible: false,
            issued_label: 'Activar Registo',
          },
        },
      });
    },
  );

  it('se o gate de aplicação falhar e tentar emitir cartão a cooperative, o trigger backend bloqueia E loga', () => {
    // Cenário defensivo: simula um bug onde alguém by-passou CARD_ELIGIBLE_TYPES
    backend.registerFarmer('coop-1', 'cooperative');
    expect(() => backend.insertCard('coop-1', 'admin-bypass')).toThrowError();
    expect(backend.cards).toHaveLength(0);
    expect(backend.blockLog).toHaveLength(1);
    expect(backend.blockLog[0].attempted_by).toBe('admin-bypass');
  });
});

describe('Sincronização frontend ↔ backend (defesa em profundidade)', () => {
  it('todo tipo bloqueado pelo backend está fora de CARD_ELIGIBLE_TYPES', () => {
    const backend = new FakeBackend();
    for (const type of ['cooperative', 'field_school'] as FarmerType[]) {
      backend.registerFarmer(`f-${type}`, type);
      expect(() => backend.insertCard(`f-${type}`, 'a')).toThrow();
      expect(CARD_ELIGIBLE_TYPES.has(type)).toBe(false);
    }
  });

  it('todo tipo permitido pelo backend está em CARD_ELIGIBLE_TYPES', () => {
    const backend = new FakeBackend();
    for (const type of ['individual', 'family', 'company'] as FarmerType[]) {
      backend.registerFarmer(`f-${type}`, type);
      expect(() => backend.insertCard(`f-${type}`, 'a')).not.toThrow();
      expect(CARD_ELIGIBLE_TYPES.has(type)).toBe(true);
    }
  });
});
