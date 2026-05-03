import Dexie, { Table } from 'dexie';

export type ConflictStrategy = 'server-wins' | 'local-wins' | 'merge' | 'manual';

export interface QueuedMutation {
  id?: number;
  module: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  payload: any;
  matchKey?: { column: string; value: any };
  invalidateKeys?: string[][];
  createdAt: number;
  retries: number;
  lastError?: string;
  status: 'pending' | 'syncing' | 'failed';
  /** Snapshot of the row's updated_at at the moment the offline edit started.
   *  Used to detect concurrent server-side updates ("base version" in 3-way merge). */
  baseUpdatedAt?: string | null;
  /** Snapshot of the original row when the offline edit started (for 3-way merge). */
  baseRow?: Record<string, any> | null;
  /** Strategy to apply if a conflict is detected during sync. */
  conflictStrategy?: ConflictStrategy;
}

export interface PendingConflict {
  id?: number;
  module: string;
  table: string;
  matchKey: { column: string; value: any };
  localPayload: any;
  baseRow: Record<string, any> | null;
  serverRow: Record<string, any>;
  detectedAt: number;
  /** Fields that diverge between local (offline) and server. */
  conflictingFields: string[];
}

class OfflineDB extends Dexie {
  mutationQueue!: Table<QueuedMutation, number>;
  conflicts!: Table<PendingConflict, number>;

  constructor() {
    super('sigaflo-offline');
    this.version(1).stores({
      mutationQueue: '++id, status, createdAt, module',
    });
    this.version(2).stores({
      mutationQueue: '++id, status, createdAt, module',
      conflicts: '++id, table, detectedAt',
    });
  }
}

export const offlineDB = new OfflineDB();

export async function enqueueMutation(
  m: Omit<QueuedMutation, 'id' | 'createdAt' | 'retries' | 'status'>
) {
  return offlineDB.mutationQueue.add({
    ...m,
    createdAt: Date.now(),
    retries: 0,
    status: 'pending',
  });
}

export async function getPendingMutations() {
  return offlineDB.mutationQueue.where('status').notEqual('syncing').toArray();
}

export async function countPending() {
  return offlineDB.mutationQueue.where('status').notEqual('syncing').count();
}

export async function getConflicts() {
  return offlineDB.conflicts.orderBy('detectedAt').reverse().toArray();
}

export async function countConflicts() {
  return offlineDB.conflicts.count();
}
