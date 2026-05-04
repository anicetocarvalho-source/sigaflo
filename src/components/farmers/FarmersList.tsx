import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Search, MapPin, Plus } from 'lucide-react';
import { useFarmers, useProvinces, type FarmerType, type WorkflowStatus } from '@/hooks/useFarmers';
import { FarmerTypeIcon, getFarmerTypeLabel, getFarmerTypeColor } from './FarmerTypeIcon';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryError } from '@/components/ui/query-state';
import { collapseSpaces } from '@/lib/validation/primitives';
import { SEARCH_MAX_LEN } from '@/lib/validation/search';

const farmerTypes: { value: FarmerType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'individual', label: 'Pequenos Agricultores' },
  { value: 'family', label: 'Agricultura Familiar' },
  { value: 'cooperative', label: 'Cooperativas' },
  { value: 'field_school', label: 'Escolas de Campo' },
  { value: 'company', label: 'Empresas/Grandes Produtores' },
];

export const FarmersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<FarmerType | 'all'>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');

  const { data: provinces } = useProvinces();
  const { data: farmers, isLoading, isError, error, refetch } = useFarmers({
    type: typeFilter === 'all' ? undefined : typeFilter,
    province_id: provinceFilter === 'all' ? undefined : provinceFilter,
  });

  const normalizedSearch = collapseSpaces(searchTerm).toLowerCase();
  const filteredFarmers = farmers?.filter((farmer) =>
    !normalizedSearch ||
    farmer.name.toLowerCase().includes(normalizedSearch) ||
    farmer.registration_number?.toLowerCase().includes(normalizedSearch) ||
    farmer.bi_nif?.toLowerCase().includes(normalizedSearch),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, registo ou BI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FarmerType | 'all')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {farmerTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={provinceFilter} onValueChange={setProvinceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Província" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Províncias</SelectItem>
              {provinces?.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Link to="/agricultores/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Registo
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Registos ({filteredFarmers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <QueryError error={error as Error} onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFarmers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum registo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFarmers?.map((farmer) => (
                    <TableRow key={farmer.id}>
                      <TableCell className="font-mono text-sm">
                        {farmer.registration_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{farmer.name}</p>
                          {farmer.trade_name && (
                            <p className="text-sm text-muted-foreground">{farmer.trade_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getFarmerTypeColor(farmer.farmer_type)}>
                          <FarmerTypeIcon type={farmer.farmer_type} className="mr-1 h-3 w-3" />
                          {getFarmerTypeLabel(farmer.farmer_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {farmer.provinces ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{farmer.provinces.name}</span>
                            {farmer.municipalities && (
                              <span className="text-muted-foreground">
                                / {farmer.municipalities.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <WorkflowStatusBadge status={farmer.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/agricultores/${farmer.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/agricultores/${farmer.id}/editar`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
