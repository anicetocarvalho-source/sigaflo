import { supabase } from '@/integrations/supabase/client';
import { offlineDB, getPendingMutations, type QueuedMutation } from './db';
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

async function executeMutation(m: QueuedMutation): Promise<void> {
  const tbl = (supabase as any).from(m.table);
  if (m.operation === 'insert') {
    const { error } = await tbl.insert(m.payload);
    if (error) throw error;
  } else if (m.operation === 'update' && m.matchKey) {
    const { error } = await tbl.update(m.payload).eq(m.matchKey.column, m.matchKey.value);
    if (error) throw error;
  } else if (m.operation === 'delete' && m.matchKey) {
    const { error } = await tbl.delete().eq(m.matchKey.column, m.matchKey.value);
    if (error) throw error;
  } else {
    throw new Error('Operação inválida');
  }
}

export async function syncNow(silent = false): Promise<{ ok: number; failed: number }> {
  if (syncing) return { ok: 0, failed: 0 };
  if (!navigator.onLine) return { ok: 0, failed: 0 };
  syncing = true;
  notify();
  let ok = 0;
  let failed = 0;
  try {
    const items = await getPendingMutations();
    if (!silent && items.length > 0) {
      toast.info(`Sincronizando ${items.length} ${items.length === 1 ? 'item' : 'itens'}...`);
    }
    for (const m of items.sort((a, b) => a.createdAt - b.createdAt)) {
      try {
        await offlineDB.mutationQueue.update(m.id!, { status: 'syncing' });
        await executeMutation(m);
        await offlineDB.mutationQueue.delete(m.id!);
        ok++;
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
    if (!silent && failed > 0) toast.error(`${failed} ${failed === 1 ? 'item falhou' : 'itens falharam'} a sincronizar`);
  } finally {
    syncing = false;
    notify();
  }
  return { ok, failed };
}

export function isSyncing() {
  return syncing;
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

  // initial sweep + periodic retry
  if (navigator.onLine) syncNow(true);
  setInterval(() => {
    if (navigator.onLine) syncNow(true);
  }, 60_000);
}
