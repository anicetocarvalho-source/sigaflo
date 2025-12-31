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
import { Search, Plus, Eye, UserX, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Complaint {
  id: string;
  complaint_number: string;
  complaint_type: string;
  status: string;
  location_description: string;
  description: string;
  is_anonymous: boolean;
  complainant_name?: string;
  received_at: string;
  province?: { name: string };
  municipality?: { name: string };
  verification_result?: string;
}

interface ComplaintsListProps {
  complaints: Complaint[];
  isLoading: boolean;
  onAddNew: () => void;
  onView: (complaint: Complaint) => void;
}

const typeLabels: Record<string, string> = {
  illegal_logging: 'Corte Ilegal',
  illegal_transport: 'Transporte Ilegal',
  deforestation: 'Desmatamento',
  poaching: 'Caça Furtiva',
  fire: 'Queimada',
  encroachment: 'Invasão de Área',
  pollution: 'Poluição',
  other: 'Outra',
};

const statusLabels: Record<string, string> = {
  received: 'Recebida',
  under_review: 'Em Análise',
  under_investigation: 'Em Investigação',
  verified: 'Verificada',
  unverified: 'Não Verificada',
  resolved: 'Resolvida',
  archived: 'Arquivada',
};

export function ComplaintsList({ complaints, isLoading, onAddNew, onView }: ComplaintsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.complaint_number.toLowerCase().includes(search.toLowerCase()) ||
      c.location_description?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.complaint_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      received: 'bg-blue-500/20 text-blue-700',
      under_review: 'bg-purple-500/20 text-purple-700',
      under_investigation: 'bg-yellow-500/20 text-yellow-700',
      verified: 'bg-green-500/20 text-green-700',
      unverified: 'bg-red-500/20 text-red-700',
      resolved: 'bg-emerald-500/20 text-emerald-700',
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
              placeholder="Pesquisar denúncias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Estados</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {Object.entries(typeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Denúncia
        </Button>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Denúncia</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Denunciante</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead className="text-right">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  A carregar denúncias...
                </TableCell>
              </TableRow>
            ) : filteredComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Megaphone className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Nenhuma denúncia encontrada</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(complaint)}>
                  <TableCell className="font-medium">{complaint.complaint_number}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[complaint.complaint_type] || complaint.complaint_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {complaint.is_anonymous ? (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <UserX className="h-3 w-3" />
                        Anónimo
                      </span>
                    ) : (
                      complaint.complainant_name || '-'
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {complaint.province?.name || complaint.location_description || '-'}
                  </TableCell>
                  <TableCell>
                    {complaint.received_at 
                      ? format(new Date(complaint.received_at), 'dd/MM/yyyy', { locale: pt })
                      : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell>
                    {complaint.verification_result === 'confirmed' && (
                      <Badge variant="destructive">Confirmada</Badge>
                    )}
                    {complaint.verification_result === 'unconfirmed' && (
                      <Badge variant="secondary">Não confirmada</Badge>
                    )}
                    {!complaint.verification_result && '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onView(complaint); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
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
