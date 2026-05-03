// Validação central dos códigos identificadores de cartões SIGAFLO.
// Usado pela:
//  - geração do payload do QR (cartão: front)
//  - geração do código de barras (cartão: verso, Code128 do serial)
//  - página pública de verificação `/verificacao/:token` e `/verificacao/codigo/:code`
import { z } from 'zod';

// 32 hex (gen_random_bytes(16) -> hex). Tolerante a maiúsc/minúsc; normalizamos para minúsculas.
export const QR_TOKEN_REGEX = /^[a-f0-9]{32}$/i;

// Serial impresso no Code128 do verso. Gerado por `generate_card_serial()`.
export const CARD_SERIAL_REGEX = /^CART-\d{4}-\d{6}$/i;

// Número de registo do agricultor (impresso na frente).
export const REGISTRATION_NUMBER_REGEX = /^(AGR|FAM|COOP|ECA|EMP)-\d{6}$/i;

export type CardCodeKind = 'qr_token' | 'serial' | 'registration_number';

export const qrTokenSchema = z
  .string()
  .trim()
  .regex(QR_TOKEN_REGEX, 'Token QR inválido (esperado: 32 caracteres hexadecimais).')
  .transform((v) => v.toLowerCase());

export const cardSerialSchema = z
  .string()
  .trim()
  .regex(CARD_SERIAL_REGEX, 'Número de série inválido (esperado: CART-AAAA-NNNNNN).')
  .transform((v) => v.toUpperCase());

export const registrationNumberSchema = z
  .string()
  .trim()
  .regex(REGISTRATION_NUMBER_REGEX, 'Número de registo inválido.')
  .transform((v) => v.toUpperCase());

export const anyCardCodeSchema = z
  .string()
  .trim()
  .min(1, 'Código vazio.')
  .max(64, 'Código demasiado longo.')
  .superRefine((v, ctx) => {
    if (
      !QR_TOKEN_REGEX.test(v) &&
      !CARD_SERIAL_REGEX.test(v) &&
      !REGISTRATION_NUMBER_REGEX.test(v)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Código não reconhecido. Use o token QR (32 hex), serial (CART-AAAA-NNNNNN) ou nº de registo.',
      });
    }
  });

export const classifyCardCode = (raw: string): CardCodeKind | null => {
  const v = (raw ?? '').trim();
  if (QR_TOKEN_REGEX.test(v)) return 'qr_token';
  if (CARD_SERIAL_REGEX.test(v)) return 'serial';
  if (REGISTRATION_NUMBER_REGEX.test(v)) return 'registration_number';
  return null;
};

/**
 * Aceita um payload bruto lido por câmara/leitor (URL completa OU token nu OU JSON legado).
 * Devolve o código normalizado pronto a enviar ao backend, ou null se inválido.
 */
export const extractCodeFromQrPayload = (payload: string): string | null => {
  if (!payload) return null;
  const raw = payload.trim();

  // 1) URL — extrai o último segmento do path
  try {
    const url = new URL(raw);
    const seg = url.pathname.split('/').filter(Boolean).pop() ?? '';
    if (classifyCardCode(seg)) return seg;
  } catch {
    /* não é URL */
  }

  // 2) JSON legado { id, registration_number, ... }
  if (raw.startsWith('{')) {
    try {
      const obj = JSON.parse(raw);
      const candidates = [obj?.token, obj?.qr_token, obj?.serial, obj?.reg, obj?.registration_number];
      for (const c of candidates) {
        if (typeof c === 'string' && classifyCardCode(c)) return c;
      }
    } catch {
      /* JSON inválido */
    }
  }

  // 3) Texto puro
  if (classifyCardCode(raw)) return raw;

  return null;
};
