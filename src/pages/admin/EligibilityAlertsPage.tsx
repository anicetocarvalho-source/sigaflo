import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QueryError, QueryEmpty, QueryTableSkeleton } from '@/components/ui/query-state';
import {
  AlertTriangle,
  Archive,
  CheckCheck,
  Filter,
  PlayCircle,
  RefreshCcw,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  useNotifications,
  useMarkNotificationRead,
  useArchiveNotification,
  type NotificationType,
} from '@/hooks/useNotifications';
import { useRunAnomalyDetection } from '@/hooks/useEligibilityThresholds';
import { useAuth } from '@/contexts/AuthContext';

type Status = 'all' | 'unread' | 'read' | 'archived';
type Severity = 'all' | NotificationType;

const SEVERITY_VARIANT: Record<NotificationType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  info: 'secondary',
  success: 'default',
  warning: 'outline',
  error: 'destructive',
};

const SEVERITY_LABEL: Record<NotificationType, string> = {
  info: 'Informativo',
  success: 'OK',
  warning: 'Atenção',
  error: 'Crítico',
};

export default function EligibilityAlertsPage() {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState<Status>('unread');
  const [severity, setSeverity] = useState<Severity>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch, isFetching } = useNotifications({
    category: 'system',
    limit: 200,
  });

  const markRead = useMarkNotificationRead();
  const archive = useArchiveNotification();
  const runDetection = useRunAnomalyDetection();

  const filtered = useMemo(() => {
    const rows = (data ?? []).filter((n) =>
      n.title?.toLowerCase().startsWith('pico de bloqueios')
    );
    return rows.filter((n) => {
      if (status === 'unread' && n.is_read) return false;
      if (status === 'read' && !n.is_read) return false;
      if (status === 'archived' && !n.is_archived) return false;
      if (severity !== 'all' && n.notification_type !== severity) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !n.title.toLowerCase().includes(q) &&
          !n.message.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, status, severity, search]);

  const stats = useMemo(() => {
    const rows = (data ?? []).filter((n) =>
      n.title?.toLowerCase().startsWith('pico de bloqueios')
    );
    return {
      total: rows.length,
      unread: rows.filter((r) => !r.is_read).length,
      critical: rows.filter((r) => r.notification_type === 'error').length,
      warning: rows.filter((r) => r.notification_type === 'warning').length,
    };
  }, [data]);

  const markAllVisibleRead = async () => {
    const unread = filtered.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => markRead.mutateAsync(n.id)));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Alertas de Bloqueios de Elegibilidade
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitorize picos anormais de bloqueios de cartão e AgroPay e
              marque alertas como resolvidos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => runDetection.mutate()}
                disabled={runDetection.isPending}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Detectar agora
              </Button>
            )}
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={<AlertTriangle className="h-4 w-4" />} />
          <StatCard label="Por ler" value={stats.unread} highlight />
          <StatCard label="Críticos" value={stats.critical} variant="destructive" />
          <StatCard label="Atenção" value={stats.warning} variant="warning" />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Pesquisar por tipo, motivo, mensagem..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="unread">Por ler</SelectItem>
                  <SelectItem value="read">Lidos</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger>
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as severidades</SelectItem>
                  <SelectItem value="error">Crítico</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="info">Informativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-xs text-muted-foreground">
                {filtered.length} alerta(s) listado(s)
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllVisibleRead}
                disabled={markRead.isPending || filtered.every((n) => n.is_read)}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar visíveis como resolvidos
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <QueryTableSkeleton rows={6} cols={5} />
              </div>
            ) : error ? (
              <div className="p-6">
                <QueryError error={error as Error} onRetry={refetch} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6">
                <QueryEmpty
                  title="Sem alertas"
                  description="Não há alertas de anomalia que correspondam aos filtros seleccionados."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Mensagem</TableHead>
                    <TableHead className="hidden lg:table-cell">Quando</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((n) => (
                    <TableRow key={n.id} className={n.is_read ? 'opacity-70' : ''}>
                      <TableCell>
                        <Badge variant={SEVERITY_VARIANT[n.notification_type]}>
                          {SEVERITY_LABEL[n.notification_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {!n.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                          )}
                          {n.title}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xl">
                        <p className="line-clamp-2">{n.message}</p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(n.created_at), "dd 'de' MMM, HH:mm", {
                          locale: pt,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!n.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markRead.mutate(n.id)}
                              disabled={markRead.isPending}
                            >
                              <CheckCheck className="h-4 w-4" />
                              <span className="sr-only">Marcar como resolvido</span>
                            </Button>
                          )}
                          {!n.is_archived && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => archive.mutate(n.id)}
                              disabled={archive.isPending}
                            >
                              <Archive className="h-4 w-4" />
                              <span className="sr-only">Arquivar</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
  variant,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
  variant?: 'destructive' | 'warning';
}) {
  const color =
    variant === 'destructive'
      ? 'text-destructive'
      : variant === 'warning'
      ? 'text-amber-600 dark:text-amber-400'
      : highlight
      ? 'text-primary'
      : 'text-foreground';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {icon}
        </div>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
