/**
 * Conflict resolution for offline mutations.
 *
 * When a row is modified both offline and online before sync, we use the
 * snapshot taken when the offline edit began (`baseRow` / `baseUpdatedAt`)
 * as the common ancestor for a 3-way comparison against the current server row.
 *
 * Strategies:
 *  - 'server-wins': discard local changes (drop mutation).
 *  - 'local-wins' (default): overwrite server with local payload.
 *  - 'merge': field-level 3-way merge — keep server changes for fields the
 *     user did not touch, keep local changes for fields the server did not
 *     touch, and flag remaining true conflicts for manual review.
 *  - 'manual': always park as a pending conflict for the user to resolve.
 *  - 'last-write-wins': compare the local edit timestamp (`localEditedAt`)
 *     against the server's `updated_at`; the most recent wins. If neither
 *     timestamp is available, falls back to local-wins.
 */
import type { QueuedMutation, PendingConflict, ConflictStrategy } from './db';

export interface ConflictAnalysis {
  hasConflict: boolean;
  conflictingFields: string[];
  /** Fields the local user changed (vs base). */
  localChanged: string[];
  /** Fields the server changed (vs base). */
  serverChanged: string[];
}

const META_FIELDS = new Set([
  'id',
  'created_at',
  'updated_at',
  'created_by',
  'updated_by',
]);

function diffKeys(a: Record<string, any>, b: Record<string, any>): string[] {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const out: string[] = [];
  for (const k of keys) {
    if (META_FIELDS.has(k)) continue;
    if (JSON.stringify(a?.[k]) !== JSON.stringify(b?.[k])) out.push(k);
  }
  return out;
}

export function analyzeConflict(
  localPayload: Record<string, any>,
  baseRow: Record<string, any> | null | undefined,
  serverRow: Record<string, any>
): ConflictAnalysis {
  const base = baseRow || {};
  const localChanged = Object.keys(localPayload).filter(
    (k) => !META_FIELDS.has(k) && JSON.stringify(localPayload[k]) !== JSON.stringify(base[k])
  );
  const serverChanged = diffKeys(base, serverRow);
  const conflictingFields = localChanged.filter((k) => serverChanged.includes(k));
  return {
    hasConflict: conflictingFields.length > 0,
    conflictingFields,
    localChanged,
    serverChanged,
  };
}

export interface ResolutionResult {
  /** New payload to send to server, or null to drop the mutation. */
  payload: Record<string, any> | null;
  /** True if there are unresolved field-level conflicts the user must arbitrate. */
  requiresManualReview: boolean;
  /** Fields that could not be auto-merged. */
  unresolvedFields: string[];
}

export function resolveConflict(
  strategy: ConflictStrategy,
  localPayload: Record<string, any>,
  baseRow: Record<string, any> | null | undefined,
  serverRow: Record<string, any>,
  analysis: ConflictAnalysis,
  /** Wall-clock time the offline edit was made. Used by 'last-write-wins'. */
  localEditedAt?: number | string | null
): ResolutionResult {
  if (strategy === 'server-wins') {
    return { payload: null, requiresManualReview: false, unresolvedFields: [] };
  }

  if (strategy === 'local-wins') {
    return { payload: localPayload, requiresManualReview: false, unresolvedFields: [] };
  }

  if (strategy === 'manual') {
    return {
      payload: null,
      requiresManualReview: true,
      unresolvedFields: analysis.conflictingFields,
    };
  }

  if (strategy === 'last-write-wins') {
    const localTs = localEditedAt ? new Date(localEditedAt).getTime() : NaN;
    const serverTs = serverRow?.updated_at ? new Date(serverRow.updated_at).getTime() : NaN;
    // If timestamps are missing or equal → keep local (deterministic fallback).
    if (Number.isFinite(localTs) && Number.isFinite(serverTs) && serverTs > localTs) {
      return { payload: null, requiresManualReview: false, unresolvedFields: [] };
    }
    return { payload: localPayload, requiresManualReview: false, unresolvedFields: [] };
  }

  // 'merge' — 3-way field-level merge.
  // Start from current server row, apply local changes for fields the server did NOT change.
  const merged: Record<string, any> = { ...serverRow };
  const unresolved: string[] = [];
  for (const field of analysis.localChanged) {
    if (analysis.serverChanged.includes(field)) {
      // Real conflict on this field — leave server value, flag for review.
      unresolved.push(field);
    } else {
      merged[field] = localPayload[field];
    }
  }
  // Strip metadata so the UPDATE only sends the merged business fields.
  for (const k of META_FIELDS) delete merged[k];

  return {
    payload: merged,
    requiresManualReview: unresolved.length > 0,
    unresolvedFields: unresolved,
  };
}

export function buildPendingConflict(
  mutation: QueuedMutation,
  serverRow: Record<string, any>,
  conflictingFields: string[]
): Omit<PendingConflict, 'id'> {
  return {
    module: mutation.module,
    table: mutation.table,
    matchKey: mutation.matchKey!,
    localPayload: mutation.payload,
    baseRow: mutation.baseRow ?? null,
    serverRow,
    detectedAt: Date.now(),
    conflictingFields,
  };
}
