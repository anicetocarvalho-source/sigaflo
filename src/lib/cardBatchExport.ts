import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import type { Farmer } from '@/hooks/useFarmers';
import insigniaAngolaUrl from '@/assets/insignia-angola.png';

let _insigniaDataUrlCache: string | null = null;
async function getInsigniaDataUrl(): Promise<string | null> {
  if (_insigniaDataUrlCache) return _insigniaDataUrlCache;
  try {
    const res = await fetch(insigniaAngolaUrl);
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    _insigniaDataUrlCache = dataUrl;
    return dataUrl;
  } catch {
    return null;
  }
}

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

const farmerTypeLabel = (t?: string | null) => {
  const m: Record<string, string> = {
    individual: 'PEQUENO PRODUTOR',
    family: 'AGRICULTURA FAMILIAR',
    cooperative: 'COOPERATIVA',
    field_school: 'ESCOLA DE CAMPO',
    company: 'EMPRESA',
  };
  return m[t || ''] || (t || '—').toUpperCase();
};

async function drawCardFront(pdf: jsPDF, x: number, y: number, ctx: CardCtx) {
  const { farmer, card, verificationOrigin } = ctx;

  // Background branco
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, CARD_W, CARD_H, 'F');

  // ===== HEADER (branco) =====
  // Brasão (placeholder círculo verde com escudo simplificado)
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(31, 107, 52).setLineWidth(0.2);
  pdf.circle(x + 4.5, y + 4, 2.6, 'FD');
  pdf.setFillColor(31, 107, 52);
  pdf.triangle(x + 3, y + 3, x + 6, y + 3, x + 4.5, y + 6, 'F');

  pdf.setTextColor(31, 107, 52).setFont('helvetica', 'bold').setFontSize(4.6);
  pdf.text('REPÚBLICA DE ANGOLA', x + 7.6, y + 2.6);
  pdf.setTextColor(38, 48, 61).setFont('helvetica', 'normal').setFontSize(3.8);
  pdf.text('Ministério da Agricultura', x + 7.6, y + 4.4);
  pdf.text('e Florestas', x + 7.6, y + 5.6);

  // Logo SIGAFLO centro
  pdf.setTextColor(31, 107, 52).setFont('helvetica', 'bold').setFontSize(13);
  pdf.text('SIGAFLO', x + CARD_W / 2, y + 4.6, { align: 'center' });
  pdf.setFont('helvetica', 'bold').setFontSize(3.5).setTextColor(12, 61, 26);
  pdf.text('SISTEMA INTEGRADO DE GESTÃO AGRO FLORESTAL', x + CARD_W / 2, y + 7.2, { align: 'center' });

  // Mapa Angola + GOVERNO badge (canto direito)
  pdf.setFillColor(31, 107, 52);
  pdf.roundedRect(x + CARD_W - 11.5, y + 1.5, 4.2, 5, 0.5, 0.5, 'F');
  pdf.setFillColor(212, 160, 23);
  pdf.circle(x + CARD_W - 9.4, y + 4, 0.6, 'F');
  pdf.setFillColor(12, 61, 26);
  pdf.roundedRect(x + CARD_W - 7, y + 1.5, 6.5, 5, 0.5, 0.5, 'F');
  pdf.setTextColor(255).setFont('helvetica', 'bold').setFontSize(3.4);
  pdf.text('GOVERNO DE', x + CARD_W - 3.75, y + 3.5, { align: 'center' });
  pdf.text('ANGOLA', x + CARD_W - 3.75, y + 5.2, { align: 'center' });

  // ===== Título (faixa verde central) =====
  pdf.setFillColor(31, 107, 52);
  pdf.roundedRect(x + 8, y + 11, CARD_W - 16, 4, 0.6, 0.6, 'F');
  pdf.setTextColor(255).setFont('helvetica', 'bold').setFontSize(6);
  pdf.text('CARTÃO DE IDENTIFICAÇÃO DO AGRICULTOR', x + CARD_W / 2, y + 13.7, { align: 'center' });

  // ===== Body — 3 colunas =====
  const bodyTop = y + 16.5;
  const z1X = x + 2.5;
  const z1W = 19;          // foto
  const z2X = z1X + z1W + 1.5;
  const z2W = 33;          // info
  const z3X = x + CARD_W - 23;
  const z3W = 16;          // localização

  // Foto
  pdf.setFillColor(240, 247, 241);
  pdf.setDrawColor(226, 230, 234).setLineWidth(0.15);
  pdf.roundedRect(z1X, bodyTop, z1W, 25, 0.8, 0.8, 'FD');
  pdf.setTextColor(31, 107, 52).setFont('helvetica', 'bold').setFontSize(8);
  pdf.text('FOTO', z1X + z1W / 2, bodyTop + 13, { align: 'center' });

  // Info
  pdf.setTextColor(107, 114, 128).setFont('helvetica', 'bold').setFontSize(4.2);
  pdf.text('NOME COMPLETO', z2X, bodyTop + 2);
  pdf.setTextColor(26, 32, 48).setFont('helvetica', 'bold').setFontSize(7.5);
  const nameLines = pdf.splitTextToSize((farmer.name ?? '—').toUpperCase(), z2W);
  pdf.text(nameLines.slice(0, 2), z2X, bodyTop + 5);

  pdf.setTextColor(107, 114, 128).setFont('helvetica', 'bold').setFontSize(4.2);
  pdf.text('ID SIGAFLO', z2X, bodyTop + 11);
  pdf.setTextColor(31, 107, 52).setFont('courier', 'bold').setFontSize(7);
  pdf.text(card?.serial || farmer.registration_number || '—', z2X, bodyTop + 14.2);

  pdf.setTextColor(107, 114, 128).setFont('helvetica', 'bold').setFontSize(4.2);
  pdf.text('TIPO DE PRODUTOR', z2X, bodyTop + 18.5);
  pdf.setTextColor(26, 32, 48).setFont('helvetica', 'bold').setFontSize(6);
  pdf.text(farmerTypeLabel(farmer.farmer_type), z2X, bodyTop + 21.5);

  // Localização (col direita superior)
  const locItems = [
    ['PROVÍNCIA', farmer.provinces?.name ?? '—'],
    ['MUNICÍPIO', farmer.municipalities?.name ?? '—'],
    ['COMUNA', (farmer as any).communes?.name ?? '—'],
  ];
  locItems.forEach(([lbl, val], i) => {
    const ty = bodyTop + i * 6.5;
    pdf.setTextColor(107, 114, 128).setFont('helvetica', 'bold').setFontSize(4.2);
    pdf.text(lbl, z3X, ty + 2);
    pdf.setFillColor(31, 107, 52);
    pdf.circle(z3X + 0.7, ty + 4.7, 0.5, 'F');
    pdf.setTextColor(26, 32, 48).setFont('helvetica', 'bold').setFontSize(5.5);
    const v = pdf.splitTextToSize(String(val).toUpperCase(), z3W - 2);
    pdf.text(v[0] || '', z3X + 1.8, ty + 5);
  });

  // ===== QR + caption (canto inferior direito sobre rodapé) =====
  const qrPayload = card?.qr_token
    ? `${verificationOrigin}/verificacao/${card.qr_token}`
    : JSON.stringify({ id: farmer.id, reg: farmer.registration_number });
  try {
    const qr = await makeQrDataUrl(qrPayload);
    const qrSize = 11;
    const qrX = x + CARD_W - qrSize - 8;
    const qrY = y + CARD_H - qrSize - 7.5;
    pdf.setFillColor(255, 255, 255);
    pdf.rect(qrX - 0.4, qrY - 0.4, qrSize + 0.8, qrSize + 0.8, 'F');
    pdf.addImage(qr, 'PNG', qrX, qrY, qrSize, qrSize);
    pdf.setTextColor(26, 32, 48).setFont('helvetica', 'bold').setFontSize(3.4);
    pdf.text('VERIFIQUE A', qrX + qrSize + 0.6, qrY + 2.5);
    pdf.text('AUTENTICIDADE', qrX + qrSize + 0.6, qrY + 4.5);
    pdf.text('DESTE CARTÃO', qrX + qrSize + 0.6, qrY + 6.5);
  } catch { /* ignore */ }

  // ===== Rodapé verde (paisagem + 4 pilares) =====
  const fY = y + CARD_H - 6;
  pdf.setFillColor(12, 61, 26);
  pdf.rect(x, fY, CARD_W, 6, 'F');
  // gradiente "morros" simulado
  pdf.setFillColor(31, 107, 52);
  pdf.rect(x, fY, CARD_W, 2.5, 'F');

  pdf.setTextColor(255).setFont('helvetica', 'bold').setFontSize(4.5);
  const pillars = ['PRODUZIR', 'PRESERVAR', 'DESENVOLVER', 'INCLUIR'];
  pillars.forEach((p, i) => {
    const px = x + 6 + i * ((CARD_W - 12) / 3);
    pdf.setFillColor(255, 255, 255);
    pdf.circle(px - 2, fY + 3.5, 0.5, 'F');
    pdf.text(p, px, fY + 4, { align: 'center' });
  });
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

  // Fundo branco
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, CARD_W, CARD_H, 'F');

  // ===== Painel esquerdo (verde escuro) =====
  const leftW = CARD_W * 0.38;
  pdf.setFillColor(12, 61, 26);
  pdf.rect(x, y, leftW, CARD_H, 'F');

  const issued = new Date();
  const valid = new Date(issued); valid.setFullYear(valid.getFullYear() + 5);
  const fmt = (d: Date) => d.toLocaleDateString('pt-PT');

  const items: Array<[string, string]> = [
    ['DATA DE EMISSÃO', fmt(issued)],
    ['DATA DE VALIDADE', fmt(valid)],
    ['ESTADO DO REGISTO', 'ATIVO'],
  ];
  items.forEach(([lbl, val], i) => {
    const ty = y + 4 + i * 9;
    pdf.setTextColor(212, 160, 23).setFont('helvetica', 'bold').setFontSize(3.8);
    pdf.text('▣', x + 2.5, ty);
    pdf.setTextColor(220, 220, 220).setFont('helvetica', 'bold').setFontSize(4.2);
    pdf.text(lbl, x + 4.5, ty);
    pdf.setTextColor(255).setFont('helvetica', 'bold').setFontSize(7);
    pdf.text(val, x + 2.5, ty + 4);
  });

  // Assinatura + autoridade
  pdf.setDrawColor(255, 255, 255).setLineWidth(0.1);
  pdf.line(x + 2.5, y + CARD_H - 9, x + leftW - 2.5, y + CARD_H - 9);
  pdf.setTextColor(255).setFont('times', 'italic').setFontSize(9);
  pdf.text('Autoridade', x + 2.5, y + CARD_H - 5);
  pdf.setFont('helvetica', 'bold').setFontSize(4.2).setTextColor(220, 220, 220);
  pdf.text('AUTORIDADE EMISSORA', x + 2.5, y + CARD_H - 2.5);

  // ===== Painel direito (branco) =====
  const rightX = x + leftW + 2.5;
  const rightW = CARD_W - leftW - 5;
  const bcId = card?.serial || farmer.registration_number || farmer.id.slice(0, 12);

  pdf.setTextColor(107, 114, 128).setFont('helvetica', 'bold').setFontSize(4.2);
  pdf.text('CÓDIGO DE BARRAS', rightX, y + 4);
  drawBarcodeBars(pdf, bcId, rightX, y + 5, rightW, 7);
  pdf.setTextColor(26, 32, 48).setFont('courier', 'bold').setFontSize(5.8);
  pdf.text(bcId, rightX + rightW / 2, y + 14.5, { align: 'center' });

  // NFC
  pdf.setFillColor(240, 247, 241);
  pdf.circle(rightX + 2, y + 19.5, 1.6, 'F');
  pdf.setTextColor(31, 107, 52).setFont('helvetica', 'bold').setFontSize(5);
  pdf.text('NFC', rightX + 4.5, y + 19.5);
  pdf.setTextColor(26, 32, 48).setFont('helvetica', 'normal').setFontSize(4.2);
  pdf.text('Aproxime para verificar', rightX + 4.5, y + 21.7);

  // Caixa de apoio
  pdf.setFillColor(240, 247, 241);
  pdf.roundedRect(rightX, y + 25, rightW, 8, 0.5, 0.5, 'F');
  pdf.setTextColor(31, 107, 52).setFont('helvetica', 'bold').setFontSize(4.6);
  pdf.text('LINHA DE APOIO SIGAFLO', rightX + 1.5, y + 27.5);
  pdf.setTextColor(26, 32, 48).setFont('helvetica', 'normal').setFontSize(4);
  pdf.text('923 123 456 - apoio@sigaflo.gov.ao', rightX + 1.5, y + 30);
  pdf.text('www.sigaflo.gov.ao', rightX + 1.5, y + 32);

  // Nota legal
  pdf.setFillColor(240, 247, 241);
  pdf.rect(rightX, y + CARD_H - 7, rightW, 5, 'F');
  pdf.setFillColor(31, 107, 52);
  pdf.rect(rightX, y + CARD_H - 7, 0.5, 5, 'F');
  pdf.setTextColor(26, 32, 48).setFont('helvetica', 'normal').setFontSize(3.6);
  const legal = pdf.splitTextToSize(
    'Este cartão é pessoal e intransmissível. O uso indevido implica sanções nos termos da lei.',
    rightW - 2,
  );
  pdf.text(legal, rightX + 1.2, y + CARD_H - 5);
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
