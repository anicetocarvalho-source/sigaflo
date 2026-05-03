// Shared SIGAFLO card template — used by single-card print/PDF export and
// kept visually in sync with the React preview in FarmerCard.tsx and the
// batch jsPDF renderer in cardBatchExport.ts.
//
// Layout aligns with the official institutional mockup (CR-80 PVC, 85.6 x 53.98 mm).

import type { Farmer } from '@/hooks/useFarmers';
import insigniaAngolaUrl from '@/assets/insignia-angola.png';

export { insigniaAngolaUrl };

export interface CardTemplateCtx {
  farmer: Farmer;
  qrPayload: string;          // text encoded into the front QR
  serial?: string | null;     // ID SIGAFLO / serial
  status?: 'activo' | 'inactivo' | 'revogado';
  issuedAt?: string | null;   // ISO
  validUntil?: string | null; // ISO (default: issuedAt + 5 years)
  hasNfc?: boolean;
}

export const CARD_W_MM = 85.6;
export const CARD_H_MM = 53.98;
export const SAFE_MM = 3;

export const CARD_COLORS = {
  green: '#1f6b34',
  greenDark: '#0c3d1a',
  greenSoft: '#f0f7f1',
  surface: '#ffffff',
  text: '#1a2030',
  textMuted: '#6b7280',
  divider: '#e2e6ea',
} as const;

const farmerTypeLabels: Record<string, string> = {
  individual: 'PEQUENO PRODUTOR',
  family: 'AGRICULTURA FAMILIAR',
  cooperative: 'COOPERATIVA',
  field_school: 'ESCOLA DE CAMPO',
  company: 'EMPRESA',
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('pt-PT'); } catch { return '—'; }
};

const addYears = (iso: string, n: number) => {
  const d = new Date(iso); d.setFullYear(d.getFullYear() + n); return d.toISOString();
};

// ---------- Inline SVG assets (vector, print-ready) ----------

// Insígnia oficial da República de Angola (PNG importado como asset Vite).
// Substitui o brasão SVG estilizado anterior.

const sigafloLogoSvg = `
<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g transform="translate(4,8)">
    <circle cx="22" cy="22" r="20" fill="#1f6b34"/>
    <path d="M22 8 q-8 6 -8 14 q0 6 4 10 q-2 -4 0 -8 q3 -6 4 -10" fill="#fff"/>
    <path d="M22 10 q8 4 9 14 q0 5 -3 8" fill="none" stroke="#fff" stroke-width="1.5"/>
    <path d="M14 28 q8 4 16 0" fill="none" stroke="#fff" stroke-width="1.2"/>
  </g>
  <text x="56" y="32" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="800" fill="#1f6b34" letter-spacing="1">SIGAFLO</text>
  <text x="56" y="44" font-family="Inter, Arial, sans-serif" font-size="6" font-weight="600" fill="#0c3d1a" letter-spacing="1.4">SISTEMA INTEGRADO DE GESTÃO AGRO FLORESTAL</text>
</svg>`.trim();

const mapaAngolaSvg = `
<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M14 16 L60 12 L66 24 L70 38 L64 56 L52 64 L36 66 L22 60 L16 46 L12 30 Z"
    fill="#1f6b34" stroke="#0c3d1a" stroke-width="0.8"/>
  <path d="M40 28 l4 -4 l4 6 l-4 6 z" fill="#d4a017"/>
  <circle cx="42" cy="34" r="2" fill="#0c3d1a"/>
</svg>`.trim();

const ruralLandscapeSvg = `
<svg viewBox="0 0 400 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#a8d5b1"/>
      <stop offset="1" stop-color="#1f6b34"/>
    </linearGradient>
  </defs>
  <rect width="400" height="50" fill="url(#sky)"/>
  <path d="M0 28 q40 -14 80 -2 q40 12 80 -4 q40 -16 80 0 q40 16 80 -2 q40 -18 80 -4 v34 H0 z" fill="#0c5128" opacity="0.85"/>
  <path d="M0 38 q60 -8 120 0 q60 8 120 -4 q60 -12 120 2 q40 6 40 6 v18 H0 z" fill="#0c3d1a"/>
  <g fill="#0a2f15" opacity="0.5">
    <path d="M120 30 v-8 m-3 5 h6 M118 30 q2 -3 4 0" />
    <circle cx="120" cy="22" r="3"/>
    <circle cx="280" cy="26" r="2.5"/>
  </g>
</svg>`.trim();

// ---------- CSS ----------

export const cardCss = `
  *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sigaflo-card {
    width: ${CARD_W_MM}mm; height: ${CARD_H_MM}mm; position: relative; overflow: hidden;
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    color: ${CARD_COLORS.text}; background: ${CARD_COLORS.surface};
    border-radius: 2.8mm;
  }

  /* ===================== FRONT ===================== */
  .sigaflo-card.front .header {
    position: absolute; top: 0; left: 0; right: 0; height: 11mm;
    display: flex; align-items: center; padding: 1.2mm 2.5mm 0;
    background: #fff;
  }
  .sigaflo-card.front .header .gov {
    display: flex; align-items: center; gap: 1.2mm;
    width: 30%;
  }
  .sigaflo-card.front .header .gov .brasao { width: 7mm; height: 7mm; flex: none; }
  .sigaflo-card.front .header .gov .gov-text {
    font-size: 4.5pt; line-height: 1.15; color: ${CARD_COLORS.text};
    letter-spacing: 0.3px;
  }
  .sigaflo-card.front .header .gov .gov-text b {
    display: block; font-size: 5pt; font-weight: 700; color: ${CARD_COLORS.green};
    letter-spacing: 0.6px;
  }
  .sigaflo-card.front .header .gov .gov-text span { font-size: 4pt; color: ${CARD_COLORS.textMuted}; }
  .sigaflo-card.front .header .logo {
    flex: 1; display: flex; justify-content: center;
  }
  .sigaflo-card.front .header .logo svg { height: 9mm; width: auto; }
  .sigaflo-card.front .header .gov-badge {
    width: 22%; display: flex; align-items: center; justify-content: flex-end; gap: 0.8mm;
  }
  .sigaflo-card.front .header .gov-badge .map { width: 7mm; height: 7mm; flex: none; }
  .sigaflo-card.front .header .gov-badge .gov-tag {
    background: ${CARD_COLORS.greenDark}; color: #fff;
    padding: 0.6mm 1mm; font-size: 4pt; font-weight: 700;
    line-height: 1.1; text-align: center; border-radius: 0.4mm;
    letter-spacing: 0.4px;
  }
  .sigaflo-card.front .title {
    position: absolute; top: 11mm; left: 8mm; right: 8mm; height: 4mm;
    background: ${CARD_COLORS.green}; color: #fff;
    display: flex; align-items: center; justify-content: center;
    border-radius: 0.6mm;
    font-size: 6pt; font-weight: 700; letter-spacing: 0.8px;
  }
  .sigaflo-card.front .body {
    position: absolute; top: 16mm; left: 0; right: 0; bottom: 6mm;
    display: grid; grid-template-columns: 22mm 1fr 23mm; gap: 1.5mm;
    padding: 1.2mm 2.5mm 0;
  }
  .sigaflo-card.front .photo {
    background: ${CARD_COLORS.greenSoft};
    border: 0.2mm solid ${CARD_COLORS.divider}; border-radius: 1mm;
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    height: 28mm;
  }
  .sigaflo-card.front .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sigaflo-card.front .photo .ini { font-size: 14pt; font-weight: 700; color: ${CARD_COLORS.green}; }

  .sigaflo-card.front .info { display: flex; flex-direction: column; gap: 1.2mm; min-width: 0; padding-top: 0.5mm; }
  .sigaflo-card.front .info .field { min-width: 0; }
  .sigaflo-card.front .info .label,
  .sigaflo-card.front .loc .label {
    font-size: 4.5pt; font-weight: 700; color: ${CARD_COLORS.textMuted};
    letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 0.2mm;
  }
  .sigaflo-card.front .info .name {
    font-size: 8pt; font-weight: 800; color: ${CARD_COLORS.text};
    line-height: 1.05; text-transform: uppercase;
    overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .sigaflo-card.front .info .id {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 7pt; font-weight: 700; color: ${CARD_COLORS.green};
    letter-spacing: 0.6px;
  }
  .sigaflo-card.front .info .type {
    font-size: 6.5pt; font-weight: 700; color: ${CARD_COLORS.text};
    letter-spacing: 0.3px;
  }

  .sigaflo-card.front .loc { display: flex; flex-direction: column; gap: 1mm; padding-top: 0.5mm; }
  .sigaflo-card.front .loc .row { display: flex; align-items: flex-start; gap: 0.8mm; }
  .sigaflo-card.front .loc .row .ico {
    color: ${CARD_COLORS.green}; font-size: 5.5pt; line-height: 1; padding-top: 0.4mm;
  }
  .sigaflo-card.front .loc .row .val {
    font-size: 6pt; font-weight: 700; color: ${CARD_COLORS.text};
    text-transform: uppercase; line-height: 1.1;
  }

  .sigaflo-card.front .qr-wrap {
    position: absolute; right: 2.5mm; top: 28mm;
    display: flex; align-items: center; gap: 0.8mm;
  }
  .sigaflo-card.front .qr {
    width: 14mm; height: 14mm; background: #fff;
    padding: 0.3mm; border: 0.2mm solid ${CARD_COLORS.divider}; border-radius: 0.5mm;
  }
  .sigaflo-card.front .qr img, .sigaflo-card.front .qr svg { width: 100%; height: 100%; display: block; }
  .sigaflo-card.front .qr-cap {
    font-size: 3.8pt; font-weight: 600; color: ${CARD_COLORS.text};
    line-height: 1.1; max-width: 8mm;
  }

  .sigaflo-card.front .footer {
    position: absolute; left: 0; right: 0; bottom: 0; height: 6mm;
    overflow: hidden;
  }
  .sigaflo-card.front .footer .scene { position: absolute; inset: 0; }
  .sigaflo-card.front .footer .scene svg { width: 100%; height: 100%; }
  .sigaflo-card.front .footer .pillars {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-around;
    color: #fff; font-size: 4.5pt; font-weight: 700; letter-spacing: 0.5px;
    padding: 0 3mm;
  }
  .sigaflo-card.front .footer .pillars .p {
    display: flex; align-items: center; gap: 0.6mm;
    text-shadow: 0 0 1.5mm rgba(0,0,0,0.55);
  }
  .sigaflo-card.front .footer .pillars .dot {
    display: inline-block; width: 1.4mm; height: 1.4mm; border-radius: 50%;
    background: rgba(255,255,255,0.85);
  }

  /* ===================== BACK ===================== */
  .sigaflo-card.back { background: #fff; display: flex; }
  .sigaflo-card.back .left {
    width: 38%; background: ${CARD_COLORS.greenDark}; color: #fff;
    padding: 2.5mm 2.5mm; display: flex; flex-direction: column; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .sigaflo-card.back .left::before {
    content: ''; position: absolute; right: -10mm; bottom: -10mm; width: 40mm; height: 40mm;
    background: radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%);
    pointer-events: none;
  }
  .sigaflo-card.back .left .item { margin-bottom: 1.6mm; }
  .sigaflo-card.back .left .item .lbl {
    font-size: 4.5pt; font-weight: 700; letter-spacing: 0.6px;
    color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 0.8mm;
  }
  .sigaflo-card.back .left .item .lbl .ico { color: #d4a017; }
  .sigaflo-card.back .left .item .val {
    font-size: 7pt; font-weight: 700; color: #fff; margin-top: 0.2mm; letter-spacing: 0.3px;
  }
  .sigaflo-card.back .left .sign {
    border-top: 0.2mm solid rgba(255,255,255,0.25); padding-top: 1mm;
  }
  .sigaflo-card.back .left .sign .signature {
    font-family: 'Brush Script MT', cursive; font-size: 11pt; color: #fff;
    line-height: 1; margin-bottom: 0.4mm;
  }
  .sigaflo-card.back .left .sign .auth {
    font-size: 4.5pt; font-weight: 700; letter-spacing: 0.6px;
    color: rgba(255,255,255,0.85);
  }

  .sigaflo-card.back .right {
    flex: 1; padding: 2.5mm 3mm;
    display: flex; flex-direction: column; gap: 1.5mm;
  }
  .sigaflo-card.back .right .barcode-block { text-align: center; }
  .sigaflo-card.back .right .barcode-block .lbl {
    font-size: 4.5pt; font-weight: 700; color: ${CARD_COLORS.textMuted};
    letter-spacing: 0.6px; text-align: left; margin-bottom: 0.6mm;
  }
  .sigaflo-card.back .right .barcode-block svg { width: 100%; height: 7mm; display: block; }
  .sigaflo-card.back .right .barcode-block .id {
    font-family: 'JetBrains Mono', monospace; font-size: 6pt; color: ${CARD_COLORS.text};
    margin-top: 0.4mm; letter-spacing: 1.2px; font-weight: 700;
  }
  .sigaflo-card.back .right .nfc {
    display: flex; align-items: center; gap: 1mm;
  }
  .sigaflo-card.back .right .nfc .ico {
    width: 4mm; height: 4mm; border-radius: 50%; background: ${CARD_COLORS.greenSoft};
    color: ${CARD_COLORS.green}; display: flex; align-items: center; justify-content: center;
    font-size: 5pt; font-weight: 700;
  }
  .sigaflo-card.back .right .nfc .txt { font-size: 5pt; color: ${CARD_COLORS.text}; }
  .sigaflo-card.back .right .nfc .txt b { display: block; font-size: 5.5pt; color: ${CARD_COLORS.green}; letter-spacing: 0.5px; }

  .sigaflo-card.back .right .support {
    background: ${CARD_COLORS.greenSoft}; border-radius: 1mm;
    padding: 1mm 1.5mm; display: flex; gap: 1mm; align-items: center;
  }
  .sigaflo-card.back .right .support .ico { color: ${CARD_COLORS.green}; font-size: 6pt; }
  .sigaflo-card.back .right .support .body { font-size: 4.5pt; color: ${CARD_COLORS.text}; line-height: 1.3; }
  .sigaflo-card.back .right .support .body b {
    display: block; font-size: 5pt; font-weight: 700; color: ${CARD_COLORS.green};
    letter-spacing: 0.5px; margin-bottom: 0.2mm;
  }

  .sigaflo-card.back .right .legal {
    margin-top: auto;
    background: ${CARD_COLORS.greenSoft}; border-left: 0.4mm solid ${CARD_COLORS.green};
    padding: 0.8mm 1.2mm; font-size: 4pt; color: ${CARD_COLORS.text};
    line-height: 1.3; border-radius: 0.4mm;
  }
`;

// ---------- HTML render ----------

export function renderCardFrontHtml(ctx: CardTemplateCtx, qrSrc: string): string {
  const { farmer, serial } = ctx;
  const initials = (() => {
    const p = (farmer.name ?? '?').split(' ').filter(Boolean);
    return ((p[0]?.[0] ?? '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  })();
  const photo = farmer.photo_url
    ? `<img src="${farmer.photo_url}" crossorigin="anonymous" alt="" />`
    : `<span class="ini">${initials}</span>`;
  const id = serial || farmer.registration_number || '—';
  const farmerType = farmerTypeLabels[farmer.farmer_type] || (farmer.farmer_type ?? '—').toUpperCase();

  return `
  <div class="sigaflo-card front">
    <div class="header">
      <div class="gov">
        <div class="brasao">${brasaoSvg}</div>
        <div class="gov-text">
          <b>REPÚBLICA DE ANGOLA</b>
          <span>Ministério da Agricultura</span>
          <span>e Florestas</span>
        </div>
      </div>
      <div class="logo">${sigafloLogoSvg}</div>
      <div class="gov-badge">
        <div class="map">${mapaAngolaSvg}</div>
        <div class="gov-tag">GOVERNO DE<br/>ANGOLA</div>
      </div>
    </div>

    <div class="title">CARTÃO DE IDENTIFICAÇÃO DO AGRICULTOR</div>

    <div class="body">
      <div class="photo">${photo}</div>
      <div class="info">
        <div class="field">
          <div class="label">Nome Completo</div>
          <div class="name">${farmer.name ?? '—'}</div>
        </div>
        <div class="field">
          <div class="label">ID SIGAFLO</div>
          <div class="id">${id}</div>
        </div>
        <div class="field">
          <div class="label">Tipo de Produtor</div>
          <div class="type">${farmerType}</div>
        </div>
      </div>
      <div class="loc">
        <div>
          <div class="label">Província</div>
          <div class="row"><span class="ico">●</span><span class="val">${farmer.provinces?.name ?? '—'}</span></div>
        </div>
        <div>
          <div class="label">Município</div>
          <div class="row"><span class="ico">●</span><span class="val">${farmer.municipalities?.name ?? '—'}</span></div>
        </div>
        <div>
          <div class="label">Comuna</div>
          <div class="row"><span class="ico">●</span><span class="val">${(farmer as any).communes?.name ?? '—'}</span></div>
        </div>
      </div>
    </div>

    <div class="qr-wrap">
      <div class="qr"><img src="${qrSrc}" alt="QR" /></div>
      <div class="qr-cap">VERIFIQUE A AUTENTICIDADE DESTE CARTÃO</div>
    </div>

    <div class="footer">
      <div class="scene">${ruralLandscapeSvg}</div>
      <div class="pillars">
        <div class="p"><span class="dot"></span>PRODUZIR</div>
        <div class="p"><span class="dot"></span>PRESERVAR</div>
        <div class="p"><span class="dot"></span>DESENVOLVER</div>
        <div class="p"><span class="dot"></span>INCLUIR</div>
      </div>
    </div>
  </div>`;
}

export function renderCardBackHtml(ctx: CardTemplateCtx, barcodeSvg: string): string {
  const { farmer, serial, status = 'activo', issuedAt, validUntil, hasNfc = true } = ctx;
  const id = serial || farmer.registration_number || '—';
  const issued = issuedAt ?? new Date().toISOString();
  const valid = validUntil ?? addYears(issued, 5);
  const statusLabel = status === 'activo' ? 'ATIVO' : status === 'revogado' ? 'REVOGADO' : 'INATIVO';

  return `
  <div class="sigaflo-card back">
    <div class="left">
      <div>
        <div class="item">
          <div class="lbl"><span class="ico">▣</span> DATA DE EMISSÃO</div>
          <div class="val">${fmtDate(issued)}</div>
        </div>
        <div class="item">
          <div class="lbl"><span class="ico">▣</span> DATA DE VALIDADE</div>
          <div class="val">${fmtDate(valid)}</div>
        </div>
        <div class="item">
          <div class="lbl"><span class="ico">✓</span> ESTADO DO REGISTO</div>
          <div class="val">${statusLabel}</div>
        </div>
      </div>
      <div class="sign">
        <div class="signature">Autoridade</div>
        <div class="auth">AUTORIDADE EMISSORA</div>
      </div>
    </div>
    <div class="right">
      <div class="barcode-block">
        <div class="lbl">CÓDIGO DE BARRAS</div>
        ${barcodeSvg}
        <div class="id">${id}</div>
      </div>
      ${hasNfc ? `
      <div class="nfc">
        <div class="ico">📡</div>
        <div class="txt"><b>NFC</b>Aproxime para verificar</div>
      </div>` : ''}
      <div class="support">
        <div class="ico">☎</div>
        <div class="body">
          <b>LINHA DE APOIO SIGAFLO</b>
          923 123 456 · apoio@sigaflo.gov.ao<br/>www.sigaflo.gov.ao
        </div>
      </div>
      <div class="legal">
        Este cartão é pessoal e intransmissível. O uso indevido implica sanções nos termos da lei.
      </div>
    </div>
  </div>`;
}

// QR helper for browser-side print template.
export const qrServiceUrl = (payload: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(payload)}`;
