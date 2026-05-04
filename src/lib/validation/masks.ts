// =============================================================================
// SIGAFLO - Máscaras de input (apenas display)
// =============================================================================

import { stripNonDigits } from './primitives';

/** Máscara visível "9XX XXX XXX" (até 9 dígitos). */
export const maskPhoneAONational = (raw: string): string => {
  const d = stripNonDigits(raw).slice(0, 9);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  return [p1, p2, p3].filter(Boolean).join(' ');
};

/** Máscara BI "000000000XX000". */
export const maskBI = (raw: string): string => {
  return raw.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 14);
};

/** Máscara NIF — só dígitos, max 10. */
export const maskNIF = (raw: string): string => stripNonDigits(raw).slice(0, 10);
