import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_BATCH_OPTIONS,
  exportCardBatch,
  type BatchExportOptions,
  type BatchProgress,
} from '@/lib/cardBatchExport';
import type { Farmer } from '@/hooks/useFarmers';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  farmers: Farmer[];
  cardsMap: Record<string, { serial?: string; qr_token?: string }>;
}

export default function CardBatchExportDialog({ open, onOpenChange, farmers, cardsMap }: Props) {
  const [opts, setOpts] = useState<BatchExportOptions>({
    ...DEFAULT_BATCH_OPTIONS,
    batchName: `lote-cartoes-${new Date().toISOString().slice(0, 10)}`,
  });
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [exporting, setExporting] = useState(false);

  const update = <K extends keyof BatchExportOptions>(k: K, v: BatchExportOptions[K]) =>
    setOpts((o) => ({ ...o, [k]: v }));

  const handleExport = async () => {
    if (!opts.batchName.trim()) { toast.error('Indique o nome do lote'); return; }
    setExporting(true);
    setProgress({ processed: 0, total: farmers.length, phase: 'rendering' });
    try {
      const r = await exportCardBatch(farmers, cardsMap, opts, setProgress);
      toast.success(`${r.filename} (${(r.size / 1024).toFixed(1)} KB)`);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha na exportação');
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const pct = progress ? Math.round((progress.processed / Math.max(1, progress.total)) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !exporting && onOpenChange(v)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar lote de cartões</DialogTitle>
          <DialogDescription>
            {farmers.length} cartão(ões) selecionado(s). Configure formato, embalagem e guias de corte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Nome do lote</Label>
            <Input value={opts.batchName} onChange={(e) => update('batchName', e.target.value)}
                   placeholder="lote-cartoes-2026-05-03" />
            <p className="text-xs text-muted-foreground">Usado no nome do ficheiro e no manifest do ZIP.</p>
          </div>

          <div className="space-y-2">
            <Label>Formato de impressão</Label>
            <RadioGroup value={opts.format} onValueChange={(v) => update('format', v as any)}>
              <div className="flex items-start gap-2 border rounded-md p-3">
                <RadioGroupItem value="a4_grid" id="f-a4" className="mt-1" />
                <Label htmlFor="f-a4" className="font-normal flex-1 cursor-pointer">
                  <div className="font-medium">A4 paisagem · grelha</div>
                  <div className="text-xs text-muted-foreground">Múltiplos cartões por folha A4 com guias de corte.</div>
                </Label>
              </div>
              <div className="flex items-start gap-2 border rounded-md p-3">
                <RadioGroupItem value="cr80_individual" id="f-cr80" className="mt-1" />
                <Label htmlFor="f-cr80" className="font-normal flex-1 cursor-pointer">
                  <div className="font-medium">CR-80 · um por página</div>
                  <div className="text-xs text-muted-foreground">85.6×53.98 mm + sangria. Ideal para impressoras de cartão.</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {opts.format === 'a4_grid' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Colunas</Label>
                <Input type="number" min={2} max={3} value={opts.cardsPerRowA4}
                       onChange={(e) => update('cardsPerRowA4', Math.min(3, Math.max(2, Number(e.target.value))))} />
              </div>
              <div className="space-y-2">
                <Label>Linhas</Label>
                <Input type="number" min={2} max={3} value={opts.cardsPerColA4}
                       onChange={(e) => update('cardsPerColA4', Math.min(3, Math.max(2, Number(e.target.value))))} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Empacotamento</Label>
            <RadioGroup value={opts.packaging} onValueChange={(v) => update('packaging', v as any)}>
              <div className="flex items-start gap-2 border rounded-md p-3">
                <RadioGroupItem value="single_pdf" id="p-pdf" className="mt-1" />
                <Label htmlFor="p-pdf" className="font-normal flex-1 cursor-pointer">PDF único</Label>
              </div>
              <div className="flex items-start gap-2 border rounded-md p-3">
                <RadioGroupItem value="zip_per_card" id="p-card" className="mt-1" />
                <Label htmlFor="p-card" className="font-normal flex-1 cursor-pointer">
                  ZIP · um PDF por agricultor
                  <div className="text-xs text-muted-foreground">Nome do ficheiro = nº de registo.</div>
                </Label>
              </div>
              <div className="flex items-start gap-2 border rounded-md p-3">
                <RadioGroupItem value="zip_per_province" id="p-prov" className="mt-1" />
                <Label htmlFor="p-prov" className="font-normal flex-1 cursor-pointer">
                  ZIP · um PDF A4 por província
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Guias de corte</Label>
                <p className="text-xs text-muted-foreground">Marcas nos cantos para alinhar guilhotina.</p>
              </div>
              <Switch checked={opts.showCutGuides} onCheckedChange={(v) => update('showCutGuides', v)} />
            </div>
            {opts.showCutGuides && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Offset {opts.cutGuideOffsetMm} mm</Label>
                  <Slider min={0} max={5} step={0.5} value={[opts.cutGuideOffsetMm]}
                          onValueChange={([v]) => update('cutGuideOffsetMm', v)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Comprimento {opts.cutGuideLengthMm} mm</Label>
                  <Slider min={2} max={10} step={0.5} value={[opts.cutGuideLengthMm]}
                          onValueChange={([v]) => update('cutGuideLengthMm', v)} />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Incluir verso</Label>
                <p className="text-xs text-muted-foreground">Páginas adicionais com o verso de cada cartão.</p>
              </div>
              <Switch checked={opts.includeBack} onCheckedChange={(v) => update('includeBack', v)} />
            </div>
          </div>

          {progress && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.phase === 'packaging' ? 'A empacotar...' : 'A renderizar cartões...'}</span>
                <span>{progress.processed}/{progress.total}</span>
              </div>
              <Progress value={pct} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>Cancelar</Button>
          <Button onClick={handleExport} disabled={exporting || farmers.length === 0}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Exportar {farmers.length} cartão(ões)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
