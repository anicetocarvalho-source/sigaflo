import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Eye, Edit, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Infraction {
  id: string;
  infraction_number: string;
  infraction_type: string;
  severity: string;
  status: string;
  operator_name: string;
  location_description: string;
  occurrence_date: string;
  fine_amount_aoa: number | null;
  seized_volume_m3: number | null;
  province?: { name: string };
}

interface InfractionsListProps {
  infractions: Infraction[];
  isLoading: boolean;
  onAddNew: () => void;
  onView: (infraction: Infraction) => void;
  onEdit: (infraction: Infraction) => void;
}

const severityLabels: Record<string, string> = {
  minor: 'Leve',
  moderate: 'Moderada',
  serious: 'Grave',
  very_serious: 'Muito Grave',
};

const statusLabels: Record<string, string> = {
  detected: 'Detectada',
  under_investigation: 'Em Investigação',
  notification_sent: 'Notificação Enviada',
  awaiting_response: 'Aguarda Resposta',
  fine_applied: 'Multa Aplicada',
  appealed: 'Em Recurso',
  resolved: 'Resolvida',
  archived: 'Arquivada',
};

const typeLabels: Record<string, string> = {
  illegal_logging: 'Corte Ilegal',
  transport_violation: 'Violação Transporte',
  license_violation: 'Violação Licença',
  protected_species: 'Espécie Protegida',
  unauthorized_area: 'Área Não Autorizada',
  document_fraud: 'Fraude Documental',
  volume_excess: 'Excesso Volume',
  other: 'Outra',
};

export function InfractionsList({ infractions, isLoading, onAddNew, onView, onEdit }: InfractionsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredInfractions = infractions.filter(inf => {
    const matchesSearch = 
      inf.infraction_number.toLowerCase().includes(search.toLowerCase()) ||
      inf.operator_name?.toLowerCase().includes(search.toLowerCase()) ||
      inf.location_description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inf.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || inf.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      minor: 'secondary',
      moderate: 'outline',
      serious: 'default',
      very_serious: 'destructive',
    };
    return <Badge variant={variants[severity] || 'default'}>{severityLabels[severity] || severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      detected: 'bg-yellow-500/20 text-yellow-700',
      under_investigation: 'bg-blue-500/20 text-blue-700',
      notification_sent: 'bg-purple-500/20 text-purple-700',
      awaiting_response: 'bg-orange-500/20 text-orange-700',
      fine_applied: 'bg-red-500/20 text-red-700',
      appealed: 'bg-indigo-500/20 text-indigo-700',
      resolved: 'bg-green-500/20 text-green-700',
      archived: 'bg-gray-500/20 text-gray-700',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar infrações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Estados</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Gravidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(severityLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Infração
        </Button>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Auto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Gravidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Multa (AOA)</TableHead>
              <TableHead className="text-right">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  A carregar infrações...
                </TableCell>
              </TableRow>
            ) : filteredInfractions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Nenhuma infração encontrada</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInfractions.map((infraction) => (
                <TableRow key={infraction.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(infraction)}>
                  <TableCell className="font-medium">{infraction.infraction_number}</TableCell>
                  <TableCell>{typeLabels[infraction.infraction_type] || infraction.infraction_type}</TableCell>
                  <TableCell>{infraction.operator_name || '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{infraction.location_description || infraction.province?.name || '-'}</TableCell>
                  <TableCell>
                    {infraction.occurrence_date 
                      ? format(new Date(infraction.occurrence_date), 'dd/MM/yyyy', { locale: pt })
                      : '-'}
                  </TableCell>
                  <TableCell>{getSeverityBadge(infraction.severity)}</TableCell>
                  <TableCell>{getStatusBadge(infraction.status)}</TableCell>
                  <TableCell>
                    {infraction.fine_amount_aoa 
                      ? infraction.fine_amount_aoa.toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onView(infraction); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(infraction); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
