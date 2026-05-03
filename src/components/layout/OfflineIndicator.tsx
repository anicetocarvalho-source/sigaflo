import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Trash2, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { offlineDB, type QueuedMutation } from '@/lib/offline/db';
import { syncNow, subscribeSync, isSyncing } from '@/lib/offline/syncEngine';
import { useLiveQuery } from 'dexie-react-hooks';

export function OfflineIndicator() {
  const [online, setOnline] = useState(navigator.onLine);
  const [, force] = useState(0);

  const pending = useLiveQuery(
    () => offlineDB.mutationQueue.toArray(),
    []
  ) as QueuedMutation[] | undefined;

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

  const count = pending?.length ?? 0;
  const syncing = isSyncing();

  const variant = !online ? 'destructive' : syncing ? 'default' : count > 0 ? 'secondary' : 'outline';
  const Icon = !online ? WifiOff : syncing ? RefreshCw : count > 0 ? CloudUpload : Wifi;
  const label = !online ? 'Offline' : syncing ? 'Sincronizando' : count > 0 ? `${count} pendente${count > 1 ? 's' : ''}` : 'Online';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2 h-9">
          <Badge variant={variant as any} className="gap-1 font-normal">
            <Icon className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{label}</span>
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Estado de Sincronização</p>
              <p className="text-xs text-muted-foreground">
                {online ? 'Ligado à rede' : 'Sem ligação à internet'}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!online || syncing || count === 0}
              onClick={() => syncNow()}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {count === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma alteração pendente
            </div>
          ) : (
            <div className="divide-y">
              {pending!.map((m) => (
                <div key={m.id} className="p-3 flex items-start gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] py-0">{m.module}</Badge>
                      <span className="text-muted-foreground">{m.operation}</span>
                      {m.status === 'failed' && (
                        <Badge variant="destructive" className="text-[10px] py-0">Falhou</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {new Date(m.createdAt).toLocaleString('pt-AO')}
                    </p>
                    {m.lastError && (
                      <p className="text-destructive truncate mt-1" title={m.lastError}>
                        {m.lastError}
                      </p>
                    )}
                  </div>
                  {m.status === 'failed' && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => offlineDB.mutationQueue.delete(m.id!)}
                      title="Descartar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
