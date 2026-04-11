import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, ClipboardList, MoreHorizontal, Play, CheckCircle, XCircle, Satellite } from 'lucide-react';
import { useServiceOrders, useUpdateOrderStatus, SERVICE_TYPES, ORDER_STATUSES } from '@/hooks/useMechanization';
import { format } from 'date-fns';
import { TableSkeleton } from '@/components/ui/skeletons';
import { QueryError } from '@/components/ui/query-state';

export function ServiceOrdersList() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { data: orders, isLoading, isError, error, refetch } = useServiceOrders(statusFilter !== 'all' ? { status: statusFilter } : undefined);
  const updateStatus = useUpdateOrderStatus();

  const filtered = (orders || []).filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.farmer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.center_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const s = ORDER_STATUSES.find(st => st.value === status);
    return <Badge className={s?.color || ''}>{s?.label || status}</Badge>;
  };

  const getNextActions = (status: string) => {
    switch (status) {
      case 'requested': return [{ label: 'Agendar', status: 'scheduled' }, { label: 'Cancelar', status: 'cancelled' }];
      case 'scheduled': return [{ label: 'Iniciar', status: 'in_progress' }, { label: 'Cancelar', status: 'cancelled' }];
      case 'in_progress': return [{ label: 'Concluir', status: 'completed' }];
      case 'completed': return [{ label: 'Validar', status: 'validated' }];
      default: return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Ordens de Serviço</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-60" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <QueryError error={error as Error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Ordem</TableHead>
                  <TableHead>Agricultor</TableHead>
                  <TableHead>Centro</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Área (ha)</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Custo (AOA)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                    <TableCell>{o.farmer_name || '—'}</TableCell>
                    <TableCell>{o.center_name || '—'}</TableCell>
                    <TableCell>{SERVICE_TYPES.find(t => t.value === o.service_type)?.label || o.service_type}</TableCell>
                    <TableCell>{o.area_ha?.toFixed(1) || '—'}</TableCell>
                    <TableCell>{format(new Date(o.requested_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(o.status)}</TableCell>
                    <TableCell>{o.cost_aoa?.toLocaleString('pt-AO')}</TableCell>
                    <TableCell>
                      {getNextActions(o.status).length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {getNextActions(o.status).map(a => (
                              <DropdownMenuItem key={a.status} onClick={() => updateStatus.mutate({ id: o.id, status: a.status })}>
                                {a.status === 'cancelled' ? <XCircle className="h-4 w-4 mr-2" /> :
                                  a.status === 'validated' ? <Satellite className="h-4 w-4 mr-2" /> :
                                  a.status === 'completed' ? <CheckCircle className="h-4 w-4 mr-2" /> :
                                  <Play className="h-4 w-4 mr-2" />}
                                {a.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
