import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmers, useProvinces } from '@/hooks/useFarmers';
import { useCooperativeDetailsBulk } from '@/hooks/useCooperative';
import { WorkflowStatusBadge } from '@/components/farmers/WorkflowStatusBadge';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Building2, 
  Users, 
  MapPin,
  FileSpreadsheet,
  TrendingUp,
  Leaf
} from 'lucide-react';

const CooperativesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: provinces, isLoading: loadingProvinces } = useProvinces();
  const { data: cooperatives, isLoading: loadingCoops } = useFarmers({ 
    type: 'cooperative',
    province_id: provinceFilter !== 'all' ? provinceFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined
  });

  // Get associated farmers count (farmers that belong to cooperatives)
  const { data: allFarmers } = useFarmers({});
  const coopIds = useMemo(() => (cooperatives || []).map(c => c.id), [cooperatives]);
  const { data: detailsMap } = useCooperativeDetailsBulk(coopIds);

  const filteredCoops = useMemo(() => {
    if (!cooperatives) return [];
    return cooperatives.filter(coop => 
      coop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coop.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coop.trade_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cooperatives, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!cooperatives) return { total: 0, active: 0, provinces: 0, members: 0, totalArea: 0 };
    
    const activeCoops = cooperatives.filter(c => c.status === 'issued' || c.status === 'approved');
    const uniqueProvinces = new Set(cooperatives.map(c => c.province_id).filter(Boolean));
    const membersCount = allFarmers?.filter(f => f.parent_cooperative_id)?.length || 0;
    const totalArea = cooperatives.reduce((sum, c) => sum + (c.cultivated_area_ha || 0), 0);
    
    return {
      total: cooperatives.length,
      active: activeCoops.length,
      provinces: uniqueProvinces.size,
      members: membersCount,
      totalArea
    };
  }, [cooperatives, allFarmers]);

  const handleExportExcel = () => {
    const headers = ['Nº Registo', 'Nome', 'Razão Social', 'Província', 'Município', 'Área (ha)', 'Membros', 'Estado'];
    const rows = filteredCoops.map(coop => [
      coop.registration_number || '',
      coop.name,
      coop.trade_name || '',
      coop.provinces?.name || '',
      coop.municipalities?.name || '',
      coop.cultivated_area_ha || 0,
      allFarmers?.filter(f => f.parent_cooperative_id === coop.id)?.length || 0,
      coop.status || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cooperativas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <MainLayout 
      title="Cooperativas Agrícolas" 
      subtitle="Gestão de Cooperativas e Associações de Agricultores"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Cooperativas
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cooperativas Activas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{stats.active}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Províncias Abrangidas
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.provinces}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Membros Totais
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.members}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Área Total (ha)
              </CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalArea.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por nome ou nº registo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Província" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Províncias</SelectItem>
                    {provinces?.map(province => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="submitted">Submetido</SelectItem>
                    <SelectItem value="validated">Validado</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="issued">Activo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button asChild>
                  <Link to="/agricultores/cooperativas/nova">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Cooperativa
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de Cooperativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCoops ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredCoops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma cooperativa encontrada</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm || provinceFilter !== 'all' || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de pesquisa'
                    : 'Comece por registar uma nova cooperativa'}
                </p>
                <Button asChild className="mt-4">
                  <Link to="/agricultores/cooperativas/nova">
                    <Plus className="mr-2 h-4 w-4" />
                    Registar Cooperativa
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Registo</TableHead>
                      <TableHead>Nome / Razão Social</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Culturas</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead>Área (ha)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoops.map((coop) => {
                      const memberCount = allFarmers?.filter(f => f.parent_cooperative_id === coop.id)?.length || 0;
                      
                      return (
                        <TableRow key={coop.id}>
                          <TableCell className="font-mono text-sm">
                            {coop.registration_number || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                                <Building2 className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <span className="font-medium">{coop.name}</span>
                                {coop.trade_name && (
                                  <p className="text-xs text-muted-foreground">{coop.trade_name}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{coop.provinces?.name || '-'}</div>
                              <div className="text-muted-foreground text-xs">
                                {coop.municipalities?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {coop.main_crops?.slice(0, 2).map((crop, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {crop}
                                </Badge>
                              ))}
                              {(coop.main_crops?.length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(coop.main_crops?.length || 0) - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              <Users className="mr-1 h-3 w-3" />
                              {memberCount}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {coop.cultivated_area_ha?.toLocaleString() || '-'}
                          </TableCell>
                          <TableCell>
                            <WorkflowStatusBadge status={coop.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/agricultores/${coop.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/agricultores/cooperativas/${coop.id}/editar`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  A mostrar {filteredCoops.length} de {cooperatives?.length || 0} cooperativas
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CooperativesPage;
