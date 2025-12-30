import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Plus,
  Eye,
  QrCode,
  Edit,
  MapPin,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { useForestLicenses, type ForestLicense } from '@/hooks/useForestry';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const typeLabels: Record<string, string> = {
  exploitation: 'Exploração',
  transport: 'Transporte',
  export: 'Exportação',
  sawmill: 'Serraria',
  processing: 'Transformação',
};

const typeColors: Record<string, string> = {
  exploitation: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  export: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  sawmill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  processing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  submitted: 'Submetido',
  under_review: 'Em Análise',
  approved: 'Aprovado',
  active: 'Activo',
  suspended: 'Suspenso',
  expired: 'Expirado',
  revoked: 'Revogado',
  rejected: 'Rejeitado',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  revoked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface LicensesListProps {
  onAddNew: () => void;
  onView: (license: ForestLicense) => void;
  onEdit: (license: ForestLicense) => void;
}

export function LicensesList({ onAddNew, onView, onEdit }: LicensesListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: licenses, isLoading } = useForestLicenses({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const filteredLicenses = licenses?.filter(license => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      license.license_number.toLowerCase().includes(searchLower) ||
      license.forest_operators?.name?.toLowerCase().includes(searchLower) ||
      license.concession_area_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar licenças..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="exploitation">Exploração</SelectItem>
              <SelectItem value="transport">Transporte</SelectItem>
              <SelectItem value="export">Exportação</SelectItem>
              <SelectItem value="sawmill">Serraria</SelectItem>
              <SelectItem value="processing">Transformação</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="submitted">Submetido</SelectItem>
              <SelectItem value="under_review">Em Análise</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Licença
        </Button>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !filteredLicenses?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileCheck className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Sem licenças</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Não foram encontradas licenças com os filtros actuais.
            </p>
            <Button onClick={onAddNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira licença
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Licença</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Província</TableHead>
                <TableHead>Espécies</TableHead>
                <TableHead className="text-right">Volume (m³)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((license) => (
                <TableRow key={license.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-mono font-medium">{license.license_number}</p>
                      {license.expiry_date && (
                        <p className="text-xs text-muted-foreground">
                          Expira: {format(new Date(license.expiry_date), 'dd/MM/yyyy', { locale: pt })}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={typeColors[license.license_type]} variant="secondary">
                      {typeLabels[license.license_type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{license.forest_operators?.name || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {license.provinces?.name || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {license.authorized_species?.slice(0, 2).map((species, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {species}
                        </Badge>
                      ))}
                      {(license.authorized_species?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(license.authorized_species?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {license.authorized_volume_m3?.toLocaleString() || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[license.status]} variant="secondary">
                      {statusLabels[license.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onView(license)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(license)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
