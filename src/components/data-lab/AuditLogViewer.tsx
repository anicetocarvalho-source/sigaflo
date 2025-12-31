import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuditLog } from '@/hooks/useDataLab';
import { 
  History, 
  Search, 
  LogIn, 
  LogOut, 
  Database, 
  Download, 
  Shield,
  Eye,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export function AuditLogViewer() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const { data: auditLog, isLoading } = useAuditLog({
    action: actionFilter !== 'all' ? actionFilter : undefined,
  });

  const filteredLogs = auditLog?.filter(log =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    (log.researcher as any)?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout': return <LogOut className="h-4 w-4 text-gray-500" />;
      case 'query': return <Database className="h-4 w-4 text-blue-500" />;
      case 'export': return <Download className="h-4 w-4 text-purple-500" />;
      case 'access_request': return <Shield className="h-4 w-4 text-orange-500" />;
      case 'view_dataset': return <Eye className="h-4 w-4 text-cyan-500" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      query: 'Query Executada',
      export: 'Exportação',
      access_request: 'Pedido de Acesso',
      view_dataset: 'Visualização',
    };
    return labels[action] || action;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Log de Auditoria
        </CardTitle>
        <CardDescription>
          Registo completo de todas as actividades no Laboratório de Dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar no log..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo de Acção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Acções</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="query">Queries</SelectItem>
              <SelectItem value="export">Exportações</SelectItem>
              <SelectItem value="access_request">Pedidos de Acesso</SelectItem>
              <SelectItem value="view_dataset">Visualizações</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Log Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Data/Hora</TableHead>
                <TableHead>Acção</TableHead>
                <TableHead>Utilizador</TableHead>
                <TableHead>Organização</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando log de auditoria...
                  </TableCell>
                </TableRow>
              ) : filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: pt })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span>{getActionLabel(log.action)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(log.researcher as any)?.full_name || '-'}
                    </TableCell>
                    <TableCell>
                      {(log.organization as any)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {log.resource_type && (
                        <Badge variant="outline" className="text-xs">
                          {log.resource_type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats */}
        {filteredLogs && filteredLogs.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
            <span>
              Mostrando {filteredLogs.length} registos
            </span>
            <span>
              Último registo: {format(new Date(filteredLogs[0].created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
