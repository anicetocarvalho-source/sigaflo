/**
 * Testes de sincronização offline → online (incluindo resolução de conflitos).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const insertMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();
const selectMock = vi.fn();
const eqUpdateMock = vi.fn();
const eqDeleteMock = vi.fn();
const eqSelectMock = vi.fn();
const maybeSingleMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (...args: any[]) => fromMock(...args) },
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

import { offlineDB, enqueueMutation } from "@/lib/offline/db";
import { syncNow } from "@/lib/offline/syncEngine";
import { analyzeConflict, resolveConflict } from "@/lib/offline/conflictResolver";

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", { configurable: true, get: () => value });
}

/** Wires the from() builder so each chain returns its own mock. */
function wireFrom(serverRow: Record<string, any> | null = null) {
  maybeSingleMock.mockResolvedValue({ data: serverRow, error: null });
  eqSelectMock.mockReturnValue({ maybeSingle: maybeSingleMock });
  selectMock.mockReturnValue({ eq: eqSelectMock });

  eqUpdateMock.mockResolvedValue({ data: [{}], error: null });
  updateMock.mockReturnValue({ eq: eqUpdateMock });

  eqDeleteMock.mockResolvedValue({ data: [{}], error: null });
  deleteMock.mockReturnValue({ eq: eqDeleteMock });

  insertMock.mockResolvedValue({ data: [{}], error: null });

  fromMock.mockReturnValue({
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
    select: selectMock,
  });
}

beforeEach(async () => {
  await offlineDB.mutationQueue.clear();
  await offlineDB.conflicts.clear();
  [insertMock, updateMock, deleteMock, selectMock, eqUpdateMock, eqDeleteMock, eqSelectMock, maybeSingleMock, fromMock]
    .forEach((m) => m.mockReset());
});

afterEach(() => setOnline(true));

// ---------- Conflict resolver unit tests ----------

describe("Resolução de conflitos (3-way merge)", () => {
  it("não detecta conflito quando local e servidor mudam campos diferentes", () => {
    const base = { name: "João", phone: "111", area: 5 };
    const local = { phone: "222" };
    const server = { name: "João Silva", phone: "111", area: 5, updated_at: "2026-01-02" };
    const a = analyzeConflict(local, base, server);
    expect(a.hasConflict).toBe(false);
    expect(a.localChanged).toEqual(["phone"]);
    expect(a.serverChanged).toEqual(["name"]);
  });

  it("detecta conflito real quando ambos alteram o mesmo campo", () => {
    const base = { phone: "111" };
    const local = { phone: "222" };
    const server = { phone: "333", updated_at: "2026-01-02" };
    const a = analyzeConflict(local, base, server);
    expect(a.hasConflict).toBe(true);
    expect(a.conflictingFields).toEqual(["phone"]);
  });

  it("merge mantém alterações do servidor + alterações locais não conflituantes", () => {
    const base = { name: "João", phone: "111", area: 5 };
    const local = { phone: "222" };
    const server = { name: "João Silva", phone: "111", area: 5, updated_at: "x" };
    const a = analyzeConflict(local, base, server);
    const r = resolveConflict("merge", local, base, server, a);
    expect(r.payload).toEqual({ name: "João Silva", phone: "222", area: 5 });
    expect(r.requiresManualReview).toBe(false);
  });

  it("merge sinaliza revisão manual quando há conflito real num campo", () => {
    const base = { phone: "111", area: 5 };
    const local = { phone: "222", area: 7 };
    const server = { phone: "333", area: 5, updated_at: "x" };
    const a = analyzeConflict(local, base, server);
    const r = resolveConflict("merge", local, base, server, a);
    expect(r.requiresManualReview).toBe(true);
    expect(r.unresolvedFields).toEqual(["phone"]);
    expect(r.payload!.area).toBe(7); // não conflituante aplicado
  });

  it("server-wins descarta payload local", () => {
    const r = resolveConflict("server-wins", { phone: "222" }, { phone: "111" }, { phone: "333" }, {
      hasConflict: true, conflictingFields: ["phone"], localChanged: ["phone"], serverChanged: ["phone"],
    });
    expect(r.payload).toBeNull();
  });

  it("local-wins força payload local mesmo com conflito", () => {
    const r = resolveConflict("local-wins", { phone: "222" }, { phone: "111" }, { phone: "333" }, {
      hasConflict: true, conflictingFields: ["phone"], localChanged: ["phone"], serverChanged: ["phone"],
    });
    expect(r.payload).toEqual({ phone: "222" });
  });
});

// ---------- Sync engine integration tests ----------

describe("Sincronização offline → online", () => {
  it("enfileira cadastro quando offline", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers", table: "farmers", operation: "insert",
      payload: { name: "Cadastro" },
    });
    expect(await offlineDB.mutationQueue.count()).toBe(1);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("sincroniza insert ao voltar à rede", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "occurrences", table: "phytosanitary_occurrences", operation: "insert",
      payload: { description: "Praga" },
    });
    setOnline(true);
    wireFrom();
    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    expect(insertMock).toHaveBeenCalledWith({ description: "Praga" });
    expect(await offlineDB.mutationQueue.count()).toBe(0);
  });

  it("UPDATE sem alteração concorrente aplica payload directamente", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers", table: "farmers", operation: "update",
      payload: { phone: "999" },
      matchKey: { column: "id", value: "f-1" },
      baseRow: { phone: "111", name: "João", updated_at: "2026-01-01T00:00:00Z" },
      baseUpdatedAt: "2026-01-01T00:00:00Z",
      conflictStrategy: "merge",
    });
    setOnline(true);
    // server unchanged (same updated_at)
    wireFrom({ id: "f-1", phone: "111", name: "João", updated_at: "2026-01-01T00:00:00Z" });
    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    expect(updateMock).toHaveBeenCalledWith({ phone: "999" });
    expect(await offlineDB.mutationQueue.count()).toBe(0);
  });

  it("UPDATE com merge auto-resolve quando campos alterados são disjuntos", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers", table: "farmers", operation: "update",
      payload: { phone: "999" },
      matchKey: { column: "id", value: "f-1" },
      baseRow: { phone: "111", name: "João", updated_at: "2026-01-01T00:00:00Z" },
      baseUpdatedAt: "2026-01-01T00:00:00Z",
      conflictStrategy: "merge",
    });
    setOnline(true);
    // servidor alterou nome, local altera telefone — sem conflito real
    wireFrom({ id: "f-1", phone: "111", name: "João Silva", updated_at: "2026-01-02T00:00:00Z" });
    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    expect(r.conflicts).toBe(0);
    // payload enviado contém só o campo local (servidor preserva 'name' naturalmente)
    expect(updateMock).toHaveBeenCalledWith({ phone: "999" });
    expect(await offlineDB.conflicts.count()).toBe(0);
  });

  it("UPDATE com conflito real é movido para fila de conflitos", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers", table: "farmers", operation: "update",
      payload: { phone: "999" },
      matchKey: { column: "id", value: "f-1" },
      baseRow: { phone: "111", updated_at: "2026-01-01T00:00:00Z" },
      baseUpdatedAt: "2026-01-01T00:00:00Z",
      conflictStrategy: "merge",
    });
    setOnline(true);
    // servidor também alterou phone — conflito
    wireFrom({ id: "f-1", phone: "555", updated_at: "2026-01-02T00:00:00Z" });
    const r = await syncNow(true);
    expect(r.ok).toBe(0);
    expect(r.conflicts).toBe(1);
    expect(updateMock).not.toHaveBeenCalled();
    expect(await offlineDB.mutationQueue.count()).toBe(0);
    const conflicts = await offlineDB.conflicts.toArray();
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].conflictingFields).toEqual(["phone"]);
    expect(conflicts[0].serverRow.phone).toBe("555");
    expect(conflicts[0].localPayload.phone).toBe("999");
  });

  it("estratégia local-wins sobrescreve servidor mesmo em conflito", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers", table: "farmers", operation: "update",
      payload: { phone: "999" },
      matchKey: { column: "id", value: "f-1" },
      baseRow: { phone: "111", updated_at: "2026-01-01T00:00:00Z" },
      baseUpdatedAt: "2026-01-01T00:00:00Z",
      conflictStrategy: "local-wins",
    });
    setOnline(true);
    wireFrom({ id: "f-1", phone: "555", updated_at: "2026-01-02T00:00:00Z" });
    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    expect(updateMock).toHaveBeenCalledWith({ phone: "999" });
    expect(await offlineDB.conflicts.count()).toBe(0);
  });

  it("estratégia server-wins descarta a mutation silenciosamente", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers", table: "farmers", operation: "update",
      payload: { phone: "999" },
      matchKey: { column: "id", value: "f-1" },
      baseRow: { phone: "111", updated_at: "2026-01-01T00:00:00Z" },
      baseUpdatedAt: "2026-01-01T00:00:00Z",
      conflictStrategy: "server-wins",
    });
    setOnline(true);
    wireFrom({ id: "f-1", phone: "555", updated_at: "2026-01-02T00:00:00Z" });
    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    expect(updateMock).not.toHaveBeenCalled();
    expect(await offlineDB.mutationQueue.count()).toBe(0);
  });

  it("DELETE de linha já removida no servidor é idempotente", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers", table: "farmers", operation: "delete",
      payload: {}, matchKey: { column: "id", value: "f-1" },
    });
    setOnline(true);
    wireFrom(null); // server says: row not found
    const r = await syncNow(true);
    expect(r.ok).toBe(1);
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
