// AGT Fiscal Compliance Utilities — SIGAFLO POS
// SystemID: AGROPY-POS-001

const SYSTEM_ID = 'AGROPY-POS-001';
const IVA_RATE = 14;

export function getSystemId(): string {
  return SYSTEM_ID;
}

export function getDefaultIvaRate(): number {
  return IVA_RATE;
}

export function calculateIva(amount: number, rate: number = IVA_RATE, isExempt: boolean = false): number {
  if (isExempt) return 0;
  return Math.round(amount * (rate / 100) * 100) / 100;
}

export function calculateSubtotalWithIva(amount: number, rate: number = IVA_RATE, isExempt: boolean = false): number {
  return amount + calculateIva(amount, rate, isExempt);
}

// SHA-256 hash for fiscal chain
export async function generateFiscalHash(
  invoiceNumber: string,
  total: number,
  date: string,
  previousHash: string = '0'
): Promise<string> {
  const data = `${invoiceNumber}|${total.toFixed(2)}|${date}|${previousHash}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash a PIN for wallet
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(pin));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hashed = await hashPin(pin);
  return hashed === storedHash;
}

// Generate QR data for receipt
export function generateQRData(params: {
  invoiceNumber: string;
  total: number;
  date: string;
  systemId?: string;
  hash: string;
}): string {
  return JSON.stringify({
    sys: params.systemId || SYSTEM_ID,
    inv: params.invoiceNumber,
    tot: params.total.toFixed(2),
    dt: params.date,
    h: params.hash.substring(0, 16),
  });
}

// Format AOA currency
export function formatAOA(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
