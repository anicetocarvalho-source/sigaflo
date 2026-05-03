import { useEffect, useMemo, useState } from 'react';
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
import { PaginationControls } from '@/components/ui/pagination-controls';
import {
  Search, Plus, Eye, Edit, Building2, Users, MapPin,
  FileSpreadsheet, TrendingUp, Leaf, FilterX,
} from 'lucide-react';

const CooperativesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nifFilter, setNifFilter] = useState('');
  const [presidentFilter, setPresidentFilter] = useState('');
  const [minMembers, setMinMembers] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: provinces } = useProvinces();
  const { data: cooperatives, isLoading: loadingCoops } = useFarmers({
    type: 'cooperative',
    province_id: provinceFilter !== 'all' ? provinceFilter : undefined,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
  });

  const { data: allFarmers } = useFarmers({});
  const coopIds = useMemo(() => (cooperatives || []).map((c) => c.id), [cooperatives]);
  const { data: detailsMap } = useCooperativeDetailsBulk(coopIds);

  const filteredCoops = useMemo(() => {
    if (!cooperatives) return [];
    const term = searchTerm.toLowerCase();
    const nifT = nifFilter.toLowerCase().trim();
    const presT = presidentFilter.toLowerCase().trim();
    const minM = minMembers ? Number(minMembers) : null;
    const minA = minArea ? Number(minArea) : null;
    return cooperatives.filter((coop) => {
      const det = detailsMap?.[coop.id];
      const memberCount = det?.total_members ?? (allFarmers?.filter((f) => f.parent_cooperative_id === coop.id)?.length || 0);
      const area = det?.aggregated_area_ha ?? coop.cultivated_area_ha ?? 0;
      if (term && !(
        coop.name.toLowerCase().includes(term) ||
        coop.registration_number?.toLowerCase().includes(term) ||
        coop.trade_name?.toLowerCase().includes(term)
      )) return false;
      if (nifT && !(det?.nif || '').toLowerCase().includes(nifT)) return false;
      if (presT && !(det?.president_name || '').toLowerCase().includes(presT)) return false;
      if (minM !== null && memberCount < minM) return false;
      if (minA !== null && Number(area) < minA) return false;
      return true;
    });
  }, [cooperatives, detailsMap, allFarmers, searchTerm, nifFilter, presidentFilter, minMembers, minArea]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [searchTerm, provinceFilter, statusFilter, nifFilter, presidentFilter, minMembers, minArea, pageSize]);

  const totalCount = filteredCoops.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageItems = useMemo(() => filteredCoops.slice((page - 1) * pageSize, page * pageSize), [filteredCoops, page, pageSize]);

  const stats = useMemo(() => {
    if (!cooperatives) return { total: 0, active: 0, provinces: 0, members: 0, totalArea: 0 };
    const activeCoops = cooperatives.filter((c) => c.status === 'issued' || c.status === 'approved');
    const uniqueProvinces = new Set(cooperatives.map((c) => c.province_id).filter(Boolean));
    const membersCount = allFarmers?.filter((f) => f.parent_cooperative_id)?.length || 0;
    const totalArea = cooperatives.reduce((sum, c) => sum + (c.cultivated_area_ha || 0), 0);
    return { total: cooperatives.length, active: activeCoops.length, provinces: uniqueProvinces.size, members: membersCount, totalArea };
  }, [cooperatives, allFarmers]);

  const clearFilters = () => {
    setSearchTerm(''); setProvinceFilter('all'); setStatusFilter('all');
    setNifFilter(''); setPresidentFilter(''); setMinMembers(''); setMinArea('');
  };

  const handleExportExcel = () => {
    const headers = ['Nº Registo', 'Nome', 'NIF', 'Presidente', 'Província', 'Município', 'Área (ha)', 'Membros', 'Estado'];
    const rows = filteredCoops.map((coop) => {
      const det = detailsMap?.[coop.id];
      return [
        coop.registration_number || '', coop.name, det?.nif || '', det?.president_name || '',
        coop.provinces?.name || '', coop.municipalities?.name || '',
        det?.aggregated_area_ha ?? coop.cultivated_area_ha ?? 0,
        det?.total_members ?? (allFarmers?.filter((f) => f.parent_cooperative_id === coop.id)?.length || 0),
        coop.status || '',
      ];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `cooperativas-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  return (
    <MainLayout title="Cooperativas Agrícolas" subtitle="Gestão de Cooperativas e Associações de Agricultores">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Cooperativas</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Cooperativas Activas</CardTitle><TrendingUp className="h-4 w-4 text-primary" /></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{stats.active}</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Províncias Abrangidas</CardTitle><MapPin className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-2xl font-bold">{stats.provinces}</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Membros Totais</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-2xl font-bold">{stats.members}</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Área Total (ha)</CardTitle><Leaf className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-2xl font-bold">{stats.totalArea.toLocaleString()}</p></CardContent></Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Pesquisar por nome ou nº registo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
                <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Província" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Províncias</SelectItem>
                    {provinces?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
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
                  <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
                </Button>
                <Button asChild>
                  <Link to="/agricultores/cooperativas/nova"><Plus className="mr-2 h-4 w-4" />Nova Cooperativa</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-5">
              <Input placeholder="NIF" value={nifFilter} onChange={(e) => setNifFilter(e.target.value)} />
              <Input placeholder="Presidente" value={presidentFilter} onChange={(e) => setPresidentFilter(e.target.value)} />
              <Input type="number" min={0} placeholder="Mín. membros" value={minMembers} onChange={(e) => setMinMembers(e.target.value)} />
              <Input type="number" min={0} placeholder="Mín. área (ha)" value={minArea} onChange={(e) => setMinArea(e.target.value)} />
              <Button variant="ghost" onClick={clearFilters}><FilterX className="mr-2 h-4 w-4" />Limpar filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Lista de Cooperativas</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCoops ? (
              <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : totalCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma cooperativa encontrada</h3>
                <p className="text-muted-foreground mt-1">Tente ajustar os filtros de pesquisa</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Registo</TableHead>
                      <TableHead>Nome / Razão Social</TableHead>
                      <TableHead>NIF</TableHead>
                      <TableHead>Presidente</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead>Área Agreg. (ha)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((coop) => {
                      const memberCount = allFarmers?.filter((f) => f.parent_cooperative_id === coop.id)?.length || 0;
                      const det = detailsMap?.[coop.id];
                      return (
                        <TableRow key={coop.id}>
                          <TableCell className="font-mono text-sm">{coop.registration_number || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                                <Building2 className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <span className="font-medium">{coop.name}</span>
                                {coop.trade_name && <p className="text-xs text-muted-foreground">{coop.trade_name}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{det?.nif || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {det?.president_name || '-'}
                            {det?.president_phone && <p className="text-xs text-muted-foreground">{det.president_phone}</p>}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{coop.provinces?.name || '-'}</div>
                              <div className="text-muted-foreground text-xs">{coop.municipalities?.name}</div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="secondary"><Users className="mr-1 h-3 w-3" />{det?.total_members ?? memberCount}</Badge></TableCell>
                          <TableCell>{(det?.aggregated_area_ha ?? coop.cultivated_area_ha)?.toLocaleString() || '-'}</TableCell>
                          <TableCell><WorkflowStatusBadge status={coop.status} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/agricultores/${coop.id}`}><Eye className="h-4 w-4" /></Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/agricultores/cooperativas/${coop.id}/editar`}><Edit className="h-4 w-4" /></Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CooperativesPage;
