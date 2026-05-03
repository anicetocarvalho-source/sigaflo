/**
 * Testes de sincronização offline → online.
 *
 * Valida que:
 *  - Mutations executadas offline (cadastro de agricultor, ocorrência) são
 *    enfileiradas no IndexedDB em vez de chamar a rede.
 *  - Ao voltar a rede, syncNow() processa a fila por ordem cronológica e
 *    invoca os endpoints corretos do Supabase.
 *  - Items bem-sucedidos são removidos da fila; falhas incrementam retries
 *    e são marcadas como `failed` ao fim de 3 tentativas.
 *  - Múltiplas mutations enfileiradas offline sincronizam todas em ordem.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock do cliente Supabase ANTES de importar os módulos sob teste.
const insertMock = vi.fn();
const updateMock = vi.fn();
const eqMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

import { offlineDB, enqueueMutation } from "@/lib/offline/db";
import { syncNow } from "@/lib/offline/syncEngine";

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
}

function mockInsertSuccess() {
  insertMock.mockResolvedValue({ data: [{ id: "srv-1" }], error: null });
  fromMock.mockReturnValue({ insert: insertMock });
}

function mockInsertFailure(message = "rls violation") {
  insertMock.mockResolvedValue({ data: null, error: { message } });
  fromMock.mockReturnValue({ insert: insertMock });
}

function mockUpdateSuccess() {
  eqMock.mockResolvedValue({ data: [{ id: "srv-2" }], error: null });
  updateMock.mockReturnValue({ eq: eqMock });
  fromMock.mockReturnValue({ update: updateMock });
}

beforeEach(async () => {
  await offlineDB.mutationQueue.clear();
  insertMock.mockReset();
  updateMock.mockReset();
  eqMock.mockReset();
  fromMock.mockReset();
});

afterEach(() => {
  setOnline(true);
});

describe("Sincronização offline → online", () => {
  it("enfileira um cadastro de agricultor quando offline", async () => {
    setOnline(false);

    await enqueueMutation({
      module: "farmers",
      table: "farmers",
      operation: "insert",
      payload: { name: "João Field", farmer_type: "individual" },
      invalidateKeys: [["farmers"]],
    });

    const queued = await offlineDB.mutationQueue.toArray();
    expect(queued).toHaveLength(1);
    expect(queued[0].module).toBe("farmers");
    expect(queued[0].operation).toBe("insert");
    expect(queued[0].status).toBe("pending");
    expect(queued[0].retries).toBe(0);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("processa a fila ao voltar a rede e remove items sincronizados", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "occurrences",
      table: "phytosanitary_occurrences",
      operation: "insert",
      payload: { description: "Praga detectada", severity: "high" },
    });

    setOnline(true);
    mockInsertSuccess();

    const result = await syncNow(true);

    expect(result.ok).toBe(1);
    expect(result.failed).toBe(0);
    expect(fromMock).toHaveBeenCalledWith("phytosanitary_occurrences");
    expect(insertMock).toHaveBeenCalledWith({
      description: "Praga detectada",
      severity: "high",
    });
    expect(await offlineDB.mutationQueue.count()).toBe(0);
  });

  it("não processa nada se permanecer offline", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers",
      table: "farmers",
      operation: "insert",
      payload: { name: "Maria" },
    });

    const result = await syncNow(true);
    expect(result.ok).toBe(0);
    expect(result.failed).toBe(0);
    expect(insertMock).not.toHaveBeenCalled();
    expect(await offlineDB.mutationQueue.count()).toBe(1);
  });

  it("respeita ordem cronológica ao sincronizar várias mutations", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers",
      table: "farmers",
      operation: "insert",
      payload: { name: "Primeiro" },
    });
    await new Promise((r) => setTimeout(r, 5));
    await enqueueMutation({
      module: "occurrences",
      table: "climate_occurrences",
      operation: "insert",
      payload: { description: "Segundo" },
    });

    setOnline(true);
    insertMock.mockResolvedValue({ data: [{}], error: null });
    fromMock.mockReturnValue({ insert: insertMock });

    await syncNow(true);

    const tables = fromMock.mock.calls.map((c) => c[0]);
    expect(tables).toEqual(["farmers", "climate_occurrences"]);
    expect(await offlineDB.mutationQueue.count()).toBe(0);
  });

  it("marca como failed após 3 tentativas falhadas", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers",
      table: "farmers",
      operation: "insert",
      payload: { name: "Erro" },
    });

    setOnline(true);
    mockInsertFailure("permission denied");

    await syncNow(true);
    let item = (await offlineDB.mutationQueue.toArray())[0];
    expect(item.retries).toBe(1);
    expect(item.status).toBe("pending");
    expect(item.lastError).toContain("permission denied");

    await syncNow(true);
    await syncNow(true);

    item = (await offlineDB.mutationQueue.toArray())[0];
    expect(item.retries).toBe(3);
    expect(item.status).toBe("failed");
  });

  it("sincroniza updates com matchKey", async () => {
    setOnline(false);
    await enqueueMutation({
      module: "farmers",
      table: "farmers",
      operation: "update",
      payload: { name: "Atualizado" },
      matchKey: { column: "id", value: "abc-123" },
    });

    setOnline(true);
    mockUpdateSuccess();

    const result = await syncNow(true);

    expect(result.ok).toBe(1);
    expect(updateMock).toHaveBeenCalledWith({ name: "Atualizado" });
    expect(eqMock).toHaveBeenCalledWith("id", "abc-123");
    expect(await offlineDB.mutationQueue.count()).toBe(0);
  });

  it("cenário fim-a-fim: cadastro + ocorrência offline, sincronizam ao voltar a rede", async () => {
    setOnline(false);

    // Técnico no campo regista um agricultor e reporta uma ocorrência sem rede.
    await enqueueMutation({
      module: "farmers",
      table: "farmers",
      operation: "insert",
      payload: { name: "Cadastro Campo", farmer_type: "individual" },
      invalidateKeys: [["farmers"]],
    });
    await new Promise((r) => setTimeout(r, 5));
    await enqueueMutation({
      module: "occurrences",
      table: "phytosanitary_occurrences",
      operation: "insert",
      payload: { description: "Foco de praga", severity: "critical" },
      invalidateKeys: [["occurrences"]],
    });

    expect(await offlineDB.mutationQueue.count()).toBe(2);

    // Volta a rede.
    setOnline(true);
    insertMock.mockResolvedValue({ data: [{ id: "ok" }], error: null });
    fromMock.mockReturnValue({ insert: insertMock });

    const result = await syncNow(true);

    expect(result.ok).toBe(2);
    expect(result.failed).toBe(0);
    expect(await offlineDB.mutationQueue.count()).toBe(0);
    expect(fromMock).toHaveBeenCalledWith("farmers");
    expect(fromMock).toHaveBeenCalledWith("phytosanitary_occurrences");
  });
});
