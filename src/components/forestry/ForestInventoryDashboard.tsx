import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Sprout,
  Plus,
  Eye,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  X,
  Radio,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProvinces, useMunicipalities } from '@/hooks/useFarmers';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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
  municipalities?: { name: string } | null;
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

const chartColors = ['#16a34a', '#d97706', '#059669', '#0891b2', '#65a30d', '#0d9488'];

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
        .select('*, provinces(name), municipalities(name)')
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

function useCreateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      inventory_code: string;
      concession_name: string;
      province_id?: string | null;
      municipality_id?: string | null;
      total_area_ha: number;
      forest_type: string;
      forest_status: string;
      exploitation_status: string;
      dominant_species?: string[];
      estimated_standing_volume_m3?: number | null;
      reposition_rate_pct?: number | null;
      latitude?: number | null;
      longitude?: number | null;
    }) => {
      const { data: result, error } = await supabase
        .from('forest_inventory')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forest-inventory'] });
      toast.success('Inventário criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar inventário: ' + error.message);
    },
  });
}

export function ForestInventoryDashboard() {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<ForestInventory | null>(null);
  const [showRfidQrDialog, setShowRfidQrDialog] = useState(false);
  const [formProvinceId, setFormProvinceId] = useState<string>('');

  const { data: provinces } = useProvinces();
  const { data: municipalities } = useMunicipalities(formProvinceId);
  const { data: inventory, isLoading } = useForestInventory(
    provinceFilter === 'all' ? undefined : provinceFilter,
    statusFilter === 'all' ? undefined : statusFilter
  );
  const createInventory = useCreateInventory();

  // Auto-generated concession code (CONC-YYYY-NNNN)
  const generateConcessionCode = () => {
    const year = new Date().getFullYear();
    const seq = ((inventory?.length ?? 0) + 1).toString().padStart(4, '0');
    return `CONC-${year}-${seq}`;
  };

  // Form state
  const [formData, setFormData] = useState({
    concession_code: '',
    concession_name: '',
    province_id: '',
    municipality_id: '',
    total_area_ha: '',
    forest_type: 'tropical_humid',
    forest_status: 'exploitation',
    dominant_species: '',
    estimated_standing_volume_m3: '',
    reposition_rate_pct: '',
    latitude: '',
    longitude: '',
  });

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

  // Chart data
  const chartData = useMemo(() => {
    if (!filteredInventory.length) return { byType: [], byStatus: [] };

    // By type
    const typeGroups = filteredInventory.reduce((acc, item) => {
      const type = item.forest_type;
      if (!acc[type]) acc[type] = { name: forestTypeLabels[type] || type, value: 0, area: 0 };
      acc[type].value += 1;
      acc[type].area += item.total_area_ha || 0;
      return acc;
    }, {} as Record<string, { name: string; value: number; area: number }>);

    // By status
    const statusGroups = filteredInventory.reduce((acc, item) => {
      const status = item.forest_status;
      if (!acc[status]) acc[status] = { name: forestStatusLabels[status] || status, count: 0, area: 0 };
      acc[status].count += 1;
      acc[status].area += item.total_area_ha || 0;
      return acc;
    }, {} as Record<string, { name: string; count: number; area: number }>);

    return {
      byType: Object.values(typeGroups),
      byStatus: Object.values(statusGroups),
    };
  }, [filteredInventory]);

  // Critical alerts (low reposition rate < 50%)
  const criticalAlerts = useMemo(() => {
    if (!filteredInventory.length) return [];
    return filteredInventory
      .filter(item => item.reposition_rate_pct !== null && item.reposition_rate_pct < 50)
      .sort((a, b) => (a.reposition_rate_pct || 0) - (b.reposition_rate_pct || 0))
      .slice(0, 5);
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

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = formData.concession_code || generateConcessionCode();
    
    createInventory.mutate({
      inventory_code: code,
      concession_name: formData.concession_name,
      province_id: formData.province_id || null,
      municipality_id: formData.municipality_id || null,
      total_area_ha: parseFloat(formData.total_area_ha) || 0,
      forest_type: formData.forest_type,
      forest_status: formData.forest_status,
      dominant_species: formData.dominant_species.split(',').map(s => s.trim()).filter(Boolean),
      estimated_standing_volume_m3: parseFloat(formData.estimated_standing_volume_m3) || null,
      reposition_rate_pct: parseFloat(formData.reposition_rate_pct) || null,
      latitude: parseFloat(formData.latitude) || null,
      longitude: parseFloat(formData.longitude) || null,
      exploitation_status: 'active',
    });
    
    setShowAddDialog(false);
    setFormData({
      concession_code: '',
      concession_name: '',
      province_id: '',
      municipality_id: '',
      total_area_ha: '',
      forest_type: 'tropical_humid',
      forest_status: 'exploitation',
      dominant_species: '',
      estimated_standing_volume_m3: '',
      reposition_rate_pct: '',
      latitude: '',
      longitude: '',
    });
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

      {/* Alerts Section */}
      {criticalAlerts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Reposição Baixa
            </CardTitle>
            <CardDescription>
              Concessões com taxa de reposição inferior a 50%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              {criticalAlerts.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 bg-background rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/florestal/inventario/${item.id}`)}
                >
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{item.concession_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-destructive font-bold text-lg">
                        {item.reposition_rate_pct?.toFixed(0)}%
                      </span>
                      <Progress 
                        value={item.reposition_rate_pct || 0} 
                        className="h-2 flex-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Tipo de Floresta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.byType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {chartData.byType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} concessões`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Área por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.byStatus} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} ha`, 'Área']}
                  />
                  <Bar dataKey="area" fill="#16a34a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" asChild>
                <a href="/rfid-arvores" target="_blank" rel="noopener noreferrer">
                  <Radio className="mr-2 h-4 w-4" />
                  App RFID Árvores
                </a>
              </Button>
              <Dialog open={showRfidQrDialog} onOpenChange={setShowRfidQrDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Acesso RFID
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>QR Code — Leitor RFID</DialogTitle>
                    <DialogDescription>
                      Aponte a câmara do telemóvel para abrir o leitor RFID de árvores.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <QRCodeSVG
                        value={`${window.location.origin}/rfid-arvores`}
                        size={240}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground break-all text-center">
                      {`${window.location.origin}/rfid-arvores`}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/rfid-arvores`);
                        toast({ title: 'Link copiado' });
                      }}
                    >
                      Copiar link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleExport}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Dialog open={showAddDialog} onOpenChange={(open) => {
                setShowAddDialog(open);
                if (open && !formData.concession_code) {
                  setFormData((prev) => ({ ...prev, concession_code: generateConcessionCode() }));
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Inventário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Novo Inventário Florestal</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova concessão ao inventário florestal
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="concession_code">Código da Concessão *</Label>
                        <Input
                          id="concession_code"
                          value={formData.concession_code}
                          readOnly
                          className="bg-muted font-mono"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Gerado automaticamente
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="concession_name">Nome da Concessão *</Label>
                        <Input
                          id="concession_name"
                          value={formData.concession_name}
                          onChange={(e) => setFormData({ ...formData, concession_name: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="province">Província</Label>
                        <Select 
                          value={formData.province_id} 
                          onValueChange={(v) => {
                            setFormData({ ...formData, province_id: v, municipality_id: '' });
                            setFormProvinceId(v);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces?.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="municipality">Município</Label>
                        <Select 
                          value={formData.municipality_id} 
                          onValueChange={(v) => setFormData({ ...formData, municipality_id: v })}
                          disabled={!formData.province_id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                          <SelectContent>
                            {municipalities?.map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="total_area">Área Total (ha) *</Label>
                        <Input
                          id="total_area"
                          type="number"
                          value={formData.total_area_ha}
                          onChange={(e) => setFormData({ ...formData, total_area_ha: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="forest_type">Tipo de Floresta</Label>
                        <Select 
                          value={formData.forest_type} 
                          onValueChange={(v) => setFormData({ ...formData, forest_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(forestTypeLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="forest_status">Estado</Label>
                        <Select 
                          value={formData.forest_status} 
                          onValueChange={(v) => setFormData({ ...formData, forest_status: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(forestStatusLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="volume">Volume Estimado (m³)</Label>
                        <Input
                          id="volume"
                          type="number"
                          value={formData.estimated_standing_volume_m3}
                          onChange={(e) => setFormData({ ...formData, estimated_standing_volume_m3: e.target.value })}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label htmlFor="species">Espécies Dominantes (separadas por vírgula)</Label>
                        <Input
                          id="species"
                          value={formData.dominant_species}
                          onChange={(e) => setFormData({ ...formData, dominant_species: e.target.value })}
                          placeholder="ex: Girassol, Eucalipto, Pinheiro"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="reposition">Taxa de Reposição (%)</Label>
                        <Input
                          id="reposition"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.reposition_rate_pct}
                          onChange={(e) => setFormData({ ...formData, reposition_rate_pct: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="any"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="any"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createInventory.isPending}>
                        {createInventory.isPending ? 'A criar...' : 'Criar Inventário'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                    <TableHead className="text-center">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma concessão encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/florestal/inventario/${item.id}`)}
                      >
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
                              <span className={`font-medium ${item.reposition_rate_pct < 50 ? 'text-destructive' : ''}`}>
                                {item.reposition_rate_pct.toFixed(1)}%
                              </span>
                              <Progress 
                                value={Math.min(100, item.reposition_rate_pct)} 
                                className={`h-1.5 w-16 ${item.reposition_rate_pct < 50 ? '[&>div]:bg-destructive' : ''}`}
                              />
                            </div>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/florestal/inventario/${item.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedInventory} onOpenChange={() => setSelectedInventory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trees className="h-5 w-5" />
              {selectedInventory?.concession_name}
            </DialogTitle>
            <DialogDescription>
              {selectedInventory?.inventory_code}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInventory && (
            <div className="space-y-6">
              {/* Location & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Província</Label>
                  <p className="font-medium">{selectedInventory.provinces?.name || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Município</Label>
                  <p className="font-medium">{selectedInventory.municipalities?.name || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo de Floresta</Label>
                  <Badge className={`${forestTypeColors[selectedInventory.forest_type]} text-white mt-1`}>
                    {forestTypeLabels[selectedInventory.forest_type] || selectedInventory.forest_type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <Badge className={`${forestStatusColors[selectedInventory.forest_status]} mt-1`}>
                    <span className="flex items-center gap-1">
                      {forestStatusIcons[selectedInventory.forest_status]}
                      {forestStatusLabels[selectedInventory.forest_status] || selectedInventory.forest_status}
                    </span>
                  </Badge>
                </div>
              </div>

              {/* Area & Volume */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedInventory.total_area_ha?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Área Total (ha)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {selectedInventory.estimated_standing_volume_m3?.toLocaleString() || '—'}
                  </p>
                  <p className="text-sm text-muted-foreground">Volume Estimado (m³)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {selectedInventory.harvestable_volume_m3?.toLocaleString() || '—'}
                  </p>
                  <p className="text-sm text-muted-foreground">Volume Explorável (m³)</p>
                </div>
              </div>

              {/* Reposition Rate */}
              <div>
                <Label className="text-muted-foreground">Taxa de Reposição</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${
                      (selectedInventory.reposition_rate_pct || 0) < 50 ? 'text-destructive' : 'text-green-600'
                    }`}>
                      {selectedInventory.reposition_rate_pct?.toFixed(1) || 0}%
                    </span>
                    {(selectedInventory.reposition_rate_pct || 0) < 50 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Atenção Necessária
                      </Badge>
                    )}
                  </div>
                  <Progress 
                    value={selectedInventory.reposition_rate_pct || 0} 
                    className={`h-3 ${(selectedInventory.reposition_rate_pct || 0) < 50 ? '[&>div]:bg-destructive' : '[&>div]:bg-green-600'}`}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Árvores Plantadas: {selectedInventory.trees_planted?.toLocaleString() || '—'}</span>
                    <span>Árvores Requeridas: {selectedInventory.trees_required?.toLocaleString() || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Species */}
              {selectedInventory.dominant_species && selectedInventory.dominant_species.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Espécies Dominantes</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedInventory.dominant_species.map((species, idx) => (
                      <Badge key={idx} variant="outline">
                        <Leaf className="h-3 w-3 mr-1" />
                        {species}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Coordinates */}
              {selectedInventory.latitude && selectedInventory.longitude && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selectedInventory.latitude.toFixed(6)}, {selectedInventory.longitude.toFixed(6)}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
