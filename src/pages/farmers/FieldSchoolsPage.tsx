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
import { useFieldSchoolDetailsBulk } from '@/hooks/useFieldSchool';
import { WorkflowStatusBadge } from '@/components/farmers/WorkflowStatusBadge';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  GraduationCap, 
  Users, 
  MapPin,
  FileSpreadsheet,
  FileText,
  TrendingUp
} from 'lucide-react';

const FieldSchoolsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: provinces, isLoading: loadingProvinces } = useProvinces();
  const { data: fieldSchools, isLoading: loadingSchools } = useFarmers({ 
    type: 'field_school',
    province_id: provinceFilter !== 'all' ? provinceFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined
  });

  // Get associated farmers count (farmers that belong to field schools)
  const { data: allFarmers } = useFarmers({});
  
  const filteredSchools = useMemo(() => {
    if (!fieldSchools) return [];
    return fieldSchools.filter(school => 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fieldSchools, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!fieldSchools) return { total: 0, active: 0, provinces: 0, members: 0 };
    
    const activeSchools = fieldSchools.filter(s => s.status === 'issued' || s.status === 'approved');
    const uniqueProvinces = new Set(fieldSchools.map(s => s.province_id).filter(Boolean));
    const membersCount = allFarmers?.filter(f => f.field_school_id)?.length || 0;
    
    return {
      total: fieldSchools.length,
      active: activeSchools.length,
      provinces: uniqueProvinces.size,
      members: membersCount
    };
  }, [fieldSchools, allFarmers]);

  const handleExportExcel = () => {
    const headers = ['Nº Registo', 'Nome', 'Província', 'Município', 'Estado', 'Membros'];
    const rows = filteredSchools.map(school => [
      school.registration_number || '',
      school.name,
      school.provinces?.name || '',
      school.municipalities?.name || '',
      school.status || '',
      allFarmers?.filter(f => f.field_school_id === school.id)?.length || 0
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escolas-campo-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <MainLayout 
      title="Escolas de Campo" 
      subtitle="Gestão de Escolas de Campo de Agricultores (ECAs)"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de ECAs
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ECAs Activas
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
                  <Link to="/agricultores/escolas/nova">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova ECA
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
              <GraduationCap className="h-5 w-5" />
              Lista de Escolas de Campo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSchools ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredSchools.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma ECA encontrada</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm || provinceFilter !== 'all' || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de pesquisa'
                    : 'Comece por registar uma nova Escola de Campo'}
                </p>
                <Button asChild className="mt-4">
                  <Link to="/agricultores/escolas/nova">
                    <Plus className="mr-2 h-4 w-4" />
                    Registar ECA
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Registo</TableHead>
                      <TableHead>Nome da ECA</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead>Área (ha)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.map((school) => {
                      const memberCount = allFarmers?.filter(f => f.field_school_id === school.id)?.length || 0;
                      
                      return (
                        <TableRow key={school.id}>
                          <TableCell className="font-mono text-sm">
                            {school.registration_number || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <GraduationCap className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{school.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{school.provinces?.name || '-'}</div>
                              <div className="text-muted-foreground text-xs">
                                {school.municipalities?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              <Users className="mr-1 h-3 w-3" />
                              {memberCount}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {school.cultivated_area_ha?.toLocaleString() || '-'}
                          </TableCell>
                          <TableCell>
                            <WorkflowStatusBadge status={school.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/agricultores/${school.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/agricultores/escolas/${school.id}/editar`}>
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
                  A mostrar {filteredSchools.length} de {fieldSchools?.length || 0} ECAs
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default FieldSchoolsPage;
