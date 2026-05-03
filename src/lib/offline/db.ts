import Dexie, { Table } from 'dexie';

export interface QueuedMutation {
  id?: number;
  module: string; // 'farmers' | 'pos' | 'occurrences' | 'production' | ...
  table: string; // supabase table name
  operation: 'insert' | 'update' | 'delete';
  payload: any; // row data or { id, changes } for update
  matchKey?: { column: string; value: any }; // for update/delete
  invalidateKeys?: string[][]; // react-query keys to invalidate after sync
  createdAt: number;
  retries: number;
  lastError?: string;
  status: 'pending' | 'syncing' | 'failed';
}

class OfflineDB extends Dexie {
  mutationQueue!: Table<QueuedMutation, number>;

  constructor() {
    super('sigaflo-offline');
    this.version(1).stores({
      mutationQueue: '++id, status, createdAt, module',
    });
  }
}

export const offlineDB = new OfflineDB();

export async function enqueueMutation(m: Omit<QueuedMutation, 'id' | 'createdAt' | 'retries' | 'status'>) {
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
