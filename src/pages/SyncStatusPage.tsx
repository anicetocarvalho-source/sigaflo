import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  CloudUpload,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { offlineDB, type QueuedMutation, type PendingConflict } from '@/lib/offline/db';
import {
  syncNow,
  subscribeSync,
  isSyncing,
  resolveParkedConflict,
} from '@/lib/offline/syncEngine';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const opLabel: Record<QueuedMutation['operation'], string> = {
  insert: 'Criar',
  update: 'Atualizar',
  delete: 'Eliminar',
};

const opVariant: Record<
  QueuedMutation['operation'],
  'default' | 'secondary' | 'destructive'
> = {
  insert: 'default',
  update: 'secondary',
  delete: 'destructive',
};

export default function SyncStatusPage() {
  const [online, setOnline] = useState(navigator.onLine);
  const [, force] = useState(0);
  const [initialPending, setInitialPending] = useState<number | null>(null);

  const pending = useLiveQuery(
    () => offlineDB.mutationQueue.orderBy('createdAt').toArray(),
    [],
  ) as QueuedMutation[] | undefined;
  const conflicts = useLiveQuery(
    () => offlineDB.conflicts.orderBy('detectedAt').reverse().toArray(),
    [],
  ) as PendingConflict[] | undefined;

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    const unsub = subscribeSync(() => force((n) => n + 1));
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      unsub();
    };
  }, []);

  // Captura quantidade inicial de pendentes ao iniciar sync, para a barra de progresso
  const syncing = isSyncing();
  useEffect(() => {
    if (syncing && initialPending === null && pending) {
      setInitialPending(pending.length);
    }
    if (!syncing && initialPending !== null) {
      // sync acabou — limpa após pequeno delay para o utilizador ver 100%
      const t = setTimeout(() => setInitialPending(null), 1500);
      return () => clearTimeout(t);
    }
  }, [syncing, initialPending, pending]);

  const total = pending?.length ?? 0;
  const failed = pending?.filter((m) => m.status === 'failed').length ?? 0;
  const inProgress = pending?.filter((m) => m.status === 'syncing').length ?? 0;
  const queued = pending?.filter((m) => m.status === 'pending').length ?? 0;

  const progressValue =
    initialPending && initialPending > 0
      ? Math.round(((initialPending - total) / initialPending) * 100)
      : total === 0
      ? 100
      : 0;

  const handleSync = async () => {
    if (!online) {
      toast.error('Sem ligação. Sincronização indisponível.');
      return;
    }
    const result = await syncNow();
    if (result.ok > 0) {
      toast.success(`${result.ok} alteração(ões) sincronizada(s).`);
    }
    if (result.failed > 0) {
      toast.warning(`${result.failed} alteração(ões) falharam — tentaremos novamente.`);
    }
    if (result.conflicts > 0) {
      toast.warning(`${result.conflicts} conflito(s) requerem revisão.`);
    }
    if (result.ok === 0 && result.failed === 0 && result.conflicts === 0) {
      toast.info('Nada a sincronizar.');
    }
  };

  const handleClearItem = async (id?: number) => {
    if (!id) return;
    if (!confirm('Descartar esta alteração pendente? Esta ação não pode ser desfeita.')) return;
    await offlineDB.mutationQueue.delete(id);
    toast.success('Alteração descartada.');
  };

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Sincronização Offline</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe as alterações feitas sem ligação e o progresso do envio quando voltar online.
        </p>
      </header>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-md ${
                  online ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
                }`}
              >
                {online ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <p className="text-lg font-semibold">{online ? 'Online' : 'Offline'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <CloudUpload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-lg font-semibold">{queued + inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Falhadas</p>
                <p className="text-lg font-semibold">{failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-orange-500/10 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conflitos</p>
                <p className="text-lg font-semibold">{conflicts?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Progresso da sincronização</CardTitle>
          <Button onClick={handleSync} disabled={!online || syncing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressValue} />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {syncing && initialPending
                ? `${initialPending - total} de ${initialPending} enviadas`
                : total === 0
                ? 'Tudo sincronizado'
                : `${total} alteração(ões) à espera`}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {progressValue}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Detalhe */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pendentes <Badge variant="secondary" className="ml-2">{total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="conflicts">
            Conflitos <Badge variant="secondary" className="ml-2">{conflicts?.length ?? 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              {total === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
                  <p className="font-medium text-foreground">Nenhuma alteração pendente</p>
                  <p className="text-sm mt-1">Tudo sincronizado com o servidor.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Operação</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Tentativas</TableHead>
                      <TableHead>Quando</TableHead>
                      <TableHead>Erro</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending!.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          <div>{m.module}</div>
                          <div className="text-xs text-muted-foreground">{m.table}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={opVariant[m.operation]}>{opLabel[m.operation]}</Badge>
                        </TableCell>
                        <TableCell>
                          {m.status === 'syncing' && (
                            <Badge variant="default" className="gap-1">
                              <RefreshCw className="h-3 w-3 animate-spin" /> A enviar
                            </Badge>
                          )}
                          {m.status === 'pending' && (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="h-3 w-3" /> Em fila
                            </Badge>
                          )}
                          {m.status === 'failed' && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" /> Falhou
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{m.retries}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(m.createdAt), {
                            addSuffix: true,
                            locale: pt,
                          })}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-xs text-destructive line-clamp-2">
                            {m.lastError || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleClearItem(m.id)}
                            title="Descartar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts">
          <Card>
            <CardContent className="p-0">
              {!conflicts || conflicts.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
                  <p className="font-medium text-foreground">Sem conflitos</p>
                  <p className="text-sm mt-1">
                    Nenhuma alteração offline entrou em conflito com o servidor.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tabela</TableHead>
                      <TableHead>Campos em conflito</TableHead>
                      <TableHead>Detetado</TableHead>
                      <TableHead>Resolução</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conflicts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.table}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {c.conflictingFields.map((f) => (
                              <Badge key={f} variant="outline" className="text-xs">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(c.detectedAt), {
                            addSuffix: true,
                            locale: pt,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await resolveParkedConflict(c.id!, 'local-wins');
                                toast.success('Versão local aplicada.');
                              }}
                            >
                              Manter local
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await resolveParkedConflict(c.id!, 'server-wins');
                                toast.success('Versão do servidor mantida.');
                              }}
                            >
                              Manter servidor
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await resolveParkedConflict(c.id!, 'merge');
                                toast.success('Alterações combinadas.');
                              }}
                            >
                              Combinar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
