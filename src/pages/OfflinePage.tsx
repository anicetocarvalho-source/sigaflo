import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { WifiOff, RefreshCw, CloudUpload, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { offlineDB, type QueuedMutation } from '@/lib/offline/db';

const OFFLINE_ROUTES = [
  { path: '/', label: 'Início', desc: 'Painel principal (cache local)' },
  { path: '/agricultores', label: 'Agricultores', desc: 'Lista cacheada e novos cadastros' },
  { path: '/agricultores/novo', label: 'Novo agricultor', desc: 'Formulário com fila offline' },
  { path: '/cadastro-campo', label: 'Cadastro de campo', desc: '7 passos com persistência local' },
  { path: '/ocorrencias', label: 'Ocorrências', desc: 'Registo offline de ocorrências' },
  { path: '/sincronizacao', label: 'Sincronização', desc: 'Estado da fila e conflitos' },
];

export default function OfflinePage() {
  const [online, setOnline] = useState(navigator.onLine);

  const pending = useLiveQuery(
    () => offlineDB.mutationQueue.toArray(),
    [],
  ) as QueuedMutation[] | undefined;

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div className="container max-w-3xl py-10 space-y-6">
      <div className="text-center space-y-3">
        <div
          className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${
            online ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
          }`}
        >
          <WifiOff className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold">
          {online ? 'Está novamente online' : 'Sem ligação à internet'}
        </h1>
        <p className="text-muted-foreground">
          {online
            ? 'A ligação foi restabelecida. Pode continuar a navegar normalmente.'
            : 'Esta página foi servida do dispositivo. Pode continuar a usar o SIGAFLO offline.'}
        </p>
      </div>

      {(pending?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CloudUpload className="h-4 w-4 text-primary" />
              Fila de sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {pending!.length} alteração(ões) à espera de envio
              </span>
              <Badge variant="secondary">{pending!.length}</Badge>
            </div>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link to="/sincronizacao">
                Ver detalhes <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disponível offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {OFFLINE_ROUTES.map((r) => (
            <Link
              key={r.path}
              to={r.path}
              className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Ir para o início
          </Link>
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Cadastros e edições feitos offline são guardados no dispositivo e sincronizados
        automaticamente quando a ligação for restabelecida.
      </p>
    </div>
  );
}
