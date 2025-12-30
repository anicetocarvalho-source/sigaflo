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
import { useTransportPermits, type ForestTransportPermit } from '@/hooks/useForestry';
import { Truck, Plus, Search, QrCode, Eye, ArrowRight, Calendar, Package } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { pt } from 'date-fns/locale';

interface TransportPermitsListProps {
  onAddNew: () => void;
  onView: (permit: ForestTransportPermit) => void;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  active: { label: 'Activa', variant: 'default' },
  in_transit: { label: 'Em Trânsito', variant: 'outline' },
  completed: { label: 'Concluída', variant: 'secondary' },
  expired: { label: 'Expirada', variant: 'destructive' },
  cancelled: { label: 'Cancelada', variant: 'secondary' },
};

export function TransportPermitsList({ onAddNew, onView }: TransportPermitsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [qrDialogPermit, setQrDialogPermit] = useState<ForestTransportPermit | null>(null);

  const { data: permits = [], isLoading } = useTransportPermits();

  const filteredPermits = permits.filter((permit) => {
    const matchesSearch = 
      permit.permit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permit.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permit.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || permit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPermitStatus = (permit: ForestTransportPermit) => {
    const now = new Date();
    const validUntil = new Date(permit.valid_until);
    
    if (permit.status === 'completed') return statusLabels.completed;
    if (permit.status === 'cancelled') return statusLabels.cancelled;
    if (isBefore(validUntil, now)) return statusLabels.expired;
    if (permit.departure_at && !permit.arrival_at) return statusLabels.in_transit;
    
    return statusLabels[permit.status] || statusLabels.active;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Guias de Transporte
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredPermits.length} guias registadas
            </p>
          </div>
          <Button onClick={onAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Guia
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nº guia, motorista ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="in_transit">Em Trânsito</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="expired">Expiradas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredPermits.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nenhuma guia de transporte encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Guia</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Motorista / Veículo</TableHead>
                    <TableHead>Trajecto</TableHead>
                    <TableHead>Carga</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermits.map((permit) => {
                    const status = getPermitStatus(permit);
                    return (
                      <TableRow key={permit.id}>
                        <TableCell>
                          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                            {permit.permit_number}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {permit.forest_operators?.name || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{permit.driver_name}</p>
                            <p className="text-sm text-muted-foreground">{permit.vehicle_plate}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="truncate max-w-[100px]">{permit.origin_location}</span>
                            <ArrowRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate max-w-[100px]">{permit.destination_location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span>{permit.total_logs || 0} toras</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{permit.total_volume_m3?.toFixed(2) || 0} m³</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {format(new Date(permit.valid_until), "dd/MM/yy", { locale: pt })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => onView(permit)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setQrDialogPermit(permit)}>
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={!!qrDialogPermit} onOpenChange={() => setQrDialogPermit(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Guia de Transporte</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrDialogPermit && (
              <>
                <QRCodeSVG
                  value={qrDialogPermit.qr_code_data || JSON.stringify({
                    type: 'transport',
                    permit: qrDialogPermit.permit_number,
                    vehicle: qrDialogPermit.vehicle_plate,
                    driver: qrDialogPermit.driver_name,
                    volume: qrDialogPermit.total_volume_m3,
                    valid: qrDialogPermit.valid_until,
                  })}
                  size={200}
                  level="H"
                  includeMargin
                />
                <div className="text-center space-y-1">
                  <p className="font-bold text-lg">{qrDialogPermit.permit_number}</p>
                  <p className="text-sm">{qrDialogPermit.driver_name}</p>
                  <p className="text-sm text-muted-foreground">{qrDialogPermit.vehicle_plate}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>{qrDialogPermit.total_logs} toras</span>
                    <span>•</span>
                    <span>{qrDialogPermit.total_volume_m3?.toFixed(2)} m³</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Válida até: {format(new Date(qrDialogPermit.valid_until), "dd/MM/yyyy", { locale: pt })}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Imprimir Guia
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
