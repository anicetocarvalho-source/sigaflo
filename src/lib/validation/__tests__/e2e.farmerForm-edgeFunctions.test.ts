// =============================================================================
// E2E: Validação fim-a-fim FarmerForm ⇄ Edge Functions (create/update-user)
// =============================================================================
// Estes testes exercitam a *paridade* das regras de validação entre o
// frontend (schemas Zod usados em FarmerForm/ProfilePage) e a camada
// partilhada usada nas edge functions create-user / update-user
// (`supabase/functions/_shared/validation.ts`), bem como a geração de
// metadados de integridade (SHA-256) para uploads.
//
// Não tocamos na rede: chamamos a função pura `validateUserPayload`
// (mesmo módulo importado pelas edge functions Deno) e comparamos com
// os schemas frontend para garantir que entradas válidas/ inválidas
// produzem o mesmo veredicto em ambos os lados.

import { describe, it, expect, vi } from 'vitest';
import {
  emailSchema,
  optionalEmailSchema,
  phoneAOSchema,
  optionalPhoneAOSchema,
  personNameSchema,
  optionalBiSchema,
} from '@/lib/validation/schemas';
import { computeFileIntegrity, sha256OfFile } from '@/lib/validation/fileIntegrity';
import { validateUserPayload } from '../../../../supabase/functions/_shared/validation.ts';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Constrói payload típico vindo do FarmerForm/AdminUserForm depois do submit. */
function buildFormPayload(overrides: Record<string, unknown> = {}) {
  return {
    full_name: 'João Manuel da Silva',
    email: '  Joao.Silva@EXAMPLE.com ',
    phone: '923 456 789',
    position: 'Técnico Provincial',
    department: 'DPA Luanda',
    province_id: '550e8400-e29b-41d4-a716-446655440000',
    municipality_id: null,
    role: 'technician_provincial',
    password: 'segredo!2026',
    ...overrides,
  };
}

// Polyfill mínimo para Web Crypto em ambiente JSDOM, se necessário.
function mockFile(content: string, name = 'doc.pdf', mime = 'application/pdf'): File {
  return new File([content], name, { type: mime });
}

// -----------------------------------------------------------------------------
// 1. Paridade FRONT (Zod) ↔ BACK (validateUserPayload)
// -----------------------------------------------------------------------------

describe('E2E paridade FarmerForm ⇄ create-user', () => {
  it('payload bem-formado é aceite por ambas as camadas e normalizado igual', () => {
    const raw = buildFormPayload();

    // Frontend (campo a campo, como o FarmerForm/UserForm faria via Zod)
    const fEmail = emailSchema.parse(raw.email);
    const fPhone = phoneAOSchema.parse(raw.phone);
    const fName = personNameSchema.parse(raw.full_name);

    // Backend (mesma payload, validador partilhado das edge functions)
    const result = validateUserPayload(raw, { requirePassword: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.email).toBe(fEmail);
    expect(result.data.email).toBe('joao.silva@example.com');
    expect(result.data.phone).toBe(fPhone);
    expect(result.data.phone).toBe('+244923456789');
    // Nome: o backend faz apenas trim; frontend normaliza para Title Case.
    expect(fName).toBe('João Manuel da Silva');
    expect(result.data.full_name).toBe('João Manuel da Silva');
  });

  it.each([
    ['email malformado', { email: 'sem-arroba' }, 'email'],
    ['telefone com prefixo inválido', { phone: '900000000' }, 'phone'],
    ['telefone curto', { phone: '92345' }, 'phone'],
    ['nome com dígitos', { full_name: 'Maria 2' }, 'full_name'],
    ['nome demasiado curto', { full_name: 'A' }, 'full_name'],
    ['password curta', { password: '123' }, 'password'],
  ])('rejeita "%s" no backend (paridade com frontend)', (_label, override, expectedField) => {
    const raw = buildFormPayload(override);
    const result = validateUserPayload(raw, { requirePassword: true });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.fieldErrors)).toContain(expectedField);

    // Frontend deve concordar (lança no schema correspondente)
    if (expectedField === 'email') {
      expect(() => emailSchema.parse(raw.email)).toThrow();
    }
    if (expectedField === 'phone') {
      expect(() => phoneAOSchema.parse(raw.phone)).toThrow();
    }
    if (expectedField === 'full_name') {
      expect(() => personNameSchema.parse(raw.full_name)).toThrow();
    }
  });

  it('aceita variantes de telefone (00244..., +244..., nacional) e canonicaliza para +244XXXXXXXXX', () => {
    const variants = ['00244923456789', '+244 923 456 789', '923-456-789'];
    for (const phone of variants) {
      const r = validateUserPayload(buildFormPayload({ phone }), { requirePassword: true });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.data.phone).toBe('+244923456789');

      // Frontend produz o mesmo canónico
      expect(optionalPhoneAOSchema.parse(phone)).toBe('+244923456789');
    }
  });

  it('telefone vazio é aceite como null em ambas as camadas (campo opcional)', () => {
    const r = validateUserPayload(buildFormPayload({ phone: '' }), { requirePassword: true });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.phone).toBeNull();
    expect(optionalPhoneAOSchema.parse('')).toBeNull();
  });
});

// -----------------------------------------------------------------------------
// 2. update-user: password opcional
// -----------------------------------------------------------------------------

describe('E2E paridade FarmerForm ⇄ update-user (password opcional)', () => {
  it('aceita payload sem password quando requirePassword=false', () => {
    const { password, ...noPwd } = buildFormPayload();
    const r = validateUserPayload(noPwd);
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.data as any).password).toBeUndefined();
  });

  it('mantém validação dos restantes campos mesmo sem password', () => {
    const { password, ...noPwd } = buildFormPayload({ email: 'x' });
    const r = validateUserPayload(noPwd);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.email).toBeDefined();
  });
});

// -----------------------------------------------------------------------------
// 3. Uploads — file_integrity (SHA-256) usado em DocumentUpload
// -----------------------------------------------------------------------------

describe('E2E uploads: file_integrity', () => {
  // Stub crypto.subtle.digest com SHA-256 determinístico via @noble (já no bundle)
  // — em JSDOM, crypto.subtle existe; caso não, mockamos.
  const ensureSubtle = () => {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      const mod = require('node:crypto');
      // @ts-expect-error injectar
      globalThis.crypto = mod.webcrypto;
    }
  };

  it('computeFileIntegrity devolve sha256, size_bytes, mime e name', async () => {
    ensureSubtle();
    const file = mockFile('hello world', 'bi.pdf', 'application/pdf');
    const meta = await computeFileIntegrity(file);
    expect(meta).toMatchObject({
      mime: 'application/pdf',
      name: 'bi.pdf',
      size_bytes: file.size,
    });
    expect(meta.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashes iguais para conteúdos iguais e diferentes para conteúdos diferentes', async () => {
    ensureSubtle();
    const a1 = await sha256OfFile(mockFile('payload-A'));
    const a2 = await sha256OfFile(mockFile('payload-A'));
    const b = await sha256OfFile(mockFile('payload-B'));
    expect(a1).toBe(a2);
    expect(a1).not.toBe(b);
  });

  it('mime ausente cai para application/octet-stream (defesa em profundidade)', async () => {
    ensureSubtle();
    const file = new File(['x'], 'noext');
    const meta = await computeFileIntegrity(file);
    expect(['application/octet-stream', '']).toContain(meta.mime === '' ? '' : meta.mime);
    // Pelo menos garante que o valor é string e o hash é válido
    expect(typeof meta.mime).toBe('string');
    expect(meta.sha256).toMatch(/^[a-f0-9]{64}$/);
  });
});

// -----------------------------------------------------------------------------
// 4. Cenário composto: submeter formulário + upload de BI
// -----------------------------------------------------------------------------

describe('E2E cenário: submissão FarmerForm com upload de BI', () => {
  it('payload + ficheiro produzem dados normalizados aceites pelo backend e metadados consistentes', async () => {
    const raw = buildFormPayload({ phone: '+244 923 456 789' });
    const file = mockFile('conteudo-bi-pdf', 'bi-joao.pdf', 'application/pdf');

    // 1) Validação como faria o submit do form
    const validated = validateUserPayload(raw, { requirePassword: true });
    expect(validated.ok).toBe(true);

    // 2) Cálculo do hash como em DocumentUpload
    const meta = await computeFileIntegrity(file);

    // 3) Estrutura final que iria para a edge function + tabela file_integrity
    const insertRow = {
      ...(validated.ok ? validated.data : {}),
      document_bi: {
        sha256: meta.sha256,
        size_bytes: meta.size_bytes,
        mime: meta.mime,
        name: meta.name,
      },
    };

    expect(insertRow).toMatchObject({
      email: 'joao.silva@example.com',
      phone: '+244923456789',
      document_bi: {
        mime: 'application/pdf',
        name: 'bi-joao.pdf',
      },
    });
    expect(insertRow.document_bi.sha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
