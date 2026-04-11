import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForestLogs, useForestLicenses, type ForestLog } from '@/hooks/useForestry';
import { Logs, Plus, Search, QrCode, Eye, ArrowRight } from 'lucide-react';
import { QueryError } from '@/components/ui/query-state';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface LogsListProps {
  onAddNew: () => void;
  onView: (log: ForestLog) => void;
  selectedLicenseId?: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  at_origin: { label: 'Na Origem', variant: 'secondary' },
  in_transport: { label: 'Em Trânsito', variant: 'default' },
  at_checkpoint: { label: 'No Posto', variant: 'outline' },
  at_destination: { label: 'No Destino', variant: 'default' },
  processed: { label: 'Processada', variant: 'outline' },
};

const woodClassColors: Record<string, string> = {
  precious: 'bg-amber-500',
  first_class: 'bg-emerald-500',
  second_class: 'bg-blue-500',
  common: 'bg-slate-500',
};

export function LogsList({ onAddNew, onView, selectedLicenseId }: LogsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLicense, setFilterLicense] = useState(selectedLicenseId || 'all');
  const [qrDialogLog, setQrDialogLog] = useState<ForestLog | null>(null);

  const { data: logs = [], isLoading, isError, error, refetch } = useForestLogs(filterLicense === 'all' ? undefined : filterLicense);
  const { data: licenses = [] } = useForestLicenses({ status: 'active' });

  const filteredLogs = logs.filter((log) =>
    log.log_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVolume = filteredLogs.reduce((sum, log) => sum + log.volume_m3, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Logs className="h-5 w-5" />
              Registo de Toras
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredLogs.length} toras • {totalVolume.toFixed(2)} m³ total
            </p>
          </div>
          <Button onClick={onAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tora
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por código ou espécie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterLicense} onValueChange={setFilterLicense}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filtrar por licença" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as licenças</SelectItem>
                {licenses.map((license) => (
                  <SelectItem key={license.id} value={license.id}>
                    {license.license_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isError ? (
            <QueryError error={error as Error} onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Logs className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nenhuma tora registada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Espécie</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                          {log.log_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {log.forest_trees ? (
                          <span className="text-sm text-muted-foreground">
                            {log.forest_trees.tree_code}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{log.species}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${woodClassColors[log.wood_class]}`} />
                          <span className="capitalize">{log.wood_class}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{log.volume_m3.toFixed(3)}</span> m³
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>{log.current_location_name || '—'}</span>
                          {log.destination_name && (
                            <>
                              <ArrowRight className="h-3 w-3" />
                              <span>{log.destination_name}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[log.status]?.variant || 'secondary'}>
                          {statusLabels[log.status]?.label || log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onView(log)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setQrDialogLog(log)}>
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={!!qrDialogLog} onOpenChange={() => setQrDialogLog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code - {qrDialogLog?.log_code}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrDialogLog && (
              <>
                <QRCodeSVG
                  value={qrDialogLog.qr_code_data || JSON.stringify({
                    type: 'log',
                    code: qrDialogLog.log_code,
                    species: qrDialogLog.species,
                    volume: qrDialogLog.volume_m3,
                  })}
                  size={200}
                  level="H"
                  includeMargin
                />
                <div className="text-center">
                  <p className="font-medium">{qrDialogLog.species}</p>
                  <p className="text-sm text-muted-foreground">
                    Volume: {qrDialogLog.volume_m3} m³
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    Classe: {qrDialogLog.wood_class}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Descarregar QR
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
