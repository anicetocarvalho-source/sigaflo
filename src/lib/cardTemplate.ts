// Shared SIGAFLO card template — used by single-card print/PDF export and
// kept visually in sync with the React preview in FarmerCard.tsx and the
// batch jsPDF renderer in cardBatchExport.ts.

import type { Farmer } from '@/hooks/useFarmers';

export interface CardTemplateCtx {
  farmer: Farmer;
  qrPayload: string;          // text encoded into the front QR
  serial?: string | null;     // ID SIGAF / serial
  status?: 'activo' | 'inactivo' | 'revogado';
  issuedAt?: string | null;   // ISO
  validUntil?: string | null; // ISO (default: issuedAt + 5 years)
  hasNfc?: boolean;
}

export const CARD_W_MM = 85.6;
export const CARD_H_MM = 53.98;
export const SAFE_MM = 3;

export const CARD_COLORS = {
  green: '#1f6b34',          // hsl(142 72% 22%)
  greenDark: '#0c3d1a',      // hsl(142 80% 14%)
  greenSoft: '#e9f3ec',
  gold: '#d4a017',
  surface: '#ffffff',
  muted: '#f1f3f5',
  text: '#26303d',
  textMuted: '#6b7280',
} as const;

const farmerTypeLabels: Record<string, string> = {
  individual: 'Pequeno Agricultor',
  family: 'Agricultura Familiar',
  cooperative: 'Cooperativa',
  field_school: 'Escola de Campo',
  company: 'Empresa',
};

const fmtBI = (bi?: string | null) =>
  bi ? bi.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim() : '—';

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('pt-PT'); } catch { return '—'; }
};

const addYears = (iso: string, n: number) => {
  const d = new Date(iso); d.setFullYear(d.getFullYear() + n); return d.toISOString();
};

export const cardCss = `
  *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sigaflo-card {
    width: ${CARD_W_MM}mm; height: ${CARD_H_MM}mm; position: relative; overflow: hidden;
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    color: ${CARD_COLORS.text}; background: ${CARD_COLORS.surface};
    border-radius: 2.5mm;
  }
  .sigaflo-card .safe { position: absolute; inset: ${SAFE_MM}mm; }

  /* ===== FRONT ===== */
  .sigaflo-card.front .header {
    position: absolute; top: 0; left: 0; right: 0; height: 7mm;
    background: ${CARD_COLORS.green}; color: #fff;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 3mm;
  }
  .sigaflo-card.front .header .gov { font-size: 5.5pt; line-height: 1.15; letter-spacing: 0.4px; }
  .sigaflo-card.front .header .gov b { display: block; font-size: 6pt; }
  .sigaflo-card.front .header .wm { font-size: 9pt; font-weight: 800; letter-spacing: 2.5px; }
  .sigaflo-card.front .footer {
    position: absolute; left: 0; right: 0; bottom: 0; height: 1.6mm;
    background: ${CARD_COLORS.green};
  }
  .sigaflo-card.front .body {
    position: absolute; top: 8mm; left: 3mm; right: 3mm; bottom: 2.5mm;
    display: grid; grid-template-columns: 30% 45% 25%; gap: 2mm;
  }
  .sigaflo-card.front .photo {
    background: ${CARD_COLORS.muted};
    border: 0.25mm solid #cfd4da; border-radius: 1.2mm;
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    aspect-ratio: 25 / 32;
  }
  .sigaflo-card.front .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sigaflo-card.front .photo .ini { font-size: 16pt; font-weight: 700; color: #9aa1a9; }
  .sigaflo-card.front .info { display: flex; flex-direction: column; min-width: 0; padding-top: 0.5mm; }
  .sigaflo-card.front .info .name {
    font-size: 9.5pt; font-weight: 700; line-height: 1.1;
    text-transform: uppercase; letter-spacing: 0.2px; color: ${CARD_COLORS.text};
    overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    margin-bottom: 1mm;
  }
  .sigaflo-card.front .info .id {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 8pt; font-weight: 700; color: ${CARD_COLORS.green};
    letter-spacing: 0.6px; margin-bottom: 1mm;
  }
  .sigaflo-card.front .info .row { font-size: 6.5pt; color: ${CARD_COLORS.text}; line-height: 1.25; }
  .sigaflo-card.front .info .row b { color: ${CARD_COLORS.textMuted}; font-weight: 600; }
  .sigaflo-card.front .right { display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
  .sigaflo-card.front .qr { width: 21mm; height: 21mm; background: #fff; padding: 0.4mm; border: 0.2mm solid #e2e6ea; border-radius: 0.6mm; }
  .sigaflo-card.front .qr img, .sigaflo-card.front .qr svg { width: 100%; height: 100%; display: block; }
  .sigaflo-card.front .right .crop { font-size: 6.5pt; text-align: center; line-height: 1.2; }
  .sigaflo-card.front .right .crop b { display: block; font-size: 7pt; color: ${CARD_COLORS.green}; }

  /* discreet watermark */
  .sigaflo-card.front .wmbg {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    pointer-events: none; opacity: 0.05; font-size: 28pt; font-weight: 900;
    letter-spacing: 6px; color: ${CARD_COLORS.green}; transform: rotate(-18deg);
  }

  /* ===== BACK ===== */
  .sigaflo-card.back { background: ${CARD_COLORS.surface}; }
  .sigaflo-card.back .top {
    position: absolute; top: 0; left: 0; right: 0; height: 11mm;
    background: ${CARD_COLORS.greenSoft}; padding: 1.6mm 3mm;
    display: flex; align-items: center; justify-content: space-between; gap: 2mm;
  }
  .sigaflo-card.back .barcode { flex: 1; min-width: 0; }
  .sigaflo-card.back .barcode svg { width: 100%; height: 7mm; display: block; }
  .sigaflo-card.back .barcode .lbl { font-family: 'JetBrains Mono', monospace; font-size: 5.5pt; color: ${CARD_COLORS.text}; text-align: center; margin-top: 0.2mm; letter-spacing: 1.2px; }
  .sigaflo-card.back .top .brand { font-size: 7pt; font-weight: 800; letter-spacing: 1.6px; color: ${CARD_COLORS.green}; }
  .sigaflo-card.back .mid {
    position: absolute; top: 11mm; left: 0; right: 0; height: 14mm;
    padding: 1.5mm 3mm; display: flex; align-items: center; gap: 2mm; flex-wrap: wrap;
    border-bottom: 0.15mm solid #e2e6ea;
  }
  .sigaflo-card.back .pill {
    font-size: 6pt; font-weight: 700; padding: 0.5mm 1.6mm; border-radius: 1mm;
    text-transform: uppercase; letter-spacing: 0.6px;
  }
  .sigaflo-card.back .pill.activo { background: #e7f7ec; color: #0c5128; border: 0.2mm solid #1f6b34; }
  .sigaflo-card.back .pill.inactivo { background: #f1f3f5; color: #4b5563; border: 0.2mm solid #9aa1a9; }
  .sigaflo-card.back .pill.revogado { background: #fdecec; color: #8a1a1a; border: 0.2mm solid #c0392b; }
  .sigaflo-card.back .pill.nfc { background: #fff; color: ${CARD_COLORS.green}; border: 0.2mm solid ${CARD_COLORS.green}; }
  .sigaflo-card.back .data { font-size: 6.5pt; color: ${CARD_COLORS.text}; width: 100%; margin-top: 0.6mm; line-height: 1.3; }
  .sigaflo-card.back .data b { color: ${CARD_COLORS.textMuted}; font-weight: 600; }
  .sigaflo-card.back .bot {
    position: absolute; top: 25mm; left: 0; right: 0; bottom: 0;
    padding: 1.6mm 3mm; display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;
  }
  .sigaflo-card.back .bot .col { font-size: 6pt; line-height: 1.35; color: ${CARD_COLORS.text}; }
  .sigaflo-card.back .bot .col b { color: ${CARD_COLORS.textMuted}; font-weight: 600; }
  .sigaflo-card.back .legal { font-size: 5pt; color: ${CARD_COLORS.textMuted}; line-height: 1.3; }
  .sigaflo-card.back .stripe { position: absolute; left: 0; right: 0; bottom: 0; height: 1.4mm; background: ${CARD_COLORS.green}; }
`;

export function renderCardFrontHtml(ctx: CardTemplateCtx, qrSrc: string): string {
  const { farmer, serial } = ctx;
  const initials = (() => {
    const p = (farmer.name ?? '?').split(' ').filter(Boolean);
    return ((p[0]?.[0] ?? '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  })();
  const photo = farmer.photo_url
    ? `<img src="${farmer.photo_url}" crossorigin="anonymous" alt="" />`
    : `<span class="ini">${initials}</span>`;
  const crop = (farmer.main_crops && farmer.main_crops[0]) || '—';
  const area = (farmer as any).cultivated_area_ha ?? farmer.total_area_ha;
  const id = serial || farmer.registration_number || '—';

  return `
  <div class="sigaflo-card front">
    <div class="wmbg">SIGAFLO</div>
    <div class="header">
      <div class="gov">REPÚBLICA DE ANGOLA<b>Min. Agricultura e Florestas</b></div>
      <div class="wm">SIGAFLO</div>
    </div>
    <div class="body">
      <div class="photo">${photo}</div>
      <div class="info">
        <div class="name">${farmer.name ?? '—'}</div>
        <div class="id">${id}</div>
        <div class="row"><b>Tipo:</b> ${farmerTypeLabels[farmer.farmer_type] || farmer.farmer_type || '—'}</div>
        <div class="row"><b>Província:</b> ${farmer.provinces?.name ?? '—'}</div>
        <div class="row"><b>Município:</b> ${farmer.municipalities?.name ?? '—'}</div>
        <div class="row"><b>Comuna:</b> ${(farmer as any).communes?.name ?? '—'}</div>
      </div>
      <div class="right">
        <div class="qr"><img src="${qrSrc}" alt="QR" /></div>
        <div class="crop">
          <b>${crop}</b>
          ${area != null ? `${Number(area).toFixed(1)} ha` : ''}
        </div>
      </div>
    </div>
    <div class="footer"></div>
  </div>`;
}

export function renderCardBackHtml(ctx: CardTemplateCtx, barcodeSvg: string): string {
  const { farmer, serial, status = 'activo', issuedAt, validUntil, hasNfc = false } = ctx;
  const id = serial || farmer.registration_number || '—';
  const issued = issuedAt ?? new Date().toISOString();
  const valid = validUntil ?? addYears(issued, 5);
  return `
  <div class="sigaflo-card back">
    <div class="top">
      <div class="barcode">${barcodeSvg}<div class="lbl">${id}</div></div>
      <div class="brand">SIGAFLO</div>
    </div>
    <div class="mid">
      <span class="pill ${status}">${status === 'activo' ? '● ACTIVO' : status === 'revogado' ? '● REVOGADO' : '● INACTIVO'}</span>
      ${hasNfc ? '<span class="pill nfc">⌬ NFC</span>' : ''}
      <div class="data">
        <b>BI/NIF:</b> ${fmtBI(farmer.bi_nif)} &nbsp; · &nbsp;
        <b>Telefone:</b> ${farmer.phone || '—'} &nbsp; · &nbsp;
        <b>Área:</b> ${farmer.total_area_ha ? `${farmer.total_area_ha.toFixed(1)} ha` : '—'}
      </div>
    </div>
    <div class="bot">
      <div class="col">
        <div><b>Emissão:</b> ${fmtDate(issued)}</div>
        <div><b>Validade:</b> ${fmtDate(valid)}</div>
        <div><b>Tel:</b> 923 000 000</div>
        <div><b>Web:</b> sigaflo.gov.ao</div>
      </div>
      <div class="col legal">
        Documento intransmissível e de uso institucional. Em caso de
        extravio ou roubo, devolva ao Ministério da Agricultura e Florestas
        ou contacte o SIGAFLO. A autenticidade é verificável pelo QR no anverso.
      </div>
    </div>
    <div class="stripe"></div>
  </div>`;
}

export function makeBarcodeSvg(value: string): string {
  // Lightweight Code128-ish visual using deterministic stripes.
  // For real Code128 the runtime uses jsbarcode (see helper below).
  const seed = value || 'SIGAFLO';
  const bars: string[] = [];
  let x = 0;
  for (let i = 0; i < seed.length * 6; i++) {
    const w = ((seed.charCodeAt(i % seed.length) + i) % 3) + 1; // 1..3
    if (i % 2 === 0) bars.push(`<rect x="${x}" y="0" width="${w}" height="100" fill="#0c3d1a" />`);
    x += w + 0.5;
  }
  return `<svg viewBox="0 0 ${x} 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${bars.join('')}</svg>`;
}

// QR helper for browser-side print template (uses external service to keep
// payload identical to legacy implementation and to avoid bundling QR libs).
export const qrServiceUrl = (payload: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(payload)}`;
