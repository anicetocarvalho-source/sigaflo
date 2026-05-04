# Proposta Técnica — Camada de Validação Robusta SIGAFLO

## 1. Diagnóstico actual

O projecto já tem fundações sólidas:
- `src/lib/validations.ts` com schemas Zod centralizados em PT.
- `react-hook-form + zodResolver` em ~25 formulários.
- RLS, `audit_log`, `eligibility_block_log`, RBAC jurisdicional, triggers de elegibilidade.
- Constraints `UNIQUE (bi_nif)`, soft-delete, `created_at/updated_at`.

**Lacunas identificadas:**
1. Sem validação específica de **telefone angolano** (operadoras, prefixos, normalização +244).
2. Email não é forçado a *lowercase* nem rejeita espaços via regex estrita.
3. Nomes aceitam dígitos/símbolos.
4. Falta normalização sistemática (trim duplo, capitalização, strip de chars não-numéricos em telefone).
5. Uploads (`DocumentUpload`, `PhotoUpload`) sem hash/checksum nem registo de metadados de integridade.
6. Backend repete pouca validação — confia em RLS + constraints; faltam `CHECK` para email/phone e validação Zod nas edge functions (`create-user`, `update-user`).
7. Sem util de máscara visível para telefone/BI.
8. Mensagens de erro inconsistentes entre formulários.

## 2. Arquitectura proposta

```text
┌─────────────────────── FRONTEND ───────────────────────┐
│  src/lib/validation/                                   │
│    ├── primitives.ts      (regex, normalizers)         │
│    ├── schemas.ts         (Zod re-export + novos)      │
│    ├── masks.ts           (input masks AO)             │
│    └── fileIntegrity.ts   (SHA-256 client-side)        │
│                                                        │
│  src/components/ui/                                    │
│    ├── PhoneInputAO.tsx   (máscara +244 fixa)          │
│    ├── EmailInput.tsx     (lowercase + trim onBlur)    │
│    └── FieldError.tsx     (mensagem normalizada)       │
└────────────────────────────────────────────────────────┘
                          │ Zod parse
                          ▼
┌─────────────────────── BACKEND ────────────────────────┐
│  Edge Functions: validação Zod idêntica + sanitize     │
│  Postgres:                                             │
│    ├── CHECK email ~ regex                             │
│    ├── CHECK phone ~ regex AO                          │
│    ├── Trigger BEFORE INSERT/UPDATE: normalize         │
│    ├── Trigger audit_log (já existe) — estendido       │
│    └── file_integrity (hash, mime, size, uploader)     │
└────────────────────────────────────────────────────────┘
```

## 3. Validações por categoria

### 3.1 Primitivas reutilizáveis (`src/lib/validation/primitives.ts`)
- `EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`
- `PHONE_AO_NATIONAL = /^(91|92|93|94|95|97|99)\d{7}$/`
- `PHONE_AO_INTL = /^\+244(91|92|93|94|95|97|99)\d{7}$/`
- `NAME_REGEX = /^[\p{L}\s'’\-\.]+$/u` (letras Unicode + acentos, sem dígitos)
- `BI_AO_REGEX = /^\d{9}[A-Z]{2}\d{3}$/`
- `NIF_AO_REGEX = /^\d{10}$/`
- Normalizadores: `normalizeEmail`, `normalizePhoneAO` (→ `+244XXXXXXXXX`), `normalizeName` (Title Case + collapse spaces), `stripNonDigits`.

### 3.2 Schemas Zod estendidos (`src/lib/validation/schemas.ts`)
Substitui/estende `validations.ts`:
- `emailSchema` com `.transform(normalizeEmail).refine(EMAIL_REGEX)`.
- `phoneAOSchema` aceita 9 dígitos OU formato +244, normaliza para +244.
- `personNameSchema` com `NAME_REGEX` + min 2.
- `biSchema`, `nifSchema` com regex e `.transform(s => s.toUpperCase())`.
- `dateSchema` com limites (não futura para nascimento, idade ≥ 16, etc.).
- `moneySchema` (>=0, max 2 decimais).
- `fileSchema` (size ≤ 5MB, MIME allowlist, extensão).

### 3.3 Componentes UI
- **`<PhoneInputAO />`**: prefixo `+244` fixo (não editável), máscara `9XX XXX XXX`, valida onBlur, devolve normalizado ao form.
- **`<EmailInput />`**: `inputMode="email"`, `autoCapitalize="none"`, lowercase onBlur.
- **`<FieldError />`**: padroniza render de `formState.errors`.
- Marcador visual `*` obrigatório consistente.

### 3.4 Integridade de ficheiros
- `fileIntegrity.ts`: calcula `SHA-256` no browser (`crypto.subtle.digest`) antes de upload.
- Tabela `file_integrity` (nova): `id, bucket, path, sha256, mime, size_bytes, uploaded_by, uploaded_at, entity_type, entity_id`.
- `DocumentUpload`/`PhotoUpload` passam a registar entrada após upload bem-sucedido.

## 4. Backend / Base de Dados

### 4.1 Migrações
1. Adicionar `CHECK` constraints (via trigger validador, conforme memória — evita `IMMUTABLE` em CHECKs):
   - `tg_validate_contact` em `farmers`, `profiles`: valida email/phone, normaliza (`lower(email)`, `regexp_replace(phone, '\D', '')` → prepend `+244`).
2. Criar tabela `file_integrity` + RLS (ver, criar pelo próprio utilizador; admin lê tudo).
3. Estender `audit_log` para gravar `client_ip`, `user_agent` em campos opcionais (rastreabilidade ALCOA+).

### 4.2 Edge functions
- `create-user`, `update-user`: aplicar mesmo schema Zod (cópia de `schemas.ts` em `_shared/validation.ts` deno-compatível) antes de qualquer escrita.
- Resposta 400 padronizada `{ error, fieldErrors }`.

## 5. Rastreabilidade & Conformidade

| Princípio | Implementação |
|---|---|
| ISO 8000 — Completude/Validade | Zod obrigatórios + CHECK + triggers |
| ISO 8000 — Unicidade | `UNIQUE` + verificação onBlur |
| ISO 8000 — Padronização | Normalizadores centralizados |
| ISO 27001 — Confidencialidade | RLS já existente; mensagens de erro sem PII |
| ISO 27001 — Integridade | SHA-256 ficheiros + audit_log + transacções |
| ISO 27001 — Auditoria | `audit_log` (old/new JSON) + `eligibility_block_log` |
| ALCOA+ | `created_by/updated_by/at` + audit_log + soft-delete |
| ACID | Edge functions usam transacções via RPC quando há múltiplas escritas |

## 6. Plano de implementação (ordem)

1. **`src/lib/validation/primitives.ts`** — regex, normalizers, testes unitários.
2. **`src/lib/validation/schemas.ts`** — refactor `validations.ts` (mantém API antiga via re-export).
3. **`src/lib/validation/fileIntegrity.ts`** — SHA-256 helper.
4. **Componentes UI**: `PhoneInputAO`, `EmailInput`, `FieldError`.
5. **Migração SQL**:
   - tabela `file_integrity` + RLS
   - função `normalize_contact()` + triggers em `farmers`, `profiles`
   - função `validate_email_phone()` (rejeita formato inválido)
6. **Refactor formulários prioritários** (maior impacto):
   - `FarmerForm`, `CooperativeForm`, `FieldSchoolForm`
   - `ProfilePage`, `UsersPage` (create/edit)
   - `DocumentUpload`, `PhotoUpload` → integração `file_integrity`
7. **Edge functions** `create-user`/`update-user`: validação Zod servidor + `_shared/validation.ts`.
8. **Testes**:
   - `primitives.test.ts` (regex AO, normalizers)
   - `schemas.test.ts` (casos válidos/inválidos por campo)
   - `phoneInputAO.test.tsx` (máscara, normalização)
   - `fileIntegrity.test.ts` (hash determinístico)
9. **Documentação curta** em `README.md` (secção "Validação & Qualidade de Dados").

## 7. Componentes/ficheiros a criar

**Novos:**
- `src/lib/validation/primitives.ts`
- `src/lib/validation/schemas.ts`
- `src/lib/validation/masks.ts`
- `src/lib/validation/fileIntegrity.ts`
- `src/lib/validation/__tests__/primitives.test.ts`
- `src/lib/validation/__tests__/schemas.test.ts`
- `src/components/ui/PhoneInputAO.tsx`
- `src/components/ui/EmailInput.tsx`
- `src/components/ui/FieldError.tsx`
- `supabase/functions/_shared/validation.ts`
- Migração: `file_integrity` + triggers de normalização

**Editados:**
- `src/lib/validations.ts` (re-export para compatibilidade)
- `FarmerForm`, `CooperativeForm`, `FieldSchoolForm`, `ProfilePage`, `UsersPage`
- `DocumentUpload`, `PhotoUpload`
- `supabase/functions/create-user/index.ts`, `update-user/index.ts`

## 8. Garantias finais

- **Frontend nunca é única defesa**: triggers + CHECK + Zod no edge.
- **Mensagens PT consistentes** (ex.: "Insira um número móvel angolano válido com 9 dígitos.").
- **Dados preservados** em erros (RHF mantém estado).
- **Auditoria automática** via triggers existentes; estendida para uploads.
- **Compatibilidade**: `src/lib/validations.ts` mantém API actual via re-export — zero breakage nos formulários não tocados.

---

Aprove este plano para eu iniciar a implementação na ordem indicada (passos 1–9).
