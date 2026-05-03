import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Printer,
  RotateCcw,
  Ruler,
  AlertTriangle,
} from 'lucide-react';
import jsPDF from 'jspdf';

export type DuplexMode = 'long-edge' | 'short-edge' | 'simplex';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  duplexMode: DuplexMode;
  setDuplexMode: (m: DuplexMode) => void;
  offsetX: number;
  setOffsetX: (v: number) => void;
  offsetY: number;
  setOffsetY: (v: number) => void;
  /** Continua para o fluxo real de impressão após confirmação. */
  onConfirmed: () => void;
}

/**
 * Página de teste de alinhamento (CR-80) com cruzes de registo:
 * - Frente: cruz no canto superior-esquerdo + marcas a 5/10/15 mm
 * - Verso: cruz espelhada para validar deslocamento ao virar o cartão.
 *
 * O utilizador imprime esta página em duplex, mede o deslocamento das cruzes
 * e introduz os valores em X/Y na próxima etapa.
 */
function buildTestPagePdf(mode: DuplexMode): Blob {
  const W = 85.6;
  const H = 53.98;
  const pdf = new jsPDF({ unit: 'mm', format: [W, H], orientation: 'landscape' });

  const drawCross = (x: number, y: number, size = 6, color = 0) => {
    pdf.setDrawColor(color);
    pdf.setLineWidth(0.2);
    pdf.line(x - size / 2, y, x + size / 2, y);
    pdf.line(x, y - size / 2, x, y + size / 2);
    pdf.circle(x, y, size / 4);
  };

  const drawRulers = () => {
    pdf.setFontSize(5);
    pdf.setTextColor(120);
    for (let mm = 0; mm <= 30; mm += 5) {
      pdf.line(mm, 0, mm, mm % 10 === 0 ? 2 : 1);
      pdf.line(0, mm, mm % 10 === 0 ? 2 : 1, mm);
      if (mm > 0 && mm % 10 === 0) {
        pdf.text(`${mm}`, mm, 4);
        pdf.text(`${mm}`, 3, mm);
      }
    }
  };

  // Frente
  pdf.setFontSize(7);
  pdf.setTextColor(50);
  pdf.text('SIGAFLO · TESTE DE ALINHAMENTO · FRENTE', W / 2, H / 2 - 2, { align: 'center' });
  pdf.setFontSize(6);
  pdf.text(
    mode === 'short-edge' ? 'Duplex: borda curta (PVC)' : mode === 'long-edge' ? 'Duplex: borda longa (A4)' : 'Simplex',
    W / 2,
    H / 2 + 3,
    { align: 'center' }
  );
  drawCross(10, 10);
  drawCross(W - 10, H - 10);
  drawRulers();

  // Verso
  pdf.addPage([W, H], 'landscape');
  pdf.setFontSize(7);
  pdf.setTextColor(50);
  pdf.text('SIGAFLO · TESTE DE ALINHAMENTO · VERSO', W / 2, H / 2 - 2, { align: 'center' });
  // Cruzes espelhadas em relação à frente: se o duplex estiver bem calibrado,
  // ao colocar contraluz a cruz da frente coincide com a do verso.
  drawCross(W - 10, 10);
  drawCross(10, H - 10);
  drawRulers();

  return pdf.output('blob');
}

const STEPS: Array<{ title: string; icon: typeof Check }> = [
  { title: 'Modo duplex', icon: RotateCcw },
  { title: 'Imprimir teste', icon: Printer },
  { title: 'Medir desvio', icon: Ruler },
  { title: 'Confirmar', icon: CheckCircle2 },
];

export const DuplexAlignmentWizard = ({
  open,
  onOpenChange,
  duplexMode,
  setDuplexMode,
  offsetX,
  setOffsetX,
  offsetY,
  setOffsetY,
  onConfirmed,
}: Props) => {
  const [step, setStep] = useState(0);
  const [printed, setPrinted] = useState(false);
  const [measuredOk, setMeasuredOk] = useState(false);

  const reset = () => {
    setStep(0);
    setPrinted(false);
    setMeasuredOk(false);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  const downloadTestPage = () => {
    const blob = buildTestPagePdf(duplexMode);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sigaflo-teste-alinhamento-${duplexMode}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setPrinted(true);
  };

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const canAdvance = useMemo(() => {
    if (step === 1) return printed || duplexMode === 'simplex';
    if (step === 2) return measuredOk;
    return true;
  }, [step, printed, measuredOk, duplexMode]);

  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : close())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verificação de alinhamento duplex</DialogTitle>
          <DialogDescription>
            Garanta que a frente e o verso ficam perfeitamente alinhados antes de imprimir o lote final.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="space-y-2">
          <Progress value={pct} className="h-1.5" />
          <div className="grid grid-cols-4 gap-1 text-[10px]">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <div
                  key={s.title}
                  className={`flex items-center gap-1.5 px-1.5 py-1 rounded ${
                    active ? 'bg-primary/10 text-primary font-semibold' : done ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border rounded-md p-4 min-h-[260px] bg-muted/20">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm">
                Selecione como a sua impressora vira a folha/cartão. Esta escolha define a rotação aplicada ao verso.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {([
                  { v: 'long-edge', l: 'Borda longa', d: 'Padrão A4 / impressora doméstica' },
                  { v: 'short-edge', l: 'Borda curta', d: 'Cartão PVC (Zebra/Evolis/Fargo)' },
                  { v: 'simplex', l: 'Simplex', d: 'Imprimir só frente, verso à parte' },
                ] as const).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setDuplexMode(o.v)}
                    className={`text-left border rounded-md p-3 transition ${
                      duplexMode === o.v ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1 flex items-center justify-between">
                      {o.l}
                      {duplexMode === o.v && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{o.d}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background border rounded p-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-600" />
                Não tem a certeza? A maioria das impressoras de cartão CR-80 usa <strong className="mx-1">borda curta</strong>.
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm">
                Imprima a página de teste e siga as instruções da sua impressora para duplex em modo
                <Badge variant="outline" className="mx-1">{duplexMode}</Badge>.
              </p>
              <ol className="text-xs space-y-1.5 list-decimal list-inside text-muted-foreground">
                <li>Descarregue o PDF de teste (2 páginas, com cruzes de registo).</li>
                <li>Imprima nas configurações de duplex que vai usar para os cartões reais.</li>
                <li>Coloque a folha contra a luz: as cruzes da frente devem coincidir com as do verso.</li>
              </ol>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button onClick={downloadTestPage} size="sm">
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  Descarregar página de teste
                </Button>
                {printed && (
                  <Badge variant="secondary" className="gap-1">
                    <Check className="h-3 w-3" /> Página gerada
                  </Badge>
                )}
              </div>
              {duplexMode === 'simplex' && (
                <p className="text-xs text-amber-700">
                  Em modo simplex não é necessário alinhamento — pode avançar diretamente.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm">
                Meça o desvio entre as cruzes da frente e do verso (com régua, em milímetros) e introduza abaixo.
                Valores positivos movem o verso para a direita / para baixo.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Desvio horizontal (X): <span className="font-mono">{offsetX.toFixed(1)} mm</span>
                  </label>
                  <input
                    type="range"
                    min={-3}
                    max={3}
                    step={0.1}
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Desvio vertical (Y): <span className="font-mono">{offsetY.toFixed(1)} mm</span>
                  </label>
                  <input
                    type="range"
                    min={-3}
                    max={3}
                    step={0.1}
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => { setOffsetX(0); setOffsetY(0); }}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Repor
                </Button>
                <Button variant="outline" size="sm" onClick={downloadTestPage}>
                  <Printer className="h-3.5 w-3.5 mr-1.5" /> Reimprimir teste
                </Button>
                <label className="flex items-center gap-1.5 text-xs ml-auto cursor-pointer">
                  <input
                    type="checkbox"
                    checked={measuredOk}
                    onChange={(e) => setMeasuredOk(e.target.checked)}
                  />
                  As cruzes coincidem (≤ 0,5 mm)
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-semibold">Pronto para imprimir os cartões</span>
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Modo duplex: <strong className="text-foreground">{duplexMode}</strong></li>
                <li>• Calibração X: <strong className="text-foreground">{offsetX.toFixed(1)} mm</strong></li>
                <li>• Calibração Y: <strong className="text-foreground">{offsetY.toFixed(1)} mm</strong></li>
              </ul>
              <p className="text-xs text-muted-foreground">
                As preferências ficam guardadas neste dispositivo. Pode rever este assistente a qualquer momento
                a partir do separador <em>Calibração</em>.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Anterior
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={close}>Cancelar</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={!canAdvance}>
                Seguinte <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button onClick={() => { onConfirmed(); close(); }}>
                <Check className="h-4 w-4 mr-1.5" /> Confirmar e continuar
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplexAlignmentWizard;
