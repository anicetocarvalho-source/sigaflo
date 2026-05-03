import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FarmerCard } from '@/components/farmers/FarmerCard';
import { Printer, FileDown, FlaskConical, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Farmer } from '@/hooks/useFarmers';

/**
 * Página de teste de renderização — gera amostras de cartões CR-80 e A4
 * para validar comportamento de quebras de página em Chrome / Firefox / Safari.
 *
 * Rota: /dev/print-test (sem autenticação para facilitar testes em devices).
 */

const SAMPLE_FARMERS: Partial<Farmer>[] = [
  {
    id: 'sample-1',
    name: 'JOÃO MANUEL DA SILVA',
    bi_nif: '004567890LA042',
    phone: '+244 923 456 789',
    registration_number: 'AGR-2026-001234',
    farmer_type: 'individual',
    status: 'approved',
    total_area_ha: 12.4,
    photo_url: '',
    provinces: { name: 'Huambo' } as any,
    municipalities: { name: 'Caála' } as any,
  },
  {
    id: 'sample-2',
    name: 'COOPERATIVA AGRÍCOLA DO PLANALTO CENTRAL — UNIDADE BAILUNDO',
    bi_nif: '5417000123',
    phone: '+244 944 111 222',
    registration_number: 'COOP-2026-000045',
    farmer_type: 'cooperative',
    status: 'issued',
    total_area_ha: 234.8,
    photo_url: '',
    provinces: { name: 'Huambo' } as any,
    municipalities: { name: 'Bailundo' } as any,
  },
  {
    id: 'sample-3',
    name: 'MARIA DE FÁTIMA ANTÓNIO',
    bi_nif: '009988776HU051',
    phone: '+244 912 000 555',
    registration_number: 'AGR-2026-007788',
    farmer_type: 'family',
    status: 'submitted',
    total_area_ha: 3.2,
    photo_url: '',
    provinces: { name: 'Bié' } as any,
    municipalities: { name: 'Kuito' } as any,
  },
];

const detectBrowser = () => {
  if (typeof navigator === 'undefined') return 'desconhecido';
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari';
  return 'Outro';
};

const CHECKLIST = [
  { id: 'pvc-pages', label: 'PVC: gera exactamente 2 páginas (frente · verso), sem 3.ª página em branco' },
  { id: 'pvc-size', label: 'PVC: cada página mede 85,6 × 53,98 mm na pré-visualização da impressora' },
  { id: 'pvc-bleed', label: 'PVC: arte chega às bordas (sem margens brancas residuais)' },
  { id: 'a4-single', label: 'A4: 1 única página em paisagem com frente e verso lado-a-lado' },
  { id: 'a4-guides', label: 'A4: guias de corte tracejadas visíveis e centradas' },
  { id: 'colors', label: 'Cores e gradientes (verso dourado/verde) impressos com fidelidade' },
  { id: 'fonts', label: 'Fontes nítidas, sem caracteres em falta (especialmente acentos PT)' },
  { id: 'qr', label: 'QR code legível com leitor de telemóvel após impressão' },
];

export default function PrintTestPage() {
  const browser = useMemo(detectBrowser, []);
  const [results, setResults] = useState<Record<string, 'ok' | 'fail' | null>>(
    Object.fromEntries(CHECKLIST.map((c) => [c.id, null])),
  );
  const [notes, setNotes] = useState('');

  const buildReport = () => {
    const date = new Date().toLocaleString('pt-PT');
    const ua = navigator.userAgent;
    const lines = [
      `# Relatório de teste de impressão — SIGAFLO`,
      ``,
      `- **Data:** ${date}`,
      `- **Browser:** ${browser}`,
      `- **User-Agent:** ${ua}`,
      `- **Viewport:** ${window.innerWidth}×${window.innerHeight}`,
      `- **devicePixelRatio:** ${window.devicePixelRatio}`,
      ``,
      `## Checklist`,
      ...CHECKLIST.map((c) => {
        const r = results[c.id];
        const mark = r === 'ok' ? '✅' : r === 'fail' ? '❌' : '⚪';
        return `- ${mark} ${c.label}`;
      }),
      ``,
      `## Notas / diferenças observadas`,
      notes || '_(sem notas)_',
    ];
    return lines.join('\n');
  };

  const downloadReport = () => {
    const blob = new Blob([buildReport()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `print-test-${browser.toLowerCase()}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(buildReport());
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Modo de teste de renderização</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gera cartões de exemplo para validar quebras de página, margens e fidelidade visual em
            Chrome, Firefox e Safari. Use os relatórios para comparar diferenças entre browsers.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Browser actual: <strong className="ml-1">{browser}</strong>
        </Badge>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Como testar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ol className="list-decimal pl-5 space-y-1">
            <li>Abra esta página em <strong>Chrome</strong>, <strong>Firefox</strong> e <strong>Safari</strong> (e Edge, se aplicável).</li>
            <li>Para cada cartão de amostra, clique em <em>Pré-visualizar</em> nos formatos PVC e A4.</li>
            <li>Use <kbd>Ctrl/Cmd + P</kbd> para abrir o diálogo de impressão e verifique a contagem de páginas.</li>
            <li>Marque os itens da checklist abaixo e exporte o relatório.</li>
          </ol>
        </CardContent>
      </Card>

      {/* Sample cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {SAMPLE_FARMERS.map((f, idx) => (
          <Card key={f.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Amostra {idx + 1}</CardTitle>
              <CardDescription>
                {f.farmer_type === 'cooperative' ? 'Nome longo (teste de truncagem)' :
                 f.farmer_type === 'family' ? 'Estado: Submetido (overlay)' :
                 'Caso típico aprovado'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FarmerCard farmer={f as Farmer} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de validação</CardTitle>
          <CardDescription>
            Marque cada item após inspeccionar a pré-visualização do browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {CHECKLIST.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 border rounded-md p-2">
              <span className="text-sm flex-1">{c.label}</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={results[c.id] === 'ok' ? 'default' : 'outline'}
                  onClick={() => setResults((r) => ({ ...r, [c.id]: 'ok' }))}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> OK
                </Button>
                <Button
                  size="sm"
                  variant={results[c.id] === 'fail' ? 'destructive' : 'outline'}
                  onClick={() => setResults((r) => ({ ...r, [c.id]: 'fail' }))}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Falha
                </Button>
              </div>
            </div>
          ))}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Notas / diferenças</label>
            <textarea
              className="w-full border rounded-md p-2 text-sm min-h-[100px] mt-1"
              placeholder="Ex.: Safari adiciona 3.ª página em branco no modo PVC; Firefox renderiza gradiente com banding..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={downloadReport}>
              <FileDown className="h-4 w-4 mr-2" />
              Descarregar relatório (.md)
            </Button>
            <Button variant="outline" onClick={copyReport}>
              Copiar para clipboard
            </Button>
            <Button variant="ghost" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir esta página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
