import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { offlineDB } from '@/lib/offline/db';

type Status = 'pass' | 'fail' | 'warn' | 'info';

interface CheckResult {
  id: string;
  category: string;
  label: string;
  status: Status;
  detail?: string;
}

function row(
  id: string,
  category: string,
  label: string,
  status: Status,
  detail?: string,
): CheckResult {
  return { id, category, label, status, detail };
}

async function runChecks(): Promise<CheckResult[]> {
  const out: CheckResult[] = [];

  // === Plataforma ===
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  out.push(
    row(
      'platform',
      'Ambiente',
      'Plataforma detetada',
      'info',
      isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop / outro',
    ),
  );
  out.push(
    row(
      'https',
      'Ambiente',
      'HTTPS ou localhost',
      location.protocol === 'https:' || location.hostname === 'localhost' ? 'pass' : 'fail',
      location.protocol,
    ),
  );

  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  out.push(
    row(
      'iframe',
      'Ambiente',
      'Fora de iframe (necessário para SW)',
      inIframe ? 'warn' : 'pass',
      inIframe ? 'Em iframe — SW não registará' : 'OK',
    ),
  );

  // === PWA / Service Worker ===
  out.push(
    row(
      'sw-support',
      'PWA',
      'Service Worker suportado',
      'serviceWorker' in navigator ? 'pass' : 'fail',
    ),
  );

  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      out.push(
        row(
          'sw-active',
          'PWA',
          'Service Worker registado',
          regs.length > 0 ? 'pass' : 'warn',
          regs.length > 0
            ? `${regs.length} registo(s) — scope: ${regs[0].scope}`
            : 'Nenhum (normal em dev/preview)',
        ),
      );
    } catch (e: any) {
      out.push(row('sw-active', 'PWA', 'Service Worker registado', 'fail', e?.message));
    }
  }

  // Manifest
  try {
    const res = await fetch('/manifest.webmanifest');
    if (res.ok) {
      const manifest = await res.json();
      out.push(
        row(
          'manifest',
          'PWA',
          'Manifesto acessível',
          'pass',
          `${manifest.name} • ${manifest.icons?.length ?? 0} ícone(s)`,
        ),
      );
      const has192 = manifest.icons?.some((i: any) => i.sizes?.includes('192'));
      const has512 = manifest.icons?.some((i: any) => i.sizes?.includes('512'));
      out.push(
        row(
          'manifest-icons',
          'PWA',
          'Ícones 192 + 512',
          has192 && has512 ? 'pass' : 'fail',
        ),
      );
    } else {
      out.push(
        row('manifest', 'PWA', 'Manifesto acessível', 'fail', `HTTP ${res.status}`),
      );
    }
  } catch (e: any) {
    out.push(row('manifest', 'PWA', 'Manifesto acessível', 'fail', e?.message));
  }

  // Standalone
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-ignore
    window.navigator.standalone === true;
  out.push(
    row(
      'standalone',
      'PWA',
      'A correr instalado (standalone)',
      standalone ? 'pass' : 'info',
      standalone ? 'Instalado' : 'No browser',
    ),
  );

  // beforeinstallprompt suportado?
  out.push(
    row(
      'install-prompt',
      'PWA',
      'Prompt de instalação',
      isIOS ? 'info' : 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window
        ? 'pass'
        : 'warn',
      isIOS ? 'iOS usa fluxo manual (Partilhar → Adicionar)' : undefined,
    ),
  );

  // === Conectividade ===
  out.push(
    row(
      'online',
      'Conectividade',
      'Estado da rede',
      navigator.onLine ? 'pass' : 'warn',
      navigator.onLine ? 'Online' : 'Offline',
    ),
  );

  // === Storage ===
  out.push(row('localstorage', 'Storage', 'localStorage', typeof localStorage !== 'undefined' ? 'pass' : 'fail'));
  out.push(row('indexeddb', 'Storage', 'IndexedDB', typeof indexedDB !== 'undefined' ? 'pass' : 'fail'));

  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const est = await navigator.storage.estimate();
      const usedMB = ((est.usage ?? 0) / 1024 / 1024).toFixed(1);
      const quotaMB = ((est.quota ?? 0) / 1024 / 1024).toFixed(0);
      out.push(
        row(
          'storage-quota',
          'Storage',
          'Quota disponível',
          'info',
          `${usedMB} MB usados / ${quotaMB} MB total`,
        ),
      );
    } catch {}
  }

  // === Permissões nativas ===
  out.push(
    row(
      'getusermedia',
      'Permissões',
      'getUserMedia (câmara web)',
      navigator.mediaDevices?.getUserMedia ? 'pass' : 'warn',
      navigator.mediaDevices?.getUserMedia ? 'Disponível' : 'Não disponível (use Capacitor)',
    ),
  );
  out.push(
    row(
      'geolocation',
      'Permissões',
      'Geolocalização',
      'geolocation' in navigator ? 'pass' : 'fail',
    ),
  );
  if ('permissions' in navigator) {
    try {
      const cam = await navigator.permissions.query({ name: 'camera' as PermissionName });
      out.push(row('perm-camera', 'Permissões', 'Permissão de câmara', cam.state === 'granted' ? 'pass' : 'info', cam.state));
    } catch {}
  }

  // === Fila offline ===
  try {
    const pending = await offlineDB.mutationQueue.count();
    const conflicts = await offlineDB.conflicts.count();
    out.push(
      row(
        'queue',
        'Sync',
        'Fila de mutações',
        pending === 0 ? 'pass' : 'info',
        `${pending} pendente(s) • ${conflicts} conflito(s)`,
      ),
    );
  } catch (e: any) {
    out.push(row('queue', 'Sync', 'Fila de mutações', 'fail', e?.message));
  }

  // === Auth Supabase ===
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    out.push(
      row(
        'supabase-url',
        'Backend',
        'URL do backend',
        url ? 'pass' : 'fail',
        url ? new URL(url).host : 'Não configurada',
      ),
    );
  } catch {
    out.push(row('supabase-url', 'Backend', 'URL do backend', 'fail'));
  }

  return out;
}

const ICON: Record<Status, JSX.Element> = {
  pass: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  fail: <XCircle className="h-4 w-4 text-destructive" />,
  warn: <AlertCircle className="h-4 w-4 text-amber-500" />,
  info: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
};

const BADGE: Record<Status, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  pass: 'default',
  fail: 'destructive',
  warn: 'secondary',
  info: 'outline',
};

const LABEL: Record<Status, string> = {
  pass: 'OK',
  fail: 'FALHA',
  warn: 'AVISO',
  info: 'INFO',
};

export default function DiagnosticPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setResults(await runChecks());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const grouped = results.reduce<Record<string, CheckResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const summary = {
    pass: results.filter((r) => r.status === 'pass').length,
    fail: results.filter((r) => r.status === 'fail').length,
    warn: results.filter((r) => r.status === 'warn').length,
    info: results.filter((r) => r.status === 'info').length,
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: location.href,
      summary,
      results,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sigaflo-diagnostico-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Diagnóstico do Dispositivo</h1>
          <p className="text-sm text-muted-foreground">
            Verifica os requisitos PWA, offline e permissões neste dispositivo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Reexecutar
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-emerald-500">{summary.pass}</p><p className="text-xs text-muted-foreground">OK</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-amber-500">{summary.warn}</p><p className="text-xs text-muted-foreground">Avisos</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-destructive">{summary.fail}</p><p className="text-xs text-muted-foreground">Falhas</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-muted-foreground">{summary.info}</p><p className="text-xs text-muted-foreground">Info</p></CardContent></Card>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="text-base">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((r) => (
              <div key={r.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                <div className="pt-0.5">{ICON[r.status]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{r.label}</p>
                    <Badge variant={BADGE[r.status]} className="text-xs">{LABEL[r.status]}</Badge>
                  </div>
                  {r.detail && <p className="text-xs text-muted-foreground mt-0.5 break-all">{r.detail}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-center text-muted-foreground pt-4">
        Para o checklist completo de QA pré-lançamento, consulte{' '}
        <code className="px-1 py-0.5 rounded bg-muted">docs/QA_PWA_CHECKLIST.md</code>.
      </p>
    </div>
  );
}
