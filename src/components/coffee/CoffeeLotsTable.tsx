import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { 
  Search, 
  Coffee, 
  Filter, 
  Download, 
  Plus,
  Truck,
  Ship,
  Package,
  Users,
  MapPin,
} from 'lucide-react';
import { useCoffeeLots, useCoffeeExporters } from '@/hooks/useCoffee';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryError } from '@/components/ui/query-state';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  registered: { label: 'Registado', variant: 'outline', icon: Package },
  in_processing: { label: 'Em Processamento', variant: 'secondary', icon: Coffee },
  in_transit: { label: 'Em Trânsito', variant: 'default', icon: Truck },
  exported: { label: 'Exportado', variant: 'default', icon: Ship },
  rejected: { label: 'Rejeitado', variant: 'destructive', icon: Package },
};

export function CoffeeLotsTable() {
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('');
  const [exporterFilter, setExporterFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data, error } = await supabase.from('provinces').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: exporters } = useCoffeeExporters();

  const { data: lots, isLoading, isError, error, refetch } = useCoffeeLots({
    provinceId: provinceFilter || undefined,
    exporterName: exporterFilter || undefined,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const handleExportCSV = () => {
    if (!lots?.length) return;

    const headers = ['Código', 'Origem', 'Nº Produtores', 'Volume (kg)', 'Sacas', 'Estado', 'Exportador', 'Destino'];
    const rows = lots.map(lot => [
      lot.lot_code,
      lot.origin_location || lot.origin_province?.name || '-',
      lot.producers_count,
      lot.volume_kg,
      lot.bags_count,
      statusConfig[lot.status]?.label || lot.status,
      lot.exporter_name || '-',
      lot.destination_country || '-',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lotes-cafe-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalVolume = lots?.reduce((sum, lot) => sum + Number(lot.volume_kg), 0) || 0;
  const totalProducers = lots?.reduce((sum, lot) => sum + (lot.producers_count || 0), 0) || 0;
  const inTransitCount = lots?.filter(l => l.status === 'in_transit').length || 0;
  const exportedCount = lots?.filter(l => l.status === 'exported').length || 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Coffee className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Lotes</p>
                <p className="text-2xl font-bold">{lots?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume Total</p>
                <p className="text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}t</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Trânsito</p>
                <p className="text-2xl font-bold">{inTransitCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Ship className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exportados</p>
                <p className="text-2xl font-bold">{exportedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-amber-600" />
                Lotes de Café
              </CardTitle>
              <CardDescription>
                Gestão e rastreabilidade de lotes de café ({lots?.length || 0} registos)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Lote
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por código ou origem..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={provinceFilter || "all"} onValueChange={(v) => setProvinceFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Província" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {provinces?.map((prov) => (
                  <SelectItem key={prov.id} value={prov.id}>
                    {prov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={exporterFilter || "all"} onValueChange={(v) => setExporterFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Ship className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Exportador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {exporters?.map((exp) => (
                  <SelectItem key={exp} value={exp}>
                    {exp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="registered">Registado</SelectItem>
                <SelectItem value="in_processing">Em Processamento</SelectItem>
                <SelectItem value="in_transit">Em Trânsito</SelectItem>
                <SelectItem value="exported">Exportado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : lots?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Coffee className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">Nenhum lote encontrado</p>
              <p className="text-sm text-muted-foreground">
                Ajuste os filtros ou adicione um novo lote de café
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código do Lote</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead className="text-center">Nº Produtores</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Exportador</TableHead>
                    <TableHead>Destino</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lots?.map((lot) => {
                    const status = statusConfig[lot.status] || statusConfig.registered;
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={lot.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-amber-600" />
                            <span className="font-medium">{lot.lot_code}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{lot.origin_location || lot.origin_province?.name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{lot.producers_count}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <span className="font-medium">{lot.volume_kg.toLocaleString()} kg</span>
                            {lot.bags_count > 0 && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({lot.bags_count} sacas)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{lot.exporter_name || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{lot.destination_country || '-'}</span>
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
    </div>
  );
}
