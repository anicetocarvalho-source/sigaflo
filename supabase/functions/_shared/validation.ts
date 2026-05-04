// Shared input validation for SIGAFLO edge functions.
// Mirrors src/lib/validation/primitives.ts (Deno-compatible).

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_AO_NATIONAL_REGEX = /^(91|92|93|94|95|97|99)\d{7}$/;

export function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

export function normalizePhoneAO(input: string): string {
  if (!input) return "";
  let digits = input.replace(/\D+/g, "");
  if (digits.startsWith("00244")) digits = digits.slice(5);
  else if (digits.startsWith("244") && digits.length === 12) digits = digits.slice(3);
  if (digits.length !== 9) return "";
  if (!PHONE_AO_NATIONAL_REGEX.test(digits)) return "";
  return `+244${digits}`;
}

export type FieldErrors = Record<string, string>;

export interface UserPayloadResult {
  ok: true;
  data: {
    email: string;
    full_name: string;
    phone: string | null;
    position: string | null;
    department: string | null;
    province_id: string | null;
    municipality_id: string | null;
    role: string | null;
    password?: string;
  };
}
export interface UserPayloadError {
  ok: false;
  fieldErrors: FieldErrors;
}

export function validateUserPayload(
  raw: any,
  opts: { requirePassword?: boolean } = {}
): UserPayloadResult | UserPayloadError {
  const fieldErrors: FieldErrors = {};
  if (!raw || typeof raw !== "object") {
    return { ok: false, fieldErrors: { _: "Payload inválido." } };
  }

  const fullName = String(raw.full_name ?? "").trim();
  if (fullName.length < 2 || fullName.length > 150) {
    fieldErrors.full_name = "Nome completo deve ter entre 2 e 150 caracteres.";
  } else if (/\d/.test(fullName)) {
    fieldErrors.full_name = "O nome não deve conter dígitos.";
  }

  const email = normalizeEmail(String(raw.email ?? ""));
  if (!email || !EMAIL_REGEX.test(email)) {
    fieldErrors.email = "Insira um endereço de email válido.";
  }

  let phone: string | null = null;
  if (raw.phone !== undefined && raw.phone !== null && String(raw.phone).trim() !== "") {
    const norm = normalizePhoneAO(String(raw.phone));
    if (!norm) fieldErrors.phone = "Insira um número móvel angolano válido com 9 dígitos.";
    else phone = norm;
  }

  if (opts.requirePassword) {
    const pwd = String(raw.password ?? "");
    if (pwd.length < 8) fieldErrors.password = "A palavra-passe deve ter pelo menos 8 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    data: {
      email,
      full_name: fullName,
      phone,
      position: raw.position ? String(raw.position).trim() : null,
      department: raw.department ? String(raw.department).trim() : null,
      province_id: raw.province_id || null,
      municipality_id: raw.municipality_id || null,
      role: raw.role || null,
      ...(opts.requirePassword ? { password: String(raw.password) } : {}),
    },
  };
}
