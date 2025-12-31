import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { 
  Search, 
  Trees, 
  MapPin, 
  Leaf,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  TreePine,
  Shield,
  Axe,
  Sprout
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProvinces } from '@/hooks/useFarmers';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ForestInventory {
  id: string;
  inventory_code: string;
  concession_name: string;
  province_id: string | null;
  municipality_id: string | null;
  total_area_ha: number;
  forest_type: string;
  forest_status: string;
  exploitation_status: string;
  dominant_species: string[];
  estimated_standing_volume_m3: number | null;
  harvestable_volume_m3: number | null;
  harvested_volume_m3: number | null;
  annual_allowable_cut_m3: number | null;
  reposition_rate_pct: number | null;
  trees_planted: number | null;
  trees_required: number | null;
  latitude: number | null;
  longitude: number | null;
  last_inventory_date: string | null;
  provinces?: { name: string } | null;
}

const forestTypeLabels: Record<string, string> = {
  'tropical_humid': 'Tropical Húmida',
  'tropical_dry': 'Tropical Seca',
  'miombo': 'Miombo',
  'mangrove': 'Mangal',
  'plantation': 'Plantação',
  'gallery': 'Galeria',
};

const forestTypeColors: Record<string, string> = {
  'tropical_humid': 'bg-green-600',
  'tropical_dry': 'bg-amber-600',
  'miombo': 'bg-emerald-600',
  'mangrove': 'bg-cyan-600',
  'plantation': 'bg-lime-600',
  'gallery': 'bg-teal-600',
};

const forestStatusLabels: Record<string, string> = {
  'exploitation': 'Exploração',
  'conservation': 'Conservação',
  'protection': 'Protecção',
  'restoration': 'Restauração',
};

const forestStatusColors: Record<string, string> = {
  'exploitation': 'bg-orange-100 text-orange-700',
  'conservation': 'bg-green-100 text-green-700',
  'protection': 'bg-blue-100 text-blue-700',
  'restoration': 'bg-purple-100 text-purple-700',
};

const forestStatusIcons: Record<string, React.ReactNode> = {
  'exploitation': <Axe className="h-3 w-3" />,
  'conservation': <Shield className="h-3 w-3" />,
  'protection': <TreePine className="h-3 w-3" />,
  'restoration': <Sprout className="h-3 w-3" />,
};

function useForestInventory(provinceId?: string, forestStatus?: string) {
  return useQuery({
    queryKey: ['forest-inventory', provinceId, forestStatus],
    queryFn: async () => {
      let query = supabase
        .from('forest_inventory')
        .select('*, provinces(name)')
        .order('concession_name');

      if (provinceId) {
        query = query.eq('province_id', provinceId);
      }
      if (forestStatus) {
        query = query.eq('forest_status', forestStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ForestInventory[];
    },
  });
}

export function ForestInventoryDashboard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  const { data: provinces } = useProvinces();
  const { data: inventory, isLoading } = useForestInventory(
    provinceFilter === 'all' ? undefined : provinceFilter,
    statusFilter === 'all' ? undefined : statusFilter
  );

  // Filter inventory
  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    
    return inventory.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.concession_name.toLowerCase().includes(searchLower) ||
        item.inventory_code.toLowerCase().includes(searchLower) ||
        item.provinces?.name?.toLowerCase().includes(searchLower);
      
      const matchesType = typeFilter === 'all' || item.forest_type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [inventory, searchTerm, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!filteredInventory.length) return {
      totalArea: 0,
      exploitationArea: 0,
      conservationArea: 0,
      avgRepositionRate: 0,
      totalVolume: 0,
    };

    const totalArea = filteredInventory.reduce((sum, i) => sum + (i.total_area_ha || 0), 0);
    const exploitationArea = filteredInventory
      .filter(i => i.forest_status === 'exploitation')
      .reduce((sum, i) => sum + (i.total_area_ha || 0), 0);
    const conservationArea = filteredInventory
      .filter(i => ['conservation', 'protection'].includes(i.forest_status))
      .reduce((sum, i) => sum + (i.total_area_ha || 0), 0);
    const avgRepositionRate = filteredInventory.reduce((sum, i) => sum + (i.reposition_rate_pct || 0), 0) / filteredInventory.length;
    const totalVolume = filteredInventory.reduce((sum, i) => sum + (i.estimated_standing_volume_m3 || 0), 0);

    return { totalArea, exploitationArea, conservationArea, avgRepositionRate, totalVolume };
  }, [filteredInventory]);

  // Fetch mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (!error && data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.log('Mapbox token not available');
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    if (map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [17.5, -12.5],
      zoom: 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Update markers
  useEffect(() => {
    if (!map.current || !filteredInventory.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredInventory.forEach(item => {
      if (item.latitude && item.longitude) {
        const color = forestTypeColors[item.forest_type]?.replace('bg-', '') || 'green-600';
        const hexColor = {
          'green-600': '#16a34a',
          'amber-600': '#d97706',
          'emerald-600': '#059669',
          'cyan-600': '#0891b2',
          'lime-600': '#65a30d',
          'teal-600': '#0d9488',
        }[color] || '#16a34a';

        const marker = new mapboxgl.Marker({ color: hexColor })
          .setLngLat([Number(item.longitude), Number(item.latitude)])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="min-width: 200px;">
                <strong>${item.concession_name}</strong>
                <br/><small>${item.inventory_code}</small>
                <hr style="margin: 8px 0;"/>
                <p><strong>Tipo:</strong> ${forestTypeLabels[item.forest_type] || item.forest_type}</p>
                <p><strong>Estado:</strong> ${forestStatusLabels[item.forest_status] || item.forest_status}</p>
                <p><strong>Área:</strong> ${item.total_area_ha?.toLocaleString()} ha</p>
                <p><strong>Taxa Reposição:</strong> ${item.reposition_rate_pct?.toFixed(1)}%</p>
              </div>
            `)
          )
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });

    // Fit bounds if we have markers
    if (markersRef.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredInventory.forEach(item => {
        if (item.latitude && item.longitude) {
          bounds.extend([Number(item.longitude), Number(item.latitude)]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 8 });
    }
  }, [filteredInventory, mapboxToken]);

  // Export to CSV
  const handleExport = () => {
    const headers = ['Código', 'Concessão', 'Província', 'Área (ha)', 'Tipo Floresta', 'Estado', 'Taxa Reposição (%)'];
    const rows = filteredInventory.map(item => [
      item.inventory_code,
      item.concession_name,
      item.provinces?.name || '-',
      item.total_area_ha.toString(),
      forestTypeLabels[item.forest_type] || item.forest_type,
      forestStatusLabels[item.forest_status] || item.forest_status,
      item.reposition_rate_pct?.toString() || '-'
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventario_florestal_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Inventário exportado com sucesso');
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trees className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.totalArea / 1000).toFixed(0)}k ha</p>
                <p className="text-sm text-muted-foreground">Área Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Axe className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.exploitationArea / 1000).toFixed(0)}k ha</p>
                <p className="text-sm text-muted-foreground">Em Exploração</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.conservationArea / 1000).toFixed(0)}k ha</p>
                <p className="text-sm text-muted-foreground">Conservação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Sprout className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgRepositionRate.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Taxa Reposição Média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TreePine className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.totalVolume / 1000).toFixed(0)}k m³</p>
                <p className="text-sm text-muted-foreground">Volume Estimado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Concessões Florestais
          </CardTitle>
          <CardDescription>
            Visualização das áreas florestais por camada de concessão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mapboxToken ? (
            <div 
              ref={mapContainer} 
              className="w-full h-[400px] rounded-lg border"
              style={{ minHeight: '400px' }}
            />
          ) : (
            <div className="w-full h-[400px] rounded-lg border bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Mapa não disponível</p>
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <span className="text-sm font-medium text-muted-foreground">Legenda:</span>
            {Object.entries(forestTypeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${forestTypeColors[key]}`} />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Inventário Florestal
              </CardTitle>
              <CardDescription>
                {filteredInventory.length} concessões registadas
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="exploitation">Exploração</SelectItem>
                <SelectItem value="conservation">Conservação</SelectItem>
                <SelectItem value="protection">Protecção</SelectItem>
                <SelectItem value="restoration">Restauração</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Floresta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="tropical_humid">Tropical Húmida</SelectItem>
                <SelectItem value="tropical_dry">Tropical Seca</SelectItem>
                <SelectItem value="miombo">Miombo</SelectItem>
                <SelectItem value="mangrove">Mangal</SelectItem>
                <SelectItem value="plantation">Plantação</SelectItem>
                <SelectItem value="gallery">Galeria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Concessão</TableHead>
                    <TableHead>Província</TableHead>
                    <TableHead className="text-right">Área (ha)</TableHead>
                    <TableHead>Tipo de Floresta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Taxa Reposição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhuma concessão encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {item.inventory_code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.concession_name}</p>
                            {item.dominant_species && item.dominant_species.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {item.dominant_species.slice(0, 2).join(', ')}
                                {item.dominant_species.length > 2 && ` +${item.dominant_species.length - 2}`}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.provinces?.name || '—'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.total_area_ha?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${forestTypeColors[item.forest_type]} text-white`}>
                            {forestTypeLabels[item.forest_type] || item.forest_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={forestStatusColors[item.forest_status]}>
                            <span className="flex items-center gap-1">
                              {forestStatusIcons[item.forest_status]}
                              {forestStatusLabels[item.forest_status] || item.forest_status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.reposition_rate_pct !== null ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-medium">{item.reposition_rate_pct.toFixed(1)}%</span>
                              <Progress 
                                value={Math.min(100, item.reposition_rate_pct)} 
                                className="h-1.5 w-16"
                              />
                            </div>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
