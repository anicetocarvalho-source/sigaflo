import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Printer, Fingerprint, Phone, MapPin, CreditCard, FileDown, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Farmer } from '@/hooks/useFarmers';
import { PrintPreviewDialog } from './PrintPreviewDialog';

interface FarmerCardProps {
  farmer: Farmer;
  onPrint?: () => void;
  showActions?: boolean;
}

const formatBI = (bi?: string | null): string => {
  if (!bi) return '—';
  const digits = bi.replace(/\s/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
};

const farmerTypeLabels: Record<string, string> = {
  individual: 'Pequeno Agricultor',
  family: 'Agricultura Familiar',
  cooperative: 'Cooperativa',
  field_school: 'Escola de Campo',
  company: 'Empresa',
};

// Guilloché-style SVG pattern (subtle, security-document feel)
const GuillocheBg = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 400 252"
    preserveAspectRatio="none"
    aria-hidden
  >
    <defs>
      <pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse">
        <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      </pattern>
      <radialGradient id="glow" cx="80%" cy="20%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    <rect width="400" height="252" fill="url(#grid)" />
    <rect width="400" height="252" fill="url(#glow)" />
    {/* concentric arcs */}
    {Array.from({ length: 6 }).map((_, i) => (
      <circle
        key={i}
        cx="-40"
        cy="280"
        r={120 + i * 24}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.6"
      />
    ))}
  </svg>
);

export const FarmerCard = ({ farmer, onPrint, showActions = true }: FarmerCardProps) => {
  const [flipped, setFlipped] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [exporting, setExporting] = useState<null | 'pvc' | 'a4'>(null);
  const [previewMode, setPreviewMode] = useState<null | 'pvc' | 'a4'>(null);

  const qrPayload = JSON.stringify({
    plataforma: 'SIGAFLO',
    id: farmer.id,
    nome: farmer.name,
    bi: farmer.bi_nif || '',
    provincia: farmer.provinces?.name || '',
    municipio: farmer.municipalities?.name || '',
  });

  const hasBiometry = !!(farmer as any).fingerprint_data;

  const buildPrintHtml = (mode: 'pvc' | 'a4') => {
    const isPvc = mode === 'pvc';
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrPayload)}`;
    const photoHtml = farmer.photo_url
      ? `<img src="${farmer.photo_url}" crossorigin="anonymous" />`
      : `<div class="initials">${getInitials(farmer.name)}</div>`;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Cartão SIGAFLO — ${farmer.name}</title>
<style>
  /* PVC: exact CR-80, no margins, one card per page (duplex front/back).
     A4: landscape so both cards fit side-by-side within 297x210 minus margins. */
  @page {
    size: ${isPvc ? '85.6mm 53.98mm' : 'A4 landscape'};
    margin: ${isPvc ? '0' : '12mm'};
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body {
    margin: 0; padding: 0;
    background: ${isPvc ? 'transparent' : '#f5f5f5'};
    font-family: 'Helvetica Neue', Arial, sans-serif; color: #fff;
  }
  .sheet {
    ${isPvc
      ? 'width: 85.6mm;'
      : 'display: flex; gap: 10mm; flex-wrap: nowrap; align-items: flex-start; justify-content: center;'}
  }
  .card {
    width: 85.6mm; height: 53.98mm; position: relative; overflow: hidden;
    flex-shrink: 0;
    ${isPvc
      ? 'display: block;'
      : 'box-shadow: 0 2px 6px rgba(0,0,0,0.15); border-radius: 3mm; outline: 1px dashed #888; outline-offset: 2mm;'}
  }
  ${isPvc ? `
    /* Force exactly one card per page (front then back). */
    .card { page-break-after: always; break-after: page; }
    .card:last-of-type { page-break-after: auto; break-after: auto; }
  ` : ''}

  /* FRONT */
  .front {
    background: linear-gradient(135deg, #052e14 0%, #0d4a22 45%, #166534 100%);
    color: #fff; padding: 4mm 4.5mm; position: relative;
  }
  .front::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(circle at 85% 15%, rgba(255,255,255,0.18), transparent 45%),
      repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 8px);
  }
  .front-inner { position: relative; height: 100%; display: flex; flex-direction: column; }
  .topbar { display: flex; align-items: center; justify-content: space-between; }
  .topbar .gov { font-size: 6pt; letter-spacing: 1.2px; opacity: 0.85; text-transform: uppercase; line-height: 1.3; }
  .topbar .gov strong { font-size: 7pt; display: block; letter-spacing: 0.5px; }
  .wordmark {
    font-size: 9pt; font-weight: 800; letter-spacing: 3px;
    background: linear-gradient(135deg, #fde68a, #f59e0b);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    padding: 1mm 2mm; border: 0.3mm solid rgba(253,230,138,0.45); border-radius: 1mm;
  }
  .body { display: flex; gap: 3mm; margin-top: 2mm; flex: 1; align-items: stretch; min-height: 0; }
  .photo {
    width: 22mm; height: 28mm; border-radius: 1.5mm; overflow: hidden;
    border: 0.4mm solid rgba(253,230,138,0.6);
    box-shadow: inset 0 0 0 0.3mm rgba(0,0,0,0.3), 0 0 4mm rgba(0,0,0,0.4);
    background: rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo .initials { font-size: 18pt; font-weight: 700; color: rgba(255,255,255,0.6); }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .name { font-size: 11pt; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1.15; margin: 0 0 1.2mm; }
  .bi { font-size: 9pt; font-family: 'Courier New', monospace; letter-spacing: 1.5px; color: #fde68a; margin-bottom: 1.5mm; }
  .meta { font-size: 6.5pt; opacity: 0.92; margin-bottom: 0.8mm; display: flex; align-items: center; gap: 1mm; }
  .reg { font-family: 'Courier New', monospace; font-size: 7pt; color: #fde68a; margin-top: 1mm; }
  .chips { margin-top: auto; display: flex; gap: 1.5mm; flex-wrap: wrap; }
  .chip { font-size: 5.5pt; padding: 0.6mm 1.6mm; border-radius: 1mm; background: rgba(255,255,255,0.18); border: 0.2mm solid rgba(255,255,255,0.25); }
  .chip.gold { background: rgba(253,230,138,0.18); border-color: rgba(253,230,138,0.45); color: #fde68a; }
  .chip-stripe {
    position: absolute; bottom: 4mm; right: 4mm;
    width: 14mm; height: 9mm; border-radius: 1mm;
    background: linear-gradient(135deg, #fde68a, #b45309 60%, #fde68a);
    opacity: 0.85;
    box-shadow: 0 0 1mm rgba(0,0,0,0.4) inset;
  }
  .chip-stripe::after {
    content: ''; position: absolute; inset: 1mm;
    background-image:
      linear-gradient(0deg, transparent 49%, rgba(0,0,0,0.25) 49% 51%, transparent 51%),
      linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.25) 49% 51%, transparent 51%);
    background-size: 100% 2mm, 2mm 100%;
  }

  /* BACK */
  .back {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    color: #1a1a1a; padding: 4mm 4.5mm; position: relative;
  }
  .back-grid { display: flex; gap: 3mm; height: 100%; }
  .back-info { flex: 1; min-width: 0; }
  .back-info .label { font-size: 6pt; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .back-info .value { font-size: 8pt; font-weight: 600; color: #111827; margin-bottom: 1.5mm; }
  .qr-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
  .qr-wrap img { width: 22mm; height: 22mm; }
  .qr-wrap .qr-label { font-size: 5pt; color: #6b7280; margin-top: 1mm; }
  .back-footer { position: absolute; bottom: 2mm; left: 4.5mm; right: 4.5mm; font-size: 5pt; color: #6b7280; text-align: center; }

  ${isPvc ? '' : `
    .col { display: flex; flex-direction: column; align-items: center; }
    h2 { font-size: 10pt; color: #111; margin: 0 0 4mm; letter-spacing: 1px; text-transform: uppercase; }
  `}
</style>
</head>
<body>
  ${isPvc ? `
    <div class="sheet">
      <div class="card front"><div class="front-inner">
        <div class="topbar">
          <div class="gov">República de Angola<strong>Min. da Agricultura e Florestas</strong></div>
          <div class="wordmark">SIGAFLO</div>
        </div>
        <div class="body">
          <div class="photo">${photoHtml}</div>
          <div class="info">
            <div class="name">${farmer.name}</div>
            <div class="bi">${formatBI(farmer.bi_nif)}</div>
            <div class="meta">📍 ${farmer.provinces?.name || '—'}, ${farmer.municipalities?.name || '—'}</div>
            <div class="reg">Nº ${farmer.registration_number || '—'}</div>
            <div class="chips">
              <span class="chip gold">${farmerTypeLabels[farmer.farmer_type] || farmer.farmer_type}</span>
              <span class="chip">${hasBiometry ? '✓ Biometria' : '⏳ Biometria'}</span>
            </div>
          </div>
        </div>
        <div class="chip-stripe"></div>
      </div></div>
      <div class="card back">
        <div class="back-grid">
          <div class="back-info">
            <div class="label">BI / NIF</div><div class="value">${formatBI(farmer.bi_nif)}</div>
            <div class="label">Telefone</div><div class="value">${farmer.phone || '—'}</div>
            <div class="label">Província / Município</div><div class="value">${farmer.provinces?.name || '—'} / ${farmer.municipalities?.name || '—'}</div>
            <div class="label">Área Total</div><div class="value">${farmer.total_area_ha ? farmer.total_area_ha.toFixed(1) + ' ha' : '—'}</div>
          </div>
          <div class="qr-wrap">
            <img src="${qrSrc}" />
            <div class="qr-label">Verificar</div>
          </div>
        </div>
        <div class="back-footer">Válido enquanto o registo estiver activo · SIGAFLO</div>
      </div>
    </div>
  ` : `
    <div class="sheet">
      <div class="col">
        <h2>Frente</h2>
        <div class="card front"><div class="front-inner">
          <div class="topbar">
            <div class="gov">República de Angola<strong>Min. da Agricultura e Florestas</strong></div>
            <div class="wordmark">SIGAFLO</div>
          </div>
          <div class="body">
            <div class="photo">${photoHtml}</div>
            <div class="info">
              <div class="name">${farmer.name}</div>
              <div class="bi">${formatBI(farmer.bi_nif)}</div>
              <div class="meta">📍 ${farmer.provinces?.name || '—'}, ${farmer.municipalities?.name || '—'}</div>
              <div class="reg">Nº ${farmer.registration_number || '—'}</div>
              <div class="chips">
                <span class="chip gold">${farmerTypeLabels[farmer.farmer_type] || farmer.farmer_type}</span>
                <span class="chip">${hasBiometry ? '✓ Biometria' : '⏳ Biometria'}</span>
              </div>
            </div>
          </div>
          <div class="chip-stripe"></div>
        </div></div>
      </div>
      <div class="col">
        <h2>Verso</h2>
        <div class="card back">
          <div class="back-grid">
            <div class="back-info">
              <div class="label">BI / NIF</div><div class="value">${formatBI(farmer.bi_nif)}</div>
              <div class="label">Telefone</div><div class="value">${farmer.phone || '—'}</div>
              <div class="label">Província / Município</div><div class="value">${farmer.provinces?.name || '—'} / ${farmer.municipalities?.name || '—'}</div>
              <div class="label">Área Total</div><div class="value">${farmer.total_area_ha ? farmer.total_area_ha.toFixed(1) + ' ha' : '—'}</div>
            </div>
            <div class="qr-wrap">
              <img src="${qrSrc}" />
              <div class="qr-label">Verificar</div>
            </div>
          </div>
          <div class="back-footer">Válido enquanto o registo estiver activo · SIGAFLO</div>
        </div>
      </div>
    </div>
  `}
  <script>
    window.addEventListener('load', () => setTimeout(() => window.print(), 400));
  </script>
</body>
</html>`;
  };

  const openPrintWindow = (mode: 'pvc' | 'a4') => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(buildPrintHtml(mode));
    w.document.close();
    setPrintDialogOpen(false);
  };

  const exportPdf = async (mode: 'pvc' | 'a4') => {
    setExporting(mode);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.width = mode === 'pvc' ? '120mm' : '230mm';
    iframe.style.height = mode === 'pvc' ? '180mm' : '180mm';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    try {
      // Reuse the same HTML as the print mode but strip the auto-print script.
      const html = buildPrintHtml(mode).replace(/<script[\s\S]*?<\/script>/g, '');
      const doc = iframe.contentDocument!;
      doc.open();
      doc.write(html);
      doc.close();

      // Wait for fonts and images.
      await new Promise<void>((resolve) => {
        if (iframe.contentDocument?.readyState === 'complete') resolve();
        else iframe.onload = () => resolve();
      });
      const imgs = Array.from(doc.images);
      await Promise.all(
        imgs.map(
          (img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((res) => {
                  img.onload = () => res();
                  img.onerror = () => res();
                }),
        ),
      );
      // Small delay so guilloché gradients settle.
      await new Promise((r) => setTimeout(r, 150));

      const cards = Array.from(doc.querySelectorAll<HTMLElement>('.card'));
      if (cards.length === 0) throw new Error('Cartões não encontrados');

      const CR80_W = 85.6; // mm
      const CR80_H = 53.98;

      if (mode === 'pvc') {
        // One card per page (front then back), no margins, exact CR-80.
        const pdf = new jsPDF({
          unit: 'mm',
          format: [CR80_W, CR80_H],
          orientation: 'landscape',
        });
        for (let i = 0; i < cards.length; i++) {
          const canvas = await html2canvas(cards[i], {
            scale: 4,
            backgroundColor: null,
            useCORS: true,
            logging: false,
          });
          const img = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) pdf.addPage([CR80_W, CR80_H], 'landscape');
          pdf.addImage(img, 'JPEG', 0, 0, CR80_W, CR80_H);
        }
        pdf.save(`cartao_${farmer.registration_number || farmer.id}_pvc.pdf`);
      } else {
        // A4 sheet: front + back side by side with cut guides (mirrors print layout).
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const gap = 12;
        const totalW = CR80_W * 2 + gap;
        const startX = (pageW - totalW) / 2;
        const startY = (pageH - CR80_H) / 2;

        for (let i = 0; i < Math.min(2, cards.length); i++) {
          const canvas = await html2canvas(cards[i], {
            scale: 4,
            backgroundColor: null,
            useCORS: true,
            logging: false,
          });
          const img = canvas.toDataURL('image/jpeg', 0.95);
          const x = startX + i * (CR80_W + gap);
          pdf.addImage(img, 'JPEG', x, startY, CR80_W, CR80_H);

          // Dashed cut guides
          pdf.setLineDashPattern([1, 1], 0);
          pdf.setDrawColor(150);
          pdf.rect(x - 1, startY - 1, CR80_W + 2, CR80_H + 2);
        }
        pdf.setLineDashPattern([], 0);
        pdf.setFontSize(8);
        pdf.setTextColor(120);
        pdf.text(
          `SIGAFLO · Cartão de Identificação · ${farmer.name}`,
          pageW / 2,
          pageH - 8,
          { align: 'center' },
        );
        pdf.save(`cartao_${farmer.registration_number || farmer.id}_a4.pdf`);
      }
      toast.success('PDF gerado com sucesso');
      setPrintDialogOpen(false);
    } catch (e: any) {
      toast.error('Erro ao gerar PDF: ' + (e?.message || 'desconhecido'));
    } finally {
      document.body.removeChild(iframe);
      setExporting(null);
    }
  };

  const handlePrint = () => {
    if (onPrint) onPrint();
    else setPrintDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* 3D Flip Card */}
      <div
        className="cursor-pointer mx-auto"
        style={{ perspective: '1000px', width: '380px', height: '240px' }}
        onClick={() => setFlipped(!flipped)}
        title="Clique para virar o cartão"
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT — redesigned */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div
              className="relative w-full h-full text-white p-4 flex flex-col"
              style={{
                background:
                  'linear-gradient(135deg, hsl(140 80% 8%) 0%, hsl(142 70% 18%) 45%, hsl(142 60% 28%) 100%)',
              }}
            >
              <GuillocheBg />

              {/* Header */}
              <div className="relative flex items-start justify-between mb-2">
                <div className="leading-tight">
                  <p className="text-[8px] uppercase tracking-[0.2em] opacity-80">República de Angola</p>
                  <p className="text-[9px] font-semibold opacity-95">Ministério da Agricultura e Florestas</p>
                </div>
                <div
                  className="text-[10px] font-extrabold tracking-[0.25em] px-2 py-0.5 rounded border"
                  style={{
                    background: 'linear-gradient(135deg, hsl(45 95% 70%), hsl(38 90% 50%))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    borderColor: 'hsl(45 95% 70% / 0.45)',
                  }}
                >
                  SIGAFLO
                </div>
              </div>

              {/* Body */}
              <div className="relative flex gap-3 flex-1">
                {/* Photo with golden frame */}
                <div
                  className="w-[72px] h-[88px] rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{
                    border: '1.5px solid hsl(45 95% 70% / 0.6)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), 0 4px 14px rgba(0,0,0,0.4)',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                >
                  {farmer.photo_url ? (
                    <img
                      src={farmer.photo_url}
                      alt={farmer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold opacity-60">
                      {getInitials(farmer.name)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <p className="text-[13px] font-bold uppercase tracking-wide leading-tight truncate">
                    {farmer.name}
                  </p>
                  <p
                    className="text-xs font-mono tracking-[2px] mt-1"
                    style={{ color: 'hsl(45 95% 75%)' }}
                  >
                    {formatBI(farmer.bi_nif)}
                  </p>
                  <p className="text-[9px] opacity-90 mt-1 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    {farmer.provinces?.name || '—'}, {farmer.municipalities?.name || '—'}
                  </p>
                  <p
                    className="text-[10px] font-mono mt-0.5"
                    style={{ color: 'hsl(45 95% 75%)' }}
                  >
                    Nº {farmer.registration_number || '—'}
                  </p>

                  <div className="flex gap-1.5 mt-auto pt-2 flex-wrap">
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded border"
                      style={{
                        background: 'hsl(45 95% 70% / 0.18)',
                        borderColor: 'hsl(45 95% 70% / 0.45)',
                        color: 'hsl(45 95% 80%)',
                      }}
                    >
                      {farmerTypeLabels[farmer.farmer_type] || farmer.farmer_type}
                    </span>
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5 border ${
                        hasBiometry
                          ? 'bg-white/15 border-white/25'
                          : 'bg-yellow-400/20 border-yellow-300/40'
                      }`}
                    >
                      <Fingerprint className="h-2 w-2" />
                      {hasBiometry ? 'Verificado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chip-stripe (simulated PVC chip) */}
              <div
                className="absolute bottom-3 right-3 w-[52px] h-[34px] rounded-[3px] overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(45 95% 70%), hsl(35 80% 38%) 60%, hsl(45 95% 75%))',
                  boxShadow: 'inset 0 0 2px rgba(0,0,0,0.5)',
                  opacity: 0.92,
                }}
                aria-hidden
              >
                <div
                  className="absolute inset-1"
                  style={{
                    backgroundImage:
                      'linear-gradient(0deg, transparent 49%, rgba(0,0,0,0.3) 49% 51%, transparent 51%), linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.3) 49% 51%, transparent 51%)',
                    backgroundSize: '100% 7px, 7px 100%',
                  }}
                />
              </div>

              {/* Status overlay */}
              {farmer.status !== 'approved' && farmer.status !== 'issued' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="px-6 py-1 text-sm font-bold tracking-[0.4em] uppercase"
                    style={{
                      background: 'rgba(0,0,0,0.55)',
                      color: 'hsl(45 95% 80%)',
                      transform: 'rotate(-18deg)',
                      border: '1px solid hsl(45 95% 70% / 0.6)',
                    }}
                  >
                    Rascunho
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-green-50 via-green-100 to-green-50 p-4 flex">
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">BI / NIF</p>
                  <p className="text-xs font-semibold font-mono">{formatBI(farmer.bi_nif)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Telefone</p>
                  <p className="text-xs font-semibold flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5" />
                    {farmer.phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Província / Município</p>
                  <p className="text-xs font-semibold">{farmer.provinces?.name || '—'} / {farmer.municipalities?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Área Total</p>
                  <p className="text-xs font-semibold">{farmer.total_area_ha ? `${farmer.total_area_ha.toFixed(1)} ha` : '—'}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center ml-3">
                <QRCodeSVG value={qrPayload} size={90} level="M" bgColor="transparent" />
                <p className="text-[7px] text-muted-foreground mt-1">Verificar</p>
              </div>

              <p className="absolute bottom-2 left-4 right-4 text-[7px] text-muted-foreground">
                Válido enquanto o registo estiver activo · SIGAFLO · Sistema Nacional de Registo Agroflorestal
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">Clique no cartão para virar</p>

      {showActions && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="default" size="sm" onClick={() => setPrintDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Download / Imprimir
          </Button>
        </div>
      )}

      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir cartão</DialogTitle>
            <DialogDescription>
              Escolha o formato. Para impressoras de cartão (Zebra, Evolis, Fargo) use <strong>Cartão PVC</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            <div className="border rounded-lg p-4 hover:border-primary transition">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-semibold">Cartão PVC</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                CR-80 · 85,6 × 53,98 mm · sem margens · frente e verso em páginas separadas (duplex).
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewMode('pvc')}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Pré-visualizar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openPrintWindow('pvc')}>
                  <Printer className="h-3.5 w-3.5 mr-1" />
                  Imprimir
                </Button>
              </div>
            </div>
            <div className="border rounded-lg p-4 hover:border-primary transition">
              <div className="flex items-center gap-2 mb-1">
                <Printer className="h-5 w-5 text-primary" />
                <span className="font-semibold">A4 (teste)</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Frente e verso lado-a-lado em A4, com guias de corte. Ideal para impressão em papel.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewMode('a4')}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Pré-visualizar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openPrintWindow('a4')}>
                  <Printer className="h-3.5 w-3.5 mr-1" />
                  Imprimir
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Exportar para PDF (mesmo layout, frente e verso)
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => exportPdf('pvc')}
                disabled={exporting !== null}
              >
                {exporting === 'pvc' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                PDF Cartão PVC (CR-80)
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => exportPdf('a4')}
                disabled={exporting !== null}
              >
                {exporting === 'a4' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                PDF A4 (teste)
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPrintDialogOpen(false)} disabled={exporting !== null}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
