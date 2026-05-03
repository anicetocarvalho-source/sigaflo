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
  // moldura
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(x, y, CARD_W, CARD_H, 2, 2);

  // header
  pdf.setFillColor(22, 101, 52);
  pdf.rect(x, y, CARD_W, 9, 'F');
  pdf.setTextColor(255).setFont('helvetica', 'bold').setFontSize(8);
  pdf.text('SIGAFLO · CARTÃO DE AGRICULTOR', x + 3, y + 6);

  // photo placeholder
  pdf.setFillColor(230, 230, 230);
  pdf.rect(x + 3, y + 12, 22, 28, 'F');
  pdf.setTextColor(150, 150, 150).setFontSize(6);
  pdf.text('FOTO', x + 11, y + 27);

  // dados
  pdf.setTextColor(0).setFont('helvetica', 'bold').setFontSize(9);
  pdf.text((farmer.name ?? '').slice(0, 26), x + 27, y + 16);
  pdf.setFont('helvetica', 'normal').setFontSize(7);
  pdf.text(`Reg: ${farmer.registration_number ?? '—'}`, x + 27, y + 21);
  pdf.text(
    `${farmer.provinces?.name ?? ''} / ${farmer.municipalities?.name ?? ''}`.slice(0, 36),
    x + 27, y + 25,
  );
  pdf.text(`Cultura: ${(farmer.main_crops?.[0]) ?? '—'}`, x + 27, y + 29);
  pdf.text(`Área: ${farmer.cultivated_area_ha ?? 0} ha`, x + 27, y + 33);

  if (card?.serial) {
    pdf.setFont('courier', 'normal').setFontSize(6.5);
    pdf.text(card.serial, x + 27, y + 38);
  }

  // QR (verificação ou fallback JSON)
  const qrPayload = card?.qr_token
    ? `${verificationOrigin}/verificacao/${card.qr_token}`
    : JSON.stringify({ id: farmer.id, reg: farmer.registration_number });
  try {
    const qr = await makeQrDataUrl(qrPayload);
    pdf.addImage(qr, 'PNG', x + CARD_W - 22, y + CARD_H - 22, 19, 19);
  } catch { /* ignore */ }
}

function drawCardBack(pdf: jsPDF, x: number, y: number, ctx: CardCtx) {
  const { farmer, card } = ctx;
  pdf.setDrawColor(200); pdf.setLineWidth(0.2);
  pdf.roundedRect(x, y, CARD_W, CARD_H, 2, 2);
  pdf.setTextColor(0).setFont('helvetica', 'bold').setFontSize(8);
  pdf.text('Verso · SIGAFLO', x + 3, y + 7);
  pdf.setFont('helvetica', 'normal').setFontSize(7);
  pdf.text(`ID: ${farmer.id.slice(0, 12)}`, x + 3, y + 14);
  if (card?.serial) pdf.text(`Serial: ${card.serial}`, x + 3, y + 19);
  pdf.setFontSize(6).setTextColor(100);
  pdf.text('Em caso de extravio contacte 923 000 000 ou o ponto de atendimento mais próximo.', x + 3, y + CARD_H - 6, { maxWidth: CARD_W - 6 });
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
