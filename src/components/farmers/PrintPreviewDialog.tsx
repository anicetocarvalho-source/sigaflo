import { ReactNode, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ZoomIn, ZoomOut, Maximize2, Printer, FileDown, Loader2 } from 'lucide-react';

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: 'pvc' | 'a4';
  /** HTML do documento de impressão (sem o script auto-print) */
  buildHtml: (mode: 'pvc' | 'a4') => string;
  onPrint: (mode: 'pvc' | 'a4') => void;
  onExportPdf: (mode: 'pvc' | 'a4') => Promise<void> | void;
  exporting?: boolean;
  /** Controles ao vivo (calibração / guias de corte) renderizados ao lado da pré-visualização */
  liveControls?: ReactNode;
  /**
   * Chave que muda sempre que os parâmetros de calibração/guias mudam,
   * para forçar re-render do iframe de pré-visualização.
   */
  controlsKey?: string | number;
}

// Page sizes in mm
const PAGE_SIZES = {
  pvc: { w: 85.6, h: 53.98, margin: 0, label: 'CR-80 · 85,6 × 53,98 mm' },
  a4: { w: 297, h: 210, margin: 12, label: 'A4 paisagem · 297 × 210 mm' },
} as const;

// CR-80 safe area (ISO/IEC 7810): 3 mm bleed inside
const SAFE_INSET_MM = { pvc: 3, a4: 3 };

const MM_TO_PX_BASE = 4; // 1mm = 4px at zoom 1

export const PrintPreviewDialog = ({
  open,
  onOpenChange,
  mode,
  buildHtml,
  onPrint,
  onExportPdf,
  exporting,
  liveControls,
  controlsKey,
}: PrintPreviewDialogProps) => {
  const [zoom, setZoom] = useState(mode === 'pvc' ? 2.5 : 1);
  const [showMargins, setShowMargins] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showCutGuides, setShowCutGuides] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const page = PAGE_SIZES[mode];
  const pxPerMm = MM_TO_PX_BASE * zoom;

  // For PVC we render two pages stacked; for A4 a single page.
  const pages = mode === 'pvc' ? [{ side: 'Frente' }, { side: 'Verso' }] : [{ side: 'A4' }];

  useEffect(() => {
    setZoom(mode === 'pvc' ? 2.5 : 1);
  }, [mode, open]);

  useEffect(() => {
    if (!open) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const html = buildHtml(mode).replace(/<script[\s\S]*?<\/script>/g, '');
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [open, mode, buildHtml, controlsKey]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={liveControls ? 'max-w-6xl' : 'max-w-5xl'}>
        <DialogHeader>
          <DialogTitle>Pré-visualização da impressão</DialogTitle>
          <DialogDescription>
            {page.label} · margens {page.margin}mm · ajustes aplicam-se em tempo real à pré-visualização e ao PDF.
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border rounded-md p-2 bg-muted/30">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.min(5, z + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={() => setZoom(mode === 'pvc' ? 2.5 : 1)} title="Repor zoom">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Switch id="margins" checked={showMargins} onCheckedChange={setShowMargins} />
            <Label htmlFor="margins" className="text-xs cursor-pointer">Margens</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="safe" checked={showSafeArea} onCheckedChange={setShowSafeArea} />
            <Label htmlFor="safe" className="text-xs cursor-pointer">Área segura</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="cut" checked={showCutGuides} onCheckedChange={setShowCutGuides} />
            <Label htmlFor="cut" className="text-xs cursor-pointer">Guias de corte</Label>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            {mode === 'pvc' ? '2 páginas (frente · verso)' : '1 página A4'}
          </div>
        </div>

        {/* Hidden iframe used to render true HTML for screenshot via foreignObject */}
        <iframe
          ref={iframeRef}
          title="print-source"
          style={{ position: 'absolute', left: -10000, top: 0, width: '320mm', height: '220mm', border: 0 }}
          aria-hidden
        />

        {/* Preview canvas */}
        <div
          className="relative overflow-auto bg-[hsl(var(--muted))] rounded-md border"
          style={{ maxHeight: '60vh' }}
        >
          <div className="flex flex-col items-center gap-6 p-6 min-w-fit">
            {pages.map((p, idx) => {
              const pageW = page.w * pxPerMm;
              const pageH = page.h * pxPerMm;
              const marginPx = page.margin * pxPerMm;
              const safePx = SAFE_INSET_MM[mode] * pxPerMm;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {p.side} · {page.w}×{page.h} mm
                  </span>
                  <div
                    className="relative shadow-lg bg-white"
                    style={{ width: pageW, height: pageH }}
                  >
                    {/* Rendered content via iframe clone (iframe acts as reference; we re-render via srcdoc per page) */}
                    <PagePreview
                      buildHtml={buildHtml}
                      mode={mode}
                      pageIndex={idx}
                      width={pageW}
                      height={pageH}
                    />

                    {/* Margins overlay */}
                    {showMargins && page.margin > 0 && (
                      <div
                        className="absolute pointer-events-none border border-dashed"
                        style={{
                          inset: marginPx,
                          borderColor: 'hsl(var(--primary) / 0.6)',
                        }}
                      >
                        <span className="absolute -top-4 left-0 text-[9px] font-mono text-primary">
                          margem {page.margin}mm
                        </span>
                      </div>
                    )}

                    {/* Safe area overlay (CR-80 / dentro do cartão) */}
                    {showSafeArea && (
                      <div
                        className="absolute pointer-events-none border border-dotted"
                        style={{
                          inset: marginPx + safePx,
                          borderColor: 'hsl(142 70% 35% / 0.7)',
                        }}
                      >
                        <span
                          className="absolute -bottom-4 right-0 text-[9px] font-mono"
                          style={{ color: 'hsl(142 70% 25%)' }}
                        >
                          área segura ({SAFE_INSET_MM[mode]}mm)
                        </span>
                      </div>
                    )}

                    {/* Cut guides — corner crops */}
                    {showCutGuides && (
                      <>
                        {[
                          { top: 0, left: 0 },
                          { top: 0, right: 0 },
                          { bottom: 0, left: 0 },
                          { bottom: 0, right: 0 },
                        ].map((pos, i) => (
                          <div
                            key={i}
                            className="absolute pointer-events-none"
                            style={{
                              ...pos,
                              width: 14,
                              height: 14,
                              borderTop: pos.top !== undefined ? '1px solid hsl(0 0% 30%)' : undefined,
                              borderBottom: pos.bottom !== undefined ? '1px solid hsl(0 0% 30%)' : undefined,
                              borderLeft: pos.left !== undefined ? '1px solid hsl(0 0% 30%)' : undefined,
                              borderRight: pos.right !== undefined ? '1px solid hsl(0 0% 30%)' : undefined,
                            }}
                          />
                        ))}
                      </>
                    )}

                    {/* Ruler labels */}
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground">
                      {page.w} mm
                    </span>
                    <span
                      className="absolute -left-10 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground"
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      {page.h} mm
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={() => onPrint(mode)} disabled={exporting}>
            <Printer className="h-4 w-4 mr-2" />
            Abrir janela de impressão
          </Button>
          <Button onClick={() => onExportPdf(mode)} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
            Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Renders a single page from the print HTML inside an isolated iframe (srcdoc).
// We wrap the original HTML and scale-position to show only the requested page.
const PagePreview = ({
  buildHtml,
  mode,
  pageIndex,
  width,
  height,
}: {
  buildHtml: (m: 'pvc' | 'a4') => string;
  mode: 'pvc' | 'a4';
  pageIndex: number;
  width: number;
  height: number;
}) => {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    const baseHtml = buildHtml(mode).replace(/<script[\s\S]*?<\/script>/g, '');
    // Add an outer wrapper that selects which .card to show (PVC: front/back).
    const css = mode === 'pvc'
      ? `<style>
           html,body{background:transparent !important;}
           .sheet{display:block !important;}
           .card{display:none !important;}
           .card:nth-of-type(${pageIndex + 1}){display:block !important;}
         </style>`
      : `<style>html,body{background:transparent !important;}</style>`;
    const html = baseHtml.replace('</head>', `${css}</head>`);
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [buildHtml, mode, pageIndex]);

  // Scale: page is width x height px which equals page.w mm * pxPerMm.
  // The iframe's body content is in mm; we set iframe size in mm and then scale via CSS.
  // Easier: size iframe to natural mm (using mm as length) and scale via transform.
  const naturalW = mode === 'pvc' ? 85.6 : 297; // mm
  const naturalH = mode === 'pvc' ? 53.98 : 210; // mm
  const scale = width / (naturalW * 3.7795275591); // mm -> px (CSS)

  return (
    <iframe
      ref={ref}
      title={`page-${pageIndex}`}
      style={{
        width: `${naturalW}mm`,
        height: `${naturalH}mm`,
        border: 0,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'white',
      }}
    />
  );
};
