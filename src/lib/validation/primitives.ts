// =============================================================================
// SIGAFLO - Primitivas de Validação (regex + normalizadores)
// =============================================================================
// Conformidade: ISO 8000 (qualidade), ISO 27001 (integridade), ALCOA+

// -----------------------------------------------------------------------------
// REGEX
// -----------------------------------------------------------------------------

/** Email: nome@dominio.ext (sem espaços, ext >=2) */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Operadoras móveis Angola — Unitel(92,93,94,97), Africell(95), Movicel(91,99) */
export const PHONE_AO_PREFIXES = ['91', '92', '93', '94', '95', '97', '99'] as const;

/** Telefone móvel AO nacional: 9 dígitos começando por prefixo válido */
export const PHONE_AO_NATIONAL_REGEX = /^(91|92|93|94|95|97|99)\d{7}$/;

/** Telefone móvel AO internacional: +244 + nacional */
export const PHONE_AO_INTL_REGEX = /^\+244(91|92|93|94|95|97|99)\d{7}$/;

/** Nome próprio: letras Unicode (acentos), espaços, hífen, apóstrofo, ponto. SEM dígitos. */
export const NAME_REGEX = /^[\p{L}][\p{L}\s'’\-\.]{1,}$/u;

/** BI Angolano: 9 dígitos + 2 letras + 3 dígitos (ex.: 004567890LA041) */
export const BI_AO_REGEX = /^\d{9}[A-Z]{2}\d{3}$/;

/** NIF Angolano: 10 dígitos */
export const NIF_AO_REGEX = /^\d{10}$/;

/** Indicativo internacional Angola */
export const ANGOLA_DIAL_CODE = '+244';

// -----------------------------------------------------------------------------
// NORMALIZADORES
// -----------------------------------------------------------------------------

/** Remove espaços nas pontas + colapsa internos. */
export const collapseSpaces = (s: string): string =>
  s.trim().replace(/\s+/g, ' ');

/** Mantém apenas dígitos. */
export const stripNonDigits = (s: string): string => s.replace(/\D+/g, '');

/** Email → trim + lowercase. */
export const normalizeEmail = (s: string): string =>
  s.trim().toLowerCase();

/**
 * Telefone AO → formato canónico `+244XXXXXXXXX`.
 * Aceita: "923 456 789", "+244 923 456 789", "00244923456789".
 * Devolve string vazia se não conseguir normalizar para 9 dígitos válidos.
 */
export const normalizePhoneAO = (input: string): string => {
  if (!input) return '';
  let digits = stripNonDigits(input);
  // Remove prefixos internacionais
  if (digits.startsWith('00244')) digits = digits.slice(5);
  else if (digits.startsWith('244')) digits = digits.slice(3);
  if (digits.length !== 9) return '';
  if (!PHONE_AO_NATIONAL_REGEX.test(digits)) return '';
  return `${ANGOLA_DIAL_CODE}${digits}`;
};

/** Devolve apenas a parte nacional (9 dígitos) ou ''. */
export const phoneAOToNational = (input: string): string => {
  const norm = normalizePhoneAO(input);
  return norm ? norm.slice(4) : '';
};

/** Title Case respeitando acentos; preserva conectores em minúsculas. */
const NAME_CONNECTORS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
export const normalizeName = (s: string): string => {
  const base = collapseSpaces(s).toLowerCase();
  if (!base) return '';
  return base
    .split(' ')
    .map((w, i) => {
      if (i > 0 && NAME_CONNECTORS.has(w)) return w;
      return w.charAt(0).toLocaleUpperCase('pt-PT') + w.slice(1);
    })
    .join(' ');
};

/** BI → trim + uppercase. */
export const normalizeBI = (s: string): string =>
  s.trim().toUpperCase().replace(/\s+/g, '');

/** NIF → apenas dígitos. */
export const normalizeNIF = (s: string): string => stripNonDigits(s);

// -----------------------------------------------------------------------------
// VALIDADORES (boolean)
// -----------------------------------------------------------------------------

export const isValidEmail = (s: string): boolean =>
  EMAIL_REGEX.test(normalizeEmail(s));

export const isValidPhoneAO = (s: string): boolean =>
  !!normalizePhoneAO(s);

export const isValidName = (s: string): boolean => {
  const v = collapseSpaces(s);
  return v.length >= 2 && NAME_REGEX.test(v) && !/\d/.test(v);
};

export const isValidBI = (s: string): boolean =>
  BI_AO_REGEX.test(normalizeBI(s));

export const isValidNIF = (s: string): boolean =>
  NIF_AO_REGEX.test(normalizeNIF(s));
