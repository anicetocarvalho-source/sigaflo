import { supabase } from '@/integrations/supabase/client';
import { offlineDB, getPendingMutations, type QueuedMutation } from './db';
import { analyzeConflict, resolveConflict, buildPendingConflict } from './conflictResolver';
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

let queryClient: QueryClient | null = null;
let syncing = false;
const listeners = new Set<() => void>();

export function setSyncQueryClient(qc: QueryClient) {
  queryClient = qc;
}

export function subscribeSync(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((l) => l());
}

type ExecOutcome =
  | { kind: 'ok' }
  | { kind: 'conflict-parked'; fields: string[] }
  | { kind: 'discarded' };

async function fetchServerRow(table: string, column: string, value: any) {
  const { data, error } = await (supabase as any)
    .from(table)
    .select('*')
    .eq(column, value)
    .maybeSingle();
  if (error) throw error;
  return data as Record<string, any> | null;
}

async function executeMutation(m: QueuedMutation): Promise<ExecOutcome> {
  const tbl = (supabase as any).from(m.table);

  // INSERT — no conflict detection needed (server enforces uniqueness via constraints).
  if (m.operation === 'insert') {
    const { error } = await tbl.insert(m.payload);
    if (error) throw error;
    return { kind: 'ok' };
  }

  if ((m.operation === 'update' || m.operation === 'delete') && m.matchKey) {
    // Conflict check — fetch current server row.
    const serverRow = await fetchServerRow(m.table, m.matchKey.column, m.matchKey.value);

    // Row deleted on server but we want to update/delete it.
    if (!serverRow) {
      if (m.operation === 'delete') return { kind: 'ok' }; // Already gone — idempotent.
      throw new Error('Linha já não existe no servidor');
    }

    if (m.operation === 'delete') {
      const { error } = await tbl.delete().eq(m.matchKey.column, m.matchKey.value);
      if (error) throw error;
      return { kind: 'ok' };
    }

    // UPDATE path with 3-way conflict detection.
    const baseUpdatedAt = m.baseUpdatedAt ?? null;
    const serverUpdatedAt = serverRow.updated_at ?? null;
    const serverChangedSinceOffline =
      baseUpdatedAt && serverUpdatedAt && new Date(serverUpdatedAt).getTime() > new Date(baseUpdatedAt).getTime();

    if (!serverChangedSinceOffline) {
      // Fast path — server row hasn't moved, apply local payload.
      const { error } = await tbl.update(m.payload).eq(m.matchKey.column, m.matchKey.value);
      if (error) throw error;
      return { kind: 'ok' };
    }

    // Concurrent edit detected — analyze and resolve.
    const analysis = analyzeConflict(m.payload, m.baseRow, serverRow);
    if (!analysis.hasConflict) {
      // Server changed unrelated fields — safe to update only what we touched.
      const { error } = await tbl.update(m.payload).eq(m.matchKey.column, m.matchKey.value);
      if (error) throw error;
      return { kind: 'ok' };
    }

    const strategy = m.conflictStrategy ?? 'merge';
    const resolution = resolveConflict(strategy, m.payload, m.baseRow, serverRow, analysis);

    if (resolution.requiresManualReview) {
      await offlineDB.conflicts.add(
        buildPendingConflict(m, serverRow, resolution.unresolvedFields) as any
      );
      return { kind: 'conflict-parked', fields: resolution.unresolvedFields };
    }

    if (resolution.payload === null) {
      // server-wins — drop the mutation.
      return { kind: 'discarded' };
    }

    const { error } = await tbl.update(resolution.payload).eq(m.matchKey.column, m.matchKey.value);
    if (error) throw error;
    return { kind: 'ok' };
  }

  throw new Error('Operação inválida');
}

export async function syncNow(silent = false): Promise<{ ok: number; failed: number; conflicts: number }> {
  if (syncing) return { ok: 0, failed: 0, conflicts: 0 };
  if (!navigator.onLine) return { ok: 0, failed: 0, conflicts: 0 };
  syncing = true;
  notify();
  let ok = 0;
  let failed = 0;
  let conflicts = 0;
  try {
    const items = await getPendingMutations();
    if (!silent && items.length > 0) {
      toast.info(`Sincronizando ${items.length} ${items.length === 1 ? 'item' : 'itens'}...`);
    }
    for (const m of items.sort((a, b) => a.createdAt - b.createdAt)) {
      try {
        await offlineDB.mutationQueue.update(m.id!, { status: 'syncing' });
        const outcome = await executeMutation(m);
        await offlineDB.mutationQueue.delete(m.id!);
        if (outcome.kind === 'conflict-parked') {
          conflicts++;
        } else {
          ok++;
        }
        if (queryClient && m.invalidateKeys) {
          m.invalidateKeys.forEach((key) => queryClient!.invalidateQueries({ queryKey: key }));
        }
      } catch (err: any) {
        failed++;
        const retries = m.retries + 1;
        await offlineDB.mutationQueue.update(m.id!, {
          status: retries >= 3 ? 'failed' : 'pending',
          retries,
          lastError: err?.message || String(err),
        });
      }
    }
    if (!silent && ok > 0) toast.success(`${ok} ${ok === 1 ? 'item sincronizado' : 'itens sincronizados'}`);
    if (!silent && conflicts > 0) {
      toast.warning(
        `${conflicts} ${conflicts === 1 ? 'conflito detectado' : 'conflitos detectados'} — revisão manual necessária`
      );
    }
    if (!silent && failed > 0) toast.error(`${failed} ${failed === 1 ? 'item falhou' : 'itens falharam'} a sincronizar`);
  } finally {
    syncing = false;
    notify();
  }
  return { ok, failed, conflicts };
}

export function isSyncing() {
  return syncing;
}

/**
 * Resolve a parked conflict by user choice. Re-applies the chosen payload as
 * a fresh mutation (or simply drops the conflict if the user keeps the server version).
 */
export async function resolveParkedConflict(
  conflictId: number,
  choice: 'keep-local' | 'keep-server' | 'custom',
  customPayload?: Record<string, any>
) {
  const c = await offlineDB.conflicts.get(conflictId);
  if (!c) return;
  if (choice === 'keep-server') {
    await offlineDB.conflicts.delete(conflictId);
    return;
  }
  const payload = choice === 'custom' ? customPayload! : c.localPayload;
  const { error } = await (supabase as any)
    .from(c.table)
    .update(payload)
    .eq(c.matchKey.column, c.matchKey.value);
  if (error) throw error;
  await offlineDB.conflicts.delete(conflictId);
}

let initialized = false;
export function initSyncEngine(qc: QueryClient) {
  if (initialized) return;
  initialized = true;
  setSyncQueryClient(qc);

  window.addEventListener('online', () => {
    toast.success('Conexão restaurada');
    syncNow();
  });
  window.addEventListener('offline', () => {
    toast.warning('Sem conexão — alterações serão guardadas localmente');
  });

  if (navigator.onLine) syncNow(true);
  setInterval(() => {
    if (navigator.onLine) syncNow(true);
  }, 60_000);
}
