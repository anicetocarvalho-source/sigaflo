import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Leaf, Search, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ParcelsListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: parcels, isLoading } = useQuery({
    queryKey: ['all-parcels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmer_parcels')
        .select('*, farmers(name, registration_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = parcels?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.farmers as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.main_crop?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalArea = parcels?.reduce((s, p) => s + (p.area_ha || 0), 0) || 0;
  const activeCount = parcels?.filter(p => p.status === 'active').length || 0;
  const avgArea = parcels?.length ? totalArea / parcels.length : 0;

  return (
    <MainLayout title="Parcelas Agrícolas" subtitle="Gestão de parcelas de todos os agricultores">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{parcels?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Parcelas</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{totalArea.toFixed(0)} ha</p>
            <p className="text-sm text-muted-foreground">Área Total</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{avgArea.toFixed(1)} ha</p>
            <p className="text-sm text-muted-foreground">Média por Parcela</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{parcels?.length ? ((activeCount / parcels.length) * 100).toFixed(0) : 0}%</p>
            <p className="text-sm text-muted-foreground">Parcelas Activas</p>
          </CardContent></Card>
        </div>

        {/* Search + Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Listagem de Parcelas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Agricultor</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Cultura</TableHead>
                    <TableHead>Solo</TableHead>
                    <TableHead>Irrigação</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id} className="cursor-pointer" onClick={() => navigate(`/agricultores/${p.farmer_id}`)}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{(p.farmers as any)?.name || '—'}</TableCell>
                      <TableCell>{p.area_ha ? `${p.area_ha} ha` : '—'}</TableCell>
                      <TableCell>
                        {p.main_crop ? <Badge variant="secondary"><Leaf className="mr-1 h-3 w-3" />{p.main_crop}</Badge> : '—'}
                      </TableCell>
                      <TableCell>{p.soil_type || '—'}</TableCell>
                      <TableCell>{p.irrigation_system || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ParcelsListPage;
