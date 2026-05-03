import { useEffect, useState } from 'react';
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
import { Download, Printer, CreditCard, FileDown, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';
import type { Farmer } from '@/hooks/useFarmers';
import { PrintPreviewDialog } from './PrintPreviewDialog';
import { useActiveFarmerCard } from '@/hooks/useFarmerCards';
import { CardStatusBar } from './CardStatusBar';
import {
  cardCss,
  renderCardFrontHtml,
  renderCardBackHtml,
  qrServiceUrl,
  CARD_COLORS,
  type CardTemplateCtx,
} from '@/lib/cardTemplate';

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

// Subtle SIGAFLO watermark for the redesigned front
const SigafloWatermark = () => (
  <div
    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
    style={{
      opacity: 0.05,
      fontSize: '64px',
      fontWeight: 900,
      letterSpacing: '8px',
      color: CARD_COLORS.green,
      transform: 'rotate(-18deg)',
    }}
    aria-hidden
  >
    SIGAFLO
  </div>
);

// Tiny SVG barcode renderer (Code128 via jsbarcode → string)
const buildBarcodeSvgString = (value: string): string => {
  if (typeof window === 'undefined') return '';
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, value || 'SIGAFLO', {
      format: 'CODE128',
      displayValue: false,
      margin: 0,
      height: 60,
      width: 1.4,
      lineColor: CARD_COLORS.greenDark,
      background: 'transparent',
    });
    svg.setAttribute('preserveAspectRatio', 'none');
    return new XMLSerializer().serializeToString(svg);
  } catch {
    return '';
  }
};

type DuplexMode = 'long-edge' | 'short-edge' | 'simplex';
const DUPLEX_KEY = 'sigaflo.card.duplex';
const OFFSET_KEY = 'sigaflo.card.offset';
const CUT_KEY = 'sigaflo.card.cutGuides';

export const FarmerCard = ({ farmer, onPrint, showActions = true }: FarmerCardProps) => {
  const [flipped, setFlipped] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [exporting, setExporting] = useState<null | 'pvc' | 'a4'>(null);
  const [previewMode, setPreviewMode] = useState<null | 'pvc' | 'a4'>(null);
  const [duplexMode, setDuplexMode] = useState<DuplexMode>('long-edge');
  const [offsetX, setOffsetX] = useState(0); // mm — ajuste fino do verso
  const [offsetY, setOffsetY] = useState(0); // mm
  // Linhas de corte (sangria) configuráveis por modo
  const [cutA4Visible, setCutA4Visible] = useState(true);
  const [cutA4Offset, setCutA4Offset] = useState(1); // mm fora do cartão
  const [cutPvcVisible, setCutPvcVisible] = useState(false); // PVC normalmente sem guias
  const [cutPvcOffset, setCutPvcOffset] = useState(0);

  useEffect(() => {
    try {
      const d = localStorage.getItem(DUPLEX_KEY) as DuplexMode | null;
      if (d) setDuplexMode(d);
      const o = localStorage.getItem(OFFSET_KEY);
      if (o) {
        const parsed = JSON.parse(o);
        setOffsetX(parsed.x ?? 0);
        setOffsetY(parsed.y ?? 0);
      }
      const c = localStorage.getItem(CUT_KEY);
      if (c) {
        const parsed = JSON.parse(c);
        if (typeof parsed.a4Visible === 'boolean') setCutA4Visible(parsed.a4Visible);
        if (typeof parsed.a4Offset === 'number') setCutA4Offset(parsed.a4Offset);
        if (typeof parsed.pvcVisible === 'boolean') setCutPvcVisible(parsed.pvcVisible);
        if (typeof parsed.pvcOffset === 'number') setCutPvcOffset(parsed.pvcOffset);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(DUPLEX_KEY, duplexMode); } catch {}
  }, [duplexMode]);
  useEffect(() => {
    try { localStorage.setItem(OFFSET_KEY, JSON.stringify({ x: offsetX, y: offsetY })); } catch {}
  }, [offsetX, offsetY]);
  useEffect(() => {
    try {
      localStorage.setItem(CUT_KEY, JSON.stringify({
        a4Visible: cutA4Visible, a4Offset: cutA4Offset,
        pvcVisible: cutPvcVisible, pvcOffset: cutPvcOffset,
      }));
    } catch {}
  }, [cutA4Visible, cutA4Offset, cutPvcVisible, cutPvcOffset]);

  // Para impressoras de cartão CR-80 com duplex pela borda curta (padrão Zebra/Evolis),
  // o verso precisa ser rodado 180° para ficar alinhado com a frente após o flip.
  // Long-edge → verso na orientação natural. Simplex → utilizador imprime 2 páginas separadas.
  const backRotation = duplexMode === 'short-edge' ? 180 : 0;

  const { data: activeCard } = useActiveFarmerCard(farmer.id);
  const verificationUrl = activeCard
    ? `${window.location.origin}/verificacao/${activeCard.qr_token}`
    : null;
  const qrPayload = verificationUrl ?? JSON.stringify({
    plataforma: 'SIGAFLO',
    id: farmer.id,
    nome: farmer.name,
    bi: farmer.bi_nif || '',
    provincia: farmer.provinces?.name || '',
    municipio: farmer.municipalities?.name || '',
  });

  const hasBiometry = !!(farmer as any).fingerprint_data;

  const tplCtx: CardTemplateCtx = {
    farmer,
    qrPayload,
    serial: activeCard?.serial ?? farmer.registration_number,
    status: activeCard?.card_status === 'revogado' ? 'revogado'
      : activeCard ? 'activo' : 'inactivo',
    issuedAt: activeCard?.issued_at,
    hasNfc: false,
  };

  const buildPrintHtml = (mode: 'pvc' | 'a4') => {
    const isPvc = mode === 'pvc';
    const qrSrc = qrServiceUrl(qrPayload);
    const barcodeSvg = buildBarcodeSvgString(tplCtx.serial || farmer.id);
    const frontHtml = renderCardFrontHtml(tplCtx, qrSrc);
    const backHtml = renderCardBackHtml(tplCtx, barcodeSvg);

    const cutCss = isPvc
      ? (cutPvcVisible ? `.sigaflo-card{outline:0.3mm dashed #888;outline-offset:${cutPvcOffset}mm;}` : '')
      : (cutA4Visible ? `.sigaflo-card{outline:0.3mm dashed #888;outline-offset:${cutA4Offset}mm;}` : '');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<title>Cartão SIGAFLO — ${farmer.name}</title>
<style>
  @page { size: ${isPvc ? '85.6mm 53.98mm' : 'A4 landscape'}; margin: ${isPvc ? '0' : '12mm'}; }
  html, body { margin:0; padding:0; background: ${isPvc ? 'transparent' : '#f5f5f5'}; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; }
  ${cardCss}
  ${cutCss}
  ${isPvc ? `
    .sigaflo-card { page-break-after: always; break-after: page; }
    .sigaflo-card:last-of-type { page-break-after: auto; break-after: auto; }
    .back-wrap { transform: rotate(${backRotation}deg) translate(${offsetX}mm, ${offsetY}mm); transform-origin: center center; }
  ` : `
    .sheet { display: flex; gap: 14mm; flex-wrap: nowrap; align-items: flex-start; justify-content: center; padding-top: 6mm; }
    .col { display: flex; flex-direction: column; align-items: center; gap: 3mm; }
    .col h2 { font-size: 9pt; color:#26303d; margin: 0; letter-spacing: 1px; text-transform: uppercase; font-family: Inter, sans-serif; }
  `}
</style></head><body>
${isPvc ? `
  ${frontHtml}
  ${duplexMode === 'simplex' ? '' : `<div class="back-wrap">${backHtml}</div>`}
` : `
  <div class="sheet">
    <div class="col"><h2>Frente</h2>${frontHtml}</div>
    <div class="col"><h2>Verso</h2>${backHtml}</div>
  </div>
`}
<script>window.addEventListener('load', () => setTimeout(() => window.print(), 400));</script>
</body></html>`;
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
          if (cutPvcVisible) {
            pdf.setLineDashPattern([1, 1], 0);
            pdf.setDrawColor(150);
            const o = cutPvcOffset;
            pdf.rect(-o, -o, CR80_W + 2 * o, CR80_H + 2 * o);
            pdf.setLineDashPattern([], 0);
          }
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

          if (cutA4Visible) {
            pdf.setLineDashPattern([1, 1], 0);
            pdf.setDrawColor(150);
            const o = cutA4Offset;
            pdf.rect(x - o, startY - o, CR80_W + 2 * o, CR80_H + 2 * o);
          }
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
      {showActions && <CardStatusBar farmer={farmer} />}
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

          {/* Configuração duplex (alinhamento frente/verso) */}
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Modo duplex (alinhamento frente/verso)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { v: 'long-edge', l: 'Borda longa', d: 'Padrão A4 / livro' },
                { v: 'short-edge', l: 'Borda curta', d: 'Cartão PVC (Zebra/Evolis)' },
                { v: 'simplex', l: 'Simplex', d: 'Imprimir só a frente' },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setDuplexMode(o.v)}
                  className={`text-left border rounded-md p-2 transition ${
                    duplexMode === o.v ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                >
                  <div className="text-xs font-semibold">{o.l}</div>
                  <div className="text-[10px] text-muted-foreground">{o.d}</div>
                </button>
              ))}
            </div>
            {duplexMode !== 'simplex' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Ajuste fino X (mm): <span className="font-mono">{offsetX.toFixed(1)}</span>
                  </label>
                  <input
                    type="range" min={-3} max={3} step={0.1}
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Ajuste fino Y (mm): <span className="font-mono">{offsetY.toFixed(1)}</span>
                  </label>
                  <input
                    type="range" min={-3} max={3} step={0.1}
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => { setOffsetX(0); setOffsetY(0); }}
                  className="col-span-2 text-[10px] text-primary hover:underline text-left"
                >
                  Repor calibração
                </button>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              Estas preferências ficam guardadas neste dispositivo. Use a borda curta para impressoras de cartão CR-80.
            </p>
          </div>

          {/* Linhas de corte / sangria */}
          <div className="border-t pt-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Linhas de corte (sangria)
            </p>
            {([
              { key: 'a4', label: 'A4', visible: cutA4Visible, setVisible: setCutA4Visible, offset: cutA4Offset, setOffset: setCutA4Offset },
              { key: 'pvc', label: 'CR-80 (PVC)', visible: cutPvcVisible, setVisible: setCutPvcVisible, offset: cutPvcOffset, setOffset: setCutPvcOffset },
            ] as const).map((cfg) => (
              <div key={cfg.key}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cfg.visible}
                    onChange={(e) => cfg.setVisible(e.target.checked)}
                    id={`cut-${cfg.key}`}
                  />
                  <label htmlFor={`cut-${cfg.key}`} className="text-xs font-medium cursor-pointer">
                    Mostrar guias · {cfg.label}
                  </label>
                </div>
                {cfg.visible && (
                  <div className="mt-1 pl-6">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Offset (mm fora do cartão): <span className="font-mono">{cfg.offset.toFixed(1)}</span>
                    </label>
                    <input
                      type="range" min={0} max={5} step={0.1}
                      value={cfg.offset}
                      onChange={(e) => cfg.setOffset(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground">
              Linhas tracejadas a 0,3mm aplicadas em volta de cada cartão na pré-visualização, impressão e PDF.
            </p>
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

      {previewMode && (
        <PrintPreviewDialog
          open={!!previewMode}
          onOpenChange={(v) => !v && setPreviewMode(null)}
          mode={previewMode}
          buildHtml={buildPrintHtml}
          onPrint={(m) => {
            openPrintWindow(m);
            setPreviewMode(null);
          }}
          onExportPdf={async (m) => {
            await exportPdf(m);
            setPreviewMode(null);
          }}
          exporting={exporting !== null}
        />
      )}
    </div>
  );
};
