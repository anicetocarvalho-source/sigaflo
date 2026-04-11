import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDistinctCrops, useDistinctYears, useDeleteProductionRecord } from '@/hooks/useProductionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, Loader2, Filter, X, Trash2 } from 'lucide-react';
import { QueryError } from '@/components/ui/query-state';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePaginatedQuery } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/pagination-controls';

const CROP_LABELS: Record<string, string> = {
  arroz: 'Arroz',
  milho: 'Milho',
  feijao: 'Feijão',
  mandioca: 'Mandioca',
  batata_doce: 'Batata Doce',
  amendoim: 'Amendoim',
  soja: 'Soja',
  cafe: 'Café',
  horticolas: 'Hortícolas',
  outros: 'Outros',
};

const SEASON_LABELS: Record<string, string> = {
  principal: 'Principal',
  intermediaria: 'Intermédia',
  seca: 'Seca',
};

const QUALITY_COLORS: Record<string, string> = {
  'A': 'bg-green-500',
  'B': 'bg-blue-500',
  'C': 'bg-yellow-500',
  'D': 'bg-orange-500',
  'E': 'bg-red-500',
};

export const ProductionList = () => {
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [cropFilter, setCropFilter] = useState<string>('');
  const [seasonFilter, setSeasonFilter] = useState<string>('');

  const { data: crops } = useDistinctCrops();
  const { data: years } = useDistinctYears();
  const { mutate: deleteRecord } = useDeleteProductionRecord();
  
  // Server-side pagination
  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
    refetch,
    pagination,
    goToPage,
    setPageSize,
  } = usePaginatedQuery<any>({
    queryKey: ['production-history-paginated'],
    tableName: 'production_history',
    select: '*, farmers(name, registration_number)',
    filters: {
      ...(yearFilter && yearFilter !== '' ? { year: parseInt(yearFilter) } : {}),
      ...(cropFilter && cropFilter !== '' ? { crop_type: cropFilter } : {}),
      ...(seasonFilter && seasonFilter !== '' ? { season: seasonFilter } : {}),
    },
    initialPageSize: 20,
    initialSortBy: 'created_at',
    initialSortOrder: 'desc',
  });

  const records = paginatedData?.data;

  // Client-side search filter (on current page only)
  const filteredRecords = records?.filter((record: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      record.farmers?.name?.toLowerCase().includes(searchLower) ||
      record.farmers?.registration_number?.toLowerCase().includes(searchLower) ||
      record.crop_type?.toLowerCase().includes(searchLower)
    );
  });

  const clearFilters = () => {
    setSearch('');
    setYearFilter('');
    setCropFilter('');
    setSeasonFilter('');
  };

  const hasFilters = search || yearFilter || cropFilter || seasonFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por agricultor ou cultura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link to="/producao/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Registo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={yearFilter || 'all'} onValueChange={(val) => setYearFilter(val === 'all' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {years?.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cropFilter || 'all'} onValueChange={(val) => setCropFilter(val === 'all' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Cultura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as culturas</SelectItem>
                {crops?.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {CROP_LABELS[crop] || crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={seasonFilter || 'all'} onValueChange={(val) => setSeasonFilter(val === 'all' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Campanha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as campanhas</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="intermediaria">Intermédia</SelectItem>
                <SelectItem value="seca">Seca</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <QueryError error={error as Error} onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRecords && filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agricultor</TableHead>
                    <TableHead>Cultura</TableHead>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead className="text-right">Área (ha)</TableHead>
                    <TableHead className="text-right">Produção (kg)</TableHead>
                    <TableHead className="text-right">Rend. (kg/ha)</TableHead>
                    <TableHead>Qualidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.farmers?.name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{record.farmers?.registration_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CROP_LABELS[record.crop_type] || record.crop_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{SEASON_LABELS[record.season] || record.season}</TableCell>
                      <TableCell>{record.year}</TableCell>
                      <TableCell className="text-right">
                        {record.area_planted_ha?.toLocaleString('pt-AO', { maximumFractionDigits: 2 }) || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.actual_yield_kg?.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.yield_per_ha?.toLocaleString('pt-AO', { maximumFractionDigits: 0 }) || '-'}
                      </TableCell>
                      <TableCell>
                        {record.quality_grade ? (
                          <Badge className={QUALITY_COLORS[record.quality_grade] || 'bg-gray-500'}>
                            {record.quality_grade}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/producao/${record.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/producao/${record.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar registo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acção é irreversível. O registo será permanentemente eliminado.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteRecord(record.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum registo de produção encontrado</p>
              <Button asChild className="mt-4">
                <Link to="/producao/novo">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Registo
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {paginatedData && paginatedData.totalPages > 0 && (
        <PaginationControls
          currentPage={paginatedData.currentPage}
          totalPages={paginatedData.totalPages}
          totalCount={paginatedData.totalCount}
          pageSize={pagination.pageSize}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
