// =============================================================================
// SIGAFLO - Validação de parâmetros de pesquisa / filtros
// =============================================================================
// Objectivo: garantir consistência dos filtros e rejeitar parâmetros inválidos
// antes de chegarem ao backend (Supabase / PostgREST).
//
// Princípios:
//  - ISO 8000 (qualidade): normalizar e canonicalizar termos.
//  - ISO 27001 (segurança): rejeitar payloads suspeitos, escapar wildcards
//    de operadores `ilike` para evitar abuso de padrões (`%`, `_`, `,`, `(`, `)`).
//  - ALCOA+ (rastreabilidade): devolver sempre `{ ok, value | error }` para
//    poder registar violações sem lançar excepções silenciosas.

import { z } from 'zod';
import { collapseSpaces } from './primitives';

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------

export const SEARCH_MIN_LEN = 2;
export const SEARCH_MAX_LEN = 80;

/** Caracteres não permitidos em termos de pesquisa: controlo + wildcards SQL +
 *  separadores PostgREST que poderiam injectar operadores adicionais. */
const FORBIDDEN_SEARCH_CHARS = /[\x00-\x1F\x7F<>;`\\]/;

/** Caracteres especiais do operador ilike do PostgREST que devem ser escapados. */
const ILIKE_SPECIALS = /[%_]/g;

/** UUID v1–v5 (qualquer versão). */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// -----------------------------------------------------------------------------
// Schemas
// -----------------------------------------------------------------------------

/**
 * Schema para termos de pesquisa de texto livre.
 * - Faz trim/colapso de espaços
 * - Garante comprimento mínimo/máximo
 * - Rejeita caracteres de controlo, `<`, `>`, `;`, `\`, backtick
 */
export const searchTermSchema = z
  .string({ invalid_type_error: 'Termo de pesquisa inválido.' })
  .transform((v) => collapseSpaces(v ?? ''))
  .pipe(
    z
      .string()
      .min(SEARCH_MIN_LEN, `Pesquise por pelo menos ${SEARCH_MIN_LEN} caracteres.`)
      .max(SEARCH_MAX_LEN, `Pesquise por no máximo ${SEARCH_MAX_LEN} caracteres.`)
      .refine(
        (v) => !FORBIDDEN_SEARCH_CHARS.test(v),
        'O termo contém caracteres não permitidos.',
      ),
  );

/** Termo opcional: aceita vazio (devolve null). */
export const optionalSearchTermSchema = z
  .string()
  .optional()
  .transform((v) => (v ? collapseSpaces(v) : ''))
  .transform((v) => (v === '' ? null : v))
  .refine(
    (v) => v === null || (v.length >= SEARCH_MIN_LEN && v.length <= SEARCH_MAX_LEN),
    `O termo deve ter entre ${SEARCH_MIN_LEN} e ${SEARCH_MAX_LEN} caracteres.`,
  )
  .refine(
    (v) => v === null || !FORBIDDEN_SEARCH_CHARS.test(v),
    'O termo contém caracteres não permitidos.',
  );

export const uuidSchema = z
  .string({ invalid_type_error: 'Identificador inválido.' })
  .regex(UUID_REGEX, 'Identificador inválido.');

export const optionalUuidSchema = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v && v !== 'all' ? v : null))
  .refine((v) => v === null || UUID_REGEX.test(v), 'Identificador inválido.');

/** Constrói um schema de enum opcional aceitando `'all'` como sentinela. */
export const optionalEnumSchema = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v !== 'all' ? v : null))
    .refine(
      (v) => v === null || (values as readonly string[]).includes(v),
      'Filtro inválido.',
    );

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Escapa caracteres especiais de `ilike` (`%`, `_`) para que o termo seja
 * tratado como literal e não como padrão. Elimina também vírgulas e parêntesis
 * que poderiam quebrar o operador `or(...)` do PostgREST.
 */
export function escapeIlike(term: string): string {
  return term
    .replace(ILIKE_SPECIALS, (m) => `\\${m}`)
    .replace(/[,()]/g, ' ')
    .trim();
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

/** Wrapper safe — devolve `{ ok, value | error }` em vez de lançar. */
export function validate<T>(schema: z.ZodType<T>, raw: unknown): ValidationResult<T> {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return { ok: true, value: parsed.data } as ValidationResult<T>;
  const first = parsed.error.issues[0]?.message ?? 'Valor inválido.';
  return { ok: false, error: first } as ValidationResult<T>;
}

/**
 * Valida e prepara um termo de pesquisa para uso em `ilike`.
 * Devolve `null` se inválido (chamador pode mostrar erro / abortar).
 */
export function prepareSearchTerm(raw: string): string | null {
  const r = validate(searchTermSchema, raw);
  if (!r.ok) return null;
  return escapeIlike(r.value);
}
