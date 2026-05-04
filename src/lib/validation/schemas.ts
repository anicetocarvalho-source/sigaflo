// =============================================================================
// SIGAFLO - Schemas Zod (frontend + backend partilháveis)
// =============================================================================

import { z } from 'zod';
import {
  EMAIL_REGEX,
  PHONE_AO_INTL_REGEX,
  NAME_REGEX,
  BI_AO_REGEX,
  NIF_AO_REGEX,
  normalizeEmail,
  normalizePhoneAO,
  normalizeName,
  normalizeBI,
  normalizeNIF,
  collapseSpaces,
} from './primitives';

// -----------------------------------------------------------------------------
// Mensagens PT padronizadas
// -----------------------------------------------------------------------------
export const MSG = {
  required: 'Este campo é obrigatório.',
  email: 'Insira um endereço de email válido.',
  phoneAO: 'Insira um número móvel angolano válido com 9 dígitos.',
  name: 'Use apenas letras, espaços, hífen e apóstrofo.',
  bi: 'BI inválido. Formato esperado: 9 dígitos + 2 letras + 3 dígitos.',
  nif: 'NIF inválido. Deve conter exactamente 10 dígitos.',
  dateInvalid: 'Data inválida.',
  dateFuture: 'A data não pode ser futura.',
  dateTooOld: 'Data fora do intervalo permitido.',
  positive: 'O valor deve ser positivo.',
  fileTooBig: (mb: number) => `Ficheiro excede o tamanho máximo (${mb} MB).`,
  fileMime: 'Tipo de ficheiro não permitido.',
} as const;

// -----------------------------------------------------------------------------
// Email
// -----------------------------------------------------------------------------
export const emailSchema = z
  .string({ required_error: MSG.required })
  .trim()
  .min(1, MSG.required)
  .max(255, 'Email demasiado longo.')
  .transform(normalizeEmail)
  .refine((v) => EMAIL_REGEX.test(v), MSG.email);

export const optionalEmailSchema = z
  .string()
  .trim()
  .transform((v) => (v ? normalizeEmail(v) : ''))
  .refine((v) => v === '' || EMAIL_REGEX.test(v), MSG.email)
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional();

// -----------------------------------------------------------------------------
// Telefone AO
// -----------------------------------------------------------------------------
export const phoneAOSchema = z
  .string({ required_error: MSG.required })
  .min(1, MSG.required)
  .transform((v) => normalizePhoneAO(v))
  .refine((v) => PHONE_AO_INTL_REGEX.test(v), MSG.phoneAO);

export const optionalPhoneAOSchema = z
  .string()
  .transform((v) => (v ? normalizePhoneAO(v) : ''))
  .refine((v) => v === '' || PHONE_AO_INTL_REGEX.test(v), MSG.phoneAO)
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional();

// -----------------------------------------------------------------------------
// Nome de pessoa (sem dígitos)
// -----------------------------------------------------------------------------
export const personNameSchema = z
  .string({ required_error: MSG.required })
  .trim()
  .min(2, 'Mínimo de 2 caracteres.')
  .max(150, 'Máximo de 150 caracteres.')
  .transform(normalizeName)
  .refine((v) => NAME_REGEX.test(v), MSG.name)
  .refine((v) => !/\d/.test(v), MSG.name);

// -----------------------------------------------------------------------------
// BI / NIF
// -----------------------------------------------------------------------------
export const biSchema = z
  .string()
  .trim()
  .transform(normalizeBI)
  .refine((v) => BI_AO_REGEX.test(v), MSG.bi);

export const optionalBiSchema = z
  .string()
  .trim()
  .transform((v) => (v ? normalizeBI(v) : ''))
  .refine((v) => v === '' || BI_AO_REGEX.test(v), MSG.bi)
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional();

export const nifSchema = z
  .string()
  .trim()
  .transform(normalizeNIF)
  .refine((v) => NIF_AO_REGEX.test(v), MSG.nif);

export const optionalNifSchema = z
  .string()
  .trim()
  .transform((v) => (v ? normalizeNIF(v) : ''))
  .refine((v) => v === '' || NIF_AO_REGEX.test(v), MSG.nif)
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional();

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------
export const pastDateSchema = z
  .string()
  .min(1, MSG.required)
  .refine((v) => !Number.isNaN(Date.parse(v)), MSG.dateInvalid)
  .refine((v) => new Date(v).getTime() <= Date.now(), MSG.dateFuture);

// -----------------------------------------------------------------------------
// Ficheiros
// -----------------------------------------------------------------------------
export const ALLOWED_DOC_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export const fileSchema = z
  .instanceof(File, { message: 'Ficheiro inválido.' })
  .refine((f) => f.size <= MAX_FILE_BYTES, MSG.fileTooBig(5))
  .refine(
    (f) => (ALLOWED_DOC_MIME as readonly string[]).includes(f.type),
    MSG.fileMime,
  );

// -----------------------------------------------------------------------------
// Texto genérico (collapse spaces)
// -----------------------------------------------------------------------------
export const trimmedString = (min = 1, max = 255) =>
  z
    .string()
    .transform(collapseSpaces)
    .pipe(z.string().min(min, `Mínimo de ${min} caracteres.`).max(max, `Máximo de ${max} caracteres.`));
