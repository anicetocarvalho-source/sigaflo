/**
 * Testes da estratégia 'last-write-wins'.
 *
 * Regra: comparar timestamp da edição local (`localEditedAt`) com `updated_at`
 * do servidor — vence o mais recente. Em empate ou timestamps inválidos,
 * fallback determinístico para a versão local.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const insertMock = vi.fn();
const updateMock = vi.fn();
const selectMock = vi.fn();
const eqUpdateMock = vi.fn();
const eqSelectMock = vi.fn();
const maybeSingleMock = vi.fn();
const fromMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: any[]) => fromMock(...args) },
}));

vi.mock('sonner', () => ({
  toast: { info: vi.fn(), success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

import { offlineDB } from '@/lib/offline/db';
import { syncNow } from '@/lib/offline/syncEngine';
import { analyzeConflict, resolveConflict } from '@/lib/offline/conflictResolver';

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value });
}

function wireFrom(serverRow: Record<string, any> | null) {
  maybeSingleMock.mockResolvedValue({ data: serverRow, error: null });
  eqSelectMock.mockReturnValue({ maybeSingle: maybeSingleMock });
  selectMock.mockReturnValue({ eq: eqSelectMock });

  eqUpdateMock.mockResolvedValue({ data: [{}], error: null });
  updateMock.mockReturnValue({ eq: eqUpdateMock });

  insertMock.mockResolvedValue({ data: [{}], error: null });

  fromMock.mockReturnValue({
    insert: insertMock,
    update: updateMock,
    select: selectMock,
  });
}

beforeEach(async () => {
  await offlineDB.mutationQueue.clear();
  await offlineDB.conflicts.clear();
  [insertMock, updateMock, selectMock, eqUpdateMock, eqSelectMock, maybeSingleMock, fromMock]
    .forEach((m) => m.mockReset());
});

afterEach(() => setOnline(true));

// ---------- Unit tests do resolver ----------

describe('last-write-wins (unit)', () => {
  const base = { phone: '111', updated_at: '2026-01-01T00:00:00Z' };
  const local = { phone: '222' };
  const serverNewer = { phone: '333', updated_at: '2026-01-10T12:00:00Z' };
  const serverOlder = { phone: '333', updated_at: '2026-01-05T08:00:00Z' };
  const analysis = analyzeConflict(local, base, serverNewer);

  it('escolhe local quando edição offline é mais recente que o servidor', () => {
    const localEditedAt = new Date('2026-01-08T10:00:00Z').getTime();
    const r = resolveConflict('last-write-wins', local, base, serverOlder, analysis, localEditedAt);
    expect(r.payload).toEqual({ phone: '222' });
    expect(r.requiresManualReview).toBe(false);
  });

  it('escolhe servidor (descarta local) quando servidor é mais recente', () => {
    const localEditedAt = new Date('2026-01-08T10:00:00Z').getTime();
    const r = resolveConflict('last-write-wins', local, base, serverNewer, analysis, localEditedAt);
    expect(r.payload).toBeNull();
    expect(r.requiresManualReview).toBe(false);
  });

  it('em empate vence o local (fallback determinístico)', () => {
    const sameTs = '2026-01-05T08:00:00Z';
    const r = resolveConflict(
      'last-write-wins',
      local,
      base,
      { ...serverOlder, updated_at: sameTs },
      analysis,
      new Date(sameTs).getTime()
    );
    expect(r.payload).toEqual({ phone: '222' });
  });

  it('quando timestamps são inválidos, fallback para local-wins', () => {
    const r = resolveConflict('last-write-wins', local, base, { phone: '333' }, analysis, undefined);
    expect(r.payload).toEqual({ phone: '222' });
  });
});

// ---------- Integration tests via syncEngine ----------

describe('last-write-wins (integração com syncEngine)', () => {
  it('aplica payload local quando edição offline é mais recente que servidor', async () => {
    const offlineEditTs = new Date('2026-02-15T14:00:00Z').getTime();
    await offlineDB.mutationQueue.add({
      module: 'farmers',
      table: 'farmers',
      operation: 'update',
      payload: { phone: '999' },
      matchKey: { column: 'id', value: 'f-1' },
      baseRow: { phone: '111', updated_at: '2026-02-01T00:00:00Z' },
      baseUpdatedAt: '2026-02-01T00:00:00Z',
      conflictStrategy: 'last-write-wins',
      createdAt: offlineEditTs,
      retries: 0,
      status: 'pending',
    });

    setOnline(true);
    // Servidor mexeu no mesmo campo, mas ANTES da edição offline
    wireFrom({ id: 'f-1', phone: '555', updated_at: '2026-02-10T10:00:00Z' });

    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    expect(r.conflicts).toBe(0);
    expect(updateMock).toHaveBeenCalledWith({ phone: '999' });
    expect(await offlineDB.conflicts.count()).toBe(0);
    expect(await offlineDB.mutationQueue.count()).toBe(0);
  });

  it('descarta mutation local quando servidor é mais recente', async () => {
    const offlineEditTs = new Date('2026-02-15T14:00:00Z').getTime();
    await offlineDB.mutationQueue.add({
      module: 'farmers',
      table: 'farmers',
      operation: 'update',
      payload: { phone: '999' },
      matchKey: { column: 'id', value: 'f-1' },
      baseRow: { phone: '111', updated_at: '2026-02-01T00:00:00Z' },
      baseUpdatedAt: '2026-02-01T00:00:00Z',
      conflictStrategy: 'last-write-wins',
      createdAt: offlineEditTs,
      retries: 0,
      status: 'pending',
    });

    setOnline(true);
    // Servidor foi actualizado DEPOIS da edição offline → vence o servidor
    wireFrom({ id: 'f-1', phone: '777', updated_at: '2026-02-20T09:00:00Z' });

    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    expect(r.conflicts).toBe(0);
    expect(updateMock).not.toHaveBeenCalled();
    expect(await offlineDB.conflicts.count()).toBe(0);
    expect(await offlineDB.mutationQueue.count()).toBe(0);
  });

  it('cenário típico: dois técnicos editam o mesmo agricultor — vence o que editou mais tarde', async () => {
    // Técnico A edita offline às 10h
    const tecnicoA_ts = new Date('2026-03-01T10:00:00Z').getTime();
    await offlineDB.mutationQueue.add({
      module: 'farmers',
      table: 'farmers',
      operation: 'update',
      payload: { phone: 'A-999', name: 'Editado por A' },
      matchKey: { column: 'id', value: 'shared-row' },
      baseRow: { phone: '000', name: 'Original', updated_at: '2026-03-01T08:00:00Z' },
      baseUpdatedAt: '2026-03-01T08:00:00Z',
      conflictStrategy: 'last-write-wins',
      createdAt: tecnicoA_ts,
      retries: 0,
      status: 'pending',
    });

    setOnline(true);
    // Entretanto o Técnico B editou online às 11h (mais recente)
    wireFrom({
      id: 'shared-row',
      phone: 'B-555',
      name: 'Editado por B',
      updated_at: '2026-03-01T11:00:00Z',
    });

    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    // A edição de A é descartada porque B foi mais recente
    expect(updateMock).not.toHaveBeenCalled();
    expect(await offlineDB.mutationQueue.count()).toBe(0);
    expect(await offlineDB.conflicts.count()).toBe(0);
  });

  it('fast path mantém-se: se servidor não mudou, aplica directo (sem comparar timestamps)', async () => {
    await offlineDB.mutationQueue.add({
      module: 'farmers',
      table: 'farmers',
      operation: 'update',
      payload: { phone: '999' },
      matchKey: { column: 'id', value: 'f-1' },
      baseRow: { phone: '111', updated_at: '2026-04-01T00:00:00Z' },
      baseUpdatedAt: '2026-04-01T00:00:00Z',
      conflictStrategy: 'last-write-wins',
      createdAt: Date.now(),
      retries: 0,
      status: 'pending',
    });

    setOnline(true);
    // Servidor com mesmo updated_at → não há concorrência
    wireFrom({ id: 'f-1', phone: '111', updated_at: '2026-04-01T00:00:00Z' });

    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    expect(updateMock).toHaveBeenCalledWith({ phone: '999' });
  });
});
