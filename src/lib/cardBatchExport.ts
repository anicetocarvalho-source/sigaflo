import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import type { Farmer } from '@/hooks/useFarmers';

export type BatchFormat = 'a4_grid' | 'cr80_individual';
export type BatchPackaging = 'single_pdf' | 'zip_per_card' | 'zip_per_province';

export interface BatchExportOptions {
  format: BatchFormat;
  packaging: BatchPackaging;
  batchName: string;
  showCutGuides: boolean;
  cutGuideOffsetMm: number; // 0–5
  cutGuideLengthMm: number; // 2–10
  includeBack: boolean;
  cardsPerRowA4: number; // 2 or 3
  cardsPerColA4: number; // 2 or 3
}

export const DEFAULT_BATCH_OPTIONS: BatchExportOptions = {
  format: 'a4_grid',
  packaging: 'single_pdf',
  batchName: `lote-cartoes-${new Date().toISOString().slice(0, 10)}`,
  showCutGuides: true,
  cutGuideOffsetMm: 2,
  cutGuideLengthMm: 4,
  includeBack: false,
  cardsPerRowA4: 3,
  cardsPerColA4: 3,
};

export interface BatchProgress {
  processed: number;
  total: number;
  phase: 'rendering' | 'packaging' | 'done';
}

const CARD_W = 85.6;
const CARD_H = 53.98;

interface CardCtx {
  farmer: Farmer;
  card?: { serial?: string; qr_token?: string };
  verificationOrigin: string;
}

async function makeQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 0, width: 256, errorCorrectionLevel: 'M' });
}

function drawCutGuides(pdf: jsPDF, x: number, y: number, opts: BatchExportOptions) {
  if (!opts.showCutGuides) return;
  const o = opts.cutGuideOffsetMm;
  const l = opts.cutGuideLengthMm;
  pdf.setDrawColor(120);
  pdf.setLineWidth(0.1);
  // 4 cantos: 2 traços por canto
  const corners = [
    [x, y], [x + CARD_W, y], [x, y + CARD_H], [x + CARD_W, y + CARD_H],
  ] as const;
  corners.forEach(([cx, cy], i) => {
    const dx = i % 2 === 0 ? -1 : 1;
    const dy = i < 2 ? -1 : 1;
    // horizontal
    pdf.line(cx + dx * o, cy, cx + dx * (o + l), cy);
    // vertical
    pdf.line(cx, cy + dy * o, cx, cy + dy * (o + l));
  });
}

async function drawCardFront(pdf: jsPDF, x: number, y: number, ctx: CardCtx) {
  const { farmer, card, verificationOrigin } = ctx;
  // Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, CARD_W, CARD_H, 'F');
  // Header band — verde institucional
  pdf.setFillColor(31, 107, 52);
  pdf.rect(x, y, CARD_W, 7, 'F');
  pdf.setTextColor(255).setFont('helvetica', 'normal').setFontSize(5.2);
  pdf.text('REPÚBLICA DE ANGOLA', x + 3, y + 3);
  pdf.setFont('helvetica', 'bold').setFontSize(5.6);
  pdf.text('Min. Agricultura e Florestas', x + 3, y + 5.6);
  pdf.setFont('helvetica', 'bold').setFontSize(9);
  pdf.text('SIGAFLO', x + CARD_W - 3, y + 5, { align: 'right' });
  // Footer band
  pdf.setFillColor(31, 107, 52);
  pdf.rect(x, y + CARD_H - 1.6, CARD_W, 1.6, 'F');

  // Watermark "SIGAFLO" diagonal
  pdf.setTextColor(31, 107, 52);
  pdf.setFont('helvetica', 'bold').setFontSize(28);
  pdf.saveGraphicsState();
  // @ts-ignore — jsPDF GState
  pdf.setGState(new (jsPDF as any).GState({ opacity: 0.05 }));
  pdf.text('SIGAFLO', x + CARD_W / 2, y + CARD_H / 2 + 4, { align: 'center', angle: -18 });
  pdf.restoreGraphicsState();

  // Layout — Zone 1 photo (30%), Zone 2 info (45%), Zone 3 right (25%)
  const bodyTop = y + 8;
  const bodyH = CARD_H - 10.5;
  const z1W = (CARD_W - 6) * 0.30;
  const z2W = (CARD_W - 6) * 0.45;
  const z3W = (CARD_W - 6) * 0.25;
  const z1X = x + 3;
  const z2X = z1X + z1W + 1;
  const z3X = z2X + z2W + 1;

  // Photo placeholder (cinza neutro)
  pdf.setFillColor(241, 243, 245);
  pdf.setDrawColor(207, 212, 218);
  pdf.setLineWidth(0.15);
  const photoH = Math.min(bodyH, z1W * 32 / 25);
  pdf.roundedRect(z1X, bodyTop, z1W - 1, photoH, 0.8, 0.8, 'FD');
  pdf.setTextColor(154, 161, 169).setFontSize(5);
  pdf.text('FOTO', z1X + (z1W - 1) / 2, bodyTop + photoH / 2, { align: 'center' });

  // Info zone
  pdf.setTextColor(38, 48, 61).setFont('helvetica', 'bold').setFontSize(8.5);
  const nameLines = pdf.splitTextToSize((farmer.name ?? '—').toUpperCase(), z2W - 1);
  pdf.text(nameLines.slice(0, 2), z2X, bodyTop + 2.8);

  pdf.setFont('courier', 'bold').setTextColor(31, 107, 52).setFontSize(7.5);
  pdf.text(card?.serial || farmer.registration_number || '—', z2X, bodyTop + 9);

  pdf.setFont('helvetica', 'normal').setTextColor(38, 48, 61).setFontSize(5.8);
  const lines = [
    `Tipo: ${farmer.farmer_type || '—'}`,
    `Província: ${farmer.provinces?.name ?? '—'}`,
    `Município: ${farmer.municipalities?.name ?? '—'}`,
    `Comuna: ${(farmer as any).communes?.name ?? '—'}`,
  ];
  lines.forEach((l, i) => pdf.text(l, z2X, bodyTop + 13 + i * 3));

  // Right zone — QR + cultura/área
  const qrPayload = card?.qr_token
    ? `${verificationOrigin}/verificacao/${card.qr_token}`
    : JSON.stringify({ id: farmer.id, reg: farmer.registration_number });
  try {
    const qr = await makeQrDataUrl(qrPayload);
    const qrSize = Math.min(z3W - 1, 21);
    pdf.addImage(qr, 'PNG', z3X, bodyTop, qrSize, qrSize);
  } catch { /* ignore */ }

  pdf.setTextColor(31, 107, 52).setFont('helvetica', 'bold').setFontSize(6.5);
  pdf.text((farmer.main_crops?.[0] ?? '—'), z3X + (z3W - 1) / 2, bodyTop + 25, { align: 'center' });
  pdf.setTextColor(38, 48, 61).setFont('helvetica', 'normal').setFontSize(6);
  const area = (farmer as any).cultivated_area_ha ?? farmer.total_area_ha;
  pdf.text(area != null ? `${Number(area).toFixed(1)} ha` : '', z3X + (z3W - 1) / 2, bodyTop + 28, { align: 'center' });
}

function drawBarcodeBars(pdf: jsPDF, value: string, x: number, y: number, w: number, h: number) {
  // Visual barcode (deterministic stripes — for true Code128 the PDF preview is sufficient)
  pdf.setFillColor(12, 61, 26);
  const seed = value || 'SIGAFLO';
  let cx = x;
  for (let i = 0; i < seed.length * 6 && cx < x + w; i++) {
    const bw = ((seed.charCodeAt(i % seed.length) + i) % 3) * 0.25 + 0.25;
    if (i % 2 === 0) pdf.rect(cx, y, bw, h, 'F');
    cx += bw + 0.18;
  }
}

function drawCardBack(pdf: jsPDF, x: number, y: number, ctx: CardCtx) {
  const { farmer, card } = ctx;
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, CARD_W, CARD_H, 'F');

  // Top band — barcode
  pdf.setFillColor(233, 243, 236);
  pdf.rect(x, y, CARD_W, 11, 'F');
  const bcId = card?.serial || farmer.registration_number || farmer.id.slice(0, 12);
  drawBarcodeBars(pdf, bcId, x + 3, y + 1.8, CARD_W - 22, 6.5);
  pdf.setTextColor(38, 48, 61).setFont('courier', 'normal').setFontSize(5.5);
  pdf.text(bcId, x + 3 + (CARD_W - 22) / 2, y + 10, { align: 'center' });
  pdf.setTextColor(31, 107, 52).setFont('helvetica', 'bold').setFontSize(7);
  pdf.text('SIGAFLO', x + CARD_W - 3, y + 6.5, { align: 'right' });

  // Status pill
  pdf.setDrawColor(31, 107, 52).setFillColor(231, 247, 236).setLineWidth(0.15);
  pdf.roundedRect(x + 3, y + 12.5, 16, 3.2, 0.6, 0.6, 'FD');
  pdf.setTextColor(12, 81, 40).setFont('helvetica', 'bold').setFontSize(5.2);
  pdf.text('● ACTIVO', x + 11, y + 14.7, { align: 'center' });

  // Data row
  pdf.setTextColor(38, 48, 61).setFont('helvetica', 'normal').setFontSize(5.8);
  const phone = farmer.phone || '—';
  const area = farmer.total_area_ha ? `${farmer.total_area_ha.toFixed(1)} ha` : '—';
  pdf.text(`BI/NIF: ${farmer.bi_nif ?? '—'}   ·   Tel: ${phone}   ·   Área: ${area}`, x + 21, y + 14.7);

  // Bottom — emissão/validade + nota legal
  pdf.setDrawColor(226, 230, 234).setLineWidth(0.1);
  pdf.line(x + 3, y + 16.8, x + CARD_W - 3, y + 16.8);

  const issued = new Date();
  const valid = new Date(issued); valid.setFullYear(valid.getFullYear() + 5);
  const fmt = (d: Date) => d.toLocaleDateString('pt-PT');

  pdf.setTextColor(38, 48, 61).setFontSize(5.8);
  pdf.text(`Emissão: ${fmt(issued)}`, x + 3, y + 21);
  pdf.text(`Validade: ${fmt(valid)}`, x + 3, y + 24);
  pdf.text('Tel: 923 000 000', x + 3, y + 27);
  pdf.text('Web: sigaflo.gov.ao', x + 3, y + 30);

  pdf.setTextColor(107, 114, 128).setFontSize(5);
  const legal = pdf.splitTextToSize(
    'Documento intransmissível e de uso institucional. Em caso de extravio devolver ao Min. Agricultura e Florestas. Autenticidade verificável pelo QR no anverso.',
    CARD_W / 2 - 4,
  );
  pdf.text(legal, x + CARD_W / 2, y + 21);

  // Footer stripe
  pdf.setFillColor(31, 107, 52);
  pdf.rect(x, y + CARD_H - 1.4, CARD_W, 1.4, 'F');
}

async function buildA4Pdf(ctxs: CardCtx[], opts: BatchExportOptions, onProgress?: (p: BatchProgress) => void): Promise<Blob> {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const cols = opts.cardsPerRowA4;
  const rows = opts.cardsPerColA4;
  const gap = 6;
  const pageW = 297, pageH = 210;
  const totalW = cols * CARD_W + (cols - 1) * gap;
  const totalH = rows * CARD_H + (rows - 1) * gap;
  const offX = (pageW - totalW) / 2;
  const offY = (pageH - totalH) / 2;
  const perPage = cols * rows;

  // header do lote
  const drawBatchHeader = () => {
    pdf.setFontSize(7).setTextColor(120);
    pdf.text(`Lote: ${opts.batchName}`, 8, 8);
    pdf.text(new Date().toLocaleString('pt-PT'), pageW - 8, 8, { align: 'right' });
  };

  const renderFaces = async (faces: 'front' | 'back') => {
    for (let i = 0; i < ctxs.length; i++) {
      const idx = i % perPage;
      if (idx === 0) {
        if (i > 0 || faces === 'back') pdf.addPage();
        drawBatchHeader();
      }
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = offX + col * (CARD_W + gap);
      const y = offY + row * (CARD_H + gap);
      if (faces === 'front') await drawCardFront(pdf, x, y, ctxs[i]);
      else drawCardBack(pdf, x, y, ctxs[i]);
      drawCutGuides(pdf, x, y, opts);
      onProgress?.({ processed: i + 1, total: ctxs.length * (opts.includeBack ? 2 : 1), phase: 'rendering' });
    }
  };

  drawBatchHeader();
  await renderFaces('front');
  if (opts.includeBack) await renderFaces('back');

  return pdf.output('blob');
}

async function buildSingleCardPdf(ctx: CardCtx, opts: BatchExportOptions): Promise<Blob> {
  const w = CARD_W + 12, h = CARD_H + 12;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [w, h] });
  await drawCardFront(pdf, 6, 6, ctx);
  drawCutGuides(pdf, 6, 6, opts);
  if (opts.includeBack) {
    pdf.addPage([w, h], 'landscape');
    drawCardBack(pdf, 6, 6, ctx);
    drawCutGuides(pdf, 6, 6, opts);
  }
  return pdf.output('blob');
}

function safeName(s: string) {
  return s.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 80);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportCardBatch(
  farmers: Farmer[],
  cardsMap: Record<string, { serial?: string; qr_token?: string }>,
  opts: BatchExportOptions,
  onProgress?: (p: BatchProgress) => void,
): Promise<{ filename: string; size: number }> {
  const verificationOrigin = window.location.origin;
  const ctxs: CardCtx[] = farmers.map((f) => ({ farmer: f, card: cardsMap[f.id], verificationOrigin }));
  const batch = safeName(opts.batchName);

  // Single PDF (A4 grid ou um cartão por página CR-80)
  if (opts.packaging === 'single_pdf') {
    let blob: Blob;
    if (opts.format === 'a4_grid') {
      blob = await buildA4Pdf(ctxs, opts, onProgress);
    } else {
      // CR-80 individual num único PDF (uma página por cartão)
      const w = CARD_W + 12, h = CARD_H + 12;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [w, h] });
      for (let i = 0; i < ctxs.length; i++) {
        if (i > 0) pdf.addPage([w, h], 'landscape');
        await drawCardFront(pdf, 6, 6, ctxs[i]);
        drawCutGuides(pdf, 6, 6, opts);
        if (opts.includeBack) {
          pdf.addPage([w, h], 'landscape');
          drawCardBack(pdf, 6, 6, ctxs[i]);
          drawCutGuides(pdf, 6, 6, opts);
        }
        onProgress?.({ processed: i + 1, total: ctxs.length, phase: 'rendering' });
      }
      blob = pdf.output('blob');
    }
    onProgress?.({ processed: ctxs.length, total: ctxs.length, phase: 'done' });
    const filename = `${batch}.pdf`;
    downloadBlob(blob, filename);
    return { filename, size: blob.size };
  }

  // ZIP
  const zip = new JSZip();
  const root = zip.folder(batch)!;

  if (opts.packaging === 'zip_per_card') {
    for (let i = 0; i < ctxs.length; i++) {
      const c = ctxs[i];
      const blob = await buildSingleCardPdf(c, opts);
      const fname = `${safeName(c.farmer.registration_number ?? c.farmer.name ?? c.farmer.id)}.pdf`;
      root.file(fname, blob);
      onProgress?.({ processed: i + 1, total: ctxs.length, phase: 'rendering' });
    }
  } else {
    // zip_per_province — um PDF A4 por província
    const groups = new Map<string, CardCtx[]>();
    ctxs.forEach((c) => {
      const k = c.farmer.provinces?.name ?? 'Sem-Provincia';
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(c);
    });
    let processed = 0;
    for (const [prov, items] of groups) {
      const blob = await buildA4Pdf(items, opts);
      root.file(`${safeName(prov)}.pdf`, blob);
      processed += items.length;
      onProgress?.({ processed, total: ctxs.length, phase: 'rendering' });
    }
  }

  // manifest
  const manifest = {
    batch_name: opts.batchName,
    generated_at: new Date().toISOString(),
    total_cards: ctxs.length,
    format: opts.format,
    packaging: opts.packaging,
    cut_guides: opts.showCutGuides,
    items: ctxs.map((c) => ({
      farmer_id: c.farmer.id,
      name: c.farmer.name,
      registration_number: c.farmer.registration_number,
      province: c.farmer.provinces?.name,
      serial: c.card?.serial ?? null,
    })),
  };
  root.file('manifest.json', JSON.stringify(manifest, null, 2));

  onProgress?.({ processed: ctxs.length, total: ctxs.length, phase: 'packaging' });
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const filename = `${batch}.zip`;
  downloadBlob(zipBlob, filename);
  onProgress?.({ processed: ctxs.length, total: ctxs.length, phase: 'done' });
  return { filename, size: zipBlob.size };
}
