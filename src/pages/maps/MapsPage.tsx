import { useState, useEffect, useRef, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Map as MapIcon,
  Layers,
  Users,
  CloudRain,
  TreePine,
  Coffee,
  Wheat,
  AlertTriangle,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MapPin,
  Navigation,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Info,
  Building2,
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useFarmers, useProvinces } from '@/hooks/useFarmers';
import { useOccurrences } from '@/hooks/useOccurrences';
import { supabase } from '@/integrations/supabase/client';

// Layer definitions
const mapLayers = [
  { id: 'farmers', label: 'Agricultores', icon: Users, color: '#16a34a', enabled: true },
  { id: 'cooperatives', label: 'Cooperativas', icon: Building2, color: '#2563eb', enabled: true },
  { id: 'field_schools', label: 'Escolas de Campo', icon: Users, color: '#f97316', enabled: true },
  { id: 'occurrences', label: 'Ocorrências Climáticas', icon: CloudRain, color: '#eab308', enabled: false },
  { id: 'forestry', label: 'Concessões Florestais', icon: TreePine, color: '#84cc16', enabled: false },
  { id: 'coffee', label: 'Zonas de Café', icon: Coffee, color: '#92400e', enabled: false },
  { id: 'rice', label: 'Zonas de Arroz', icon: Wheat, color: '#ca8a04', enabled: false },
];

// Angola center coordinates
const ANGOLA_CENTER: [number, number] = [17.8739, -11.2027];
const ANGOLA_ZOOM = 5;

const MapsPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [activeLayers, setActiveLayers] = useState<string[]>(['farmers', 'cooperatives', 'field_schools']);
  const [mapStyle, setMapStyle] = useState<string>('satellite-streets-v12');
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const { data: farmers, isLoading: farmersLoading } = useFarmers();
  const { data: provinces } = useProvinces();
  const { data: occurrences } = useOccurrences();

  // Fetch mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
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
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: ANGOLA_CENTER,
      zoom: ANGOLA_ZOOM,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Update map style
  useEffect(() => {
    if (map.current && isMapLoaded) {
      map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
    }
  }, [mapStyle, isMapLoaded]);

  // Filter data based on province
  const filteredFarmers = useMemo(() => {
    if (!farmers) return [];
    let filtered = farmers.filter(f => f.latitude && f.longitude);
    if (selectedProvince !== 'all') {
      filtered = filtered.filter(f => f.province_id === selectedProvince);
    }
    return filtered;
  }, [farmers, selectedProvince]);

  const filteredOccurrences = useMemo(() => {
    if (!occurrences) return [];
    let filtered = occurrences.filter(o => o.latitude && o.longitude);
    if (selectedProvince !== 'all') {
      filtered = filtered.filter(o => o.province_id === selectedProvince);
    }
    return filtered;
  }, [occurrences, selectedProvince]);

  // Update markers when data or layers change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add farmer markers
    if (activeLayers.includes('farmers')) {
      filteredFarmers
        .filter(f => f.farmer_type === 'individual' || f.farmer_type === 'family')
        .forEach(farmer => {
          if (farmer.latitude && farmer.longitude) {
            const el = document.createElement('div');
            el.className = 'marker-farmer';
            el.style.cssText = `
              width: 24px;
              height: 24px;
              background-color: #16a34a;
              border: 2px solid white;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `;

            const marker = new mapboxgl.Marker(el)
              .setLngLat([farmer.longitude, farmer.latitude])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(`
                  <div style="padding: 8px;">
                    <strong>${farmer.name}</strong><br/>
                    <span style="color: #666; font-size: 12px;">${farmer.registration_number || 'Sem registo'}</span><br/>
                    <span style="color: #888; font-size: 11px;">${farmer.provinces?.name || ''}</span>
                  </div>
                `)
              )
              .addTo(map.current!);

            markersRef.current.push(marker);
          }
        });
    }

    // Add cooperative markers
    if (activeLayers.includes('cooperatives')) {
      filteredFarmers
        .filter(f => f.farmer_type === 'cooperative')
        .forEach(coop => {
          if (coop.latitude && coop.longitude) {
            const el = document.createElement('div');
            el.className = 'marker-cooperative';
            el.style.cssText = `
              width: 30px;
              height: 30px;
              background-color: #2563eb;
              border: 3px solid white;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            `;
            el.innerHTML = 'C';

            const marker = new mapboxgl.Marker(el)
              .setLngLat([coop.longitude, coop.latitude])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(`
                  <div style="padding: 8px;">
                    <strong>${coop.name}</strong><br/>
                    <span style="color: #2563eb; font-size: 12px;">Cooperativa</span><br/>
                    <span style="color: #888; font-size: 11px;">${coop.provinces?.name || ''}</span>
                  </div>
                `)
              )
              .addTo(map.current!);

            markersRef.current.push(marker);
          }
        });
    }

    // Add field school markers
    if (activeLayers.includes('field_schools')) {
      filteredFarmers
        .filter(f => f.farmer_type === 'field_school')
        .forEach(school => {
          if (school.latitude && school.longitude) {
            const el = document.createElement('div');
            el.className = 'marker-school';
            el.style.cssText = `
              width: 30px;
              height: 30px;
              background-color: #f97316;
              border: 3px solid white;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            `;
            el.innerHTML = 'E';

            const marker = new mapboxgl.Marker(el)
              .setLngLat([school.longitude, school.latitude])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(`
                  <div style="padding: 8px;">
                    <strong>${school.name}</strong><br/>
                    <span style="color: #f97316; font-size: 12px;">Escola de Campo</span><br/>
                    <span style="color: #888; font-size: 11px;">${school.provinces?.name || ''}</span>
                  </div>
                `)
              )
              .addTo(map.current!);

            markersRef.current.push(marker);
          }
        });
    }

    // Add occurrence markers
    if (activeLayers.includes('occurrences')) {
      filteredOccurrences.forEach(occ => {
        if (occ.latitude && occ.longitude) {
          const color = occ.severity === 'critical' ? '#ef4444' : 
                        occ.severity === 'high' ? '#f97316' : 
                        occ.severity === 'medium' ? '#eab308' : '#22c55e';

          const el = document.createElement('div');
          el.className = 'marker-occurrence';
          el.style.cssText = `
            width: 28px;
            height: 28px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 4px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          `;
          el.innerHTML = '⚠';

          const marker = new mapboxgl.Marker(el)
            .setLngLat([occ.longitude, occ.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div style="padding: 8px;">
                  <strong>${occ.title}</strong><br/>
                  <span style="color: ${color}; font-size: 12px;">${occ.occurrence_type} - ${occ.severity}</span><br/>
                  <span style="color: #888; font-size: 11px;">${new Date(occ.report_date).toLocaleDateString('pt-AO')}</span>
                </div>
              `)
            )
            .addTo(map.current!);

          markersRef.current.push(marker);
        }
      });
    }
  }, [filteredFarmers, filteredOccurrences, activeLayers, isMapLoaded]);

  // Fit bounds when province changes
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    if (selectedProvince === 'all') {
      map.current.flyTo({ center: ANGOLA_CENTER, zoom: ANGOLA_ZOOM });
    } else {
      // Find bounds from filtered data
      const allPoints = [
        ...filteredFarmers.filter(f => f.latitude && f.longitude).map(f => [f.longitude!, f.latitude!]),
        ...filteredOccurrences.filter(o => o.latitude && o.longitude).map(o => [o.longitude!, o.latitude!]),
      ];

      if (allPoints.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        allPoints.forEach(point => bounds.extend(point as [number, number]));
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 10 });
      }
    }
  }, [selectedProvince, filteredFarmers, filteredOccurrences, isMapLoaded]);

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  // Stats
  const stats = useMemo(() => ({
    totalFarmers: filteredFarmers.filter(f => f.farmer_type === 'individual' || f.farmer_type === 'family').length,
    totalCooperatives: filteredFarmers.filter(f => f.farmer_type === 'cooperative').length,
    totalSchools: filteredFarmers.filter(f => f.farmer_type === 'field_school').length,
    totalOccurrences: filteredOccurrences.length,
  }), [filteredFarmers, filteredOccurrences]);

  if (!mapboxToken) {
    return (
      <MainLayout title="Mapas" subtitle="Visualização geográfica dos dados">
        <Card className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <MapIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Token Mapbox não configurado</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Para visualizar os mapas, é necessário configurar o token público do Mapbox nas configurações do sistema.
            </p>
            <Button variant="outline" asChild>
              <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer">
                Obter Token Mapbox
              </a>
            </Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Mapas" 
      subtitle="Visualização geográfica dos dados do sistema"
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.totalFarmers}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Agricultores</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalCooperatives}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Cooperativas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.totalSchools}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">Escolas de Campo</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                <CloudRain className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.totalOccurrences}</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">Ocorrências</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Container */}
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* Sidebar Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Camadas e Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Province Filter */}
              <div className="space-y-2">
                <Label>Província</Label>
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as províncias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Províncias</SelectItem>
                    {provinces?.map(prov => (
                      <SelectItem key={prov.id} value={prov.id}>
                        {prov.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Map Style */}
              <div className="space-y-2">
                <Label>Estilo do Mapa</Label>
                <Select value={mapStyle} onValueChange={setMapStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satellite-streets-v12">Satélite com Ruas</SelectItem>
                    <SelectItem value="satellite-v9">Satélite</SelectItem>
                    <SelectItem value="streets-v12">Ruas</SelectItem>
                    <SelectItem value="outdoors-v12">Outdoor</SelectItem>
                    <SelectItem value="light-v11">Claro</SelectItem>
                    <SelectItem value="dark-v11">Escuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Layers */}
              <div className="space-y-2">
                <Label>Camadas Visíveis</Label>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-2">
                    {mapLayers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          activeLayers.includes(layer.id) 
                            ? 'bg-accent border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleLayer(layer.id)}
                      >
                        <Checkbox 
                          checked={activeLayers.includes(layer.id)} 
                          onCheckedChange={() => toggleLayer(layer.id)}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: layer.color }}
                        />
                        <layer.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1">{layer.label}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Legend */}
              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Legenda</Label>
                <div className="mt-2 space-y-2">
                  {activeLayers.map(layerId => {
                    const layer = mapLayers.find(l => l.id === layerId);
                    if (!layer) return null;
                    return (
                      <div key={layer.id} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: layer.color }}
                        />
                        <span>{layer.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="overflow-hidden">
            <div className="relative h-[600px]">
              {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">A carregar mapa...</p>
                  </div>
                </div>
              )}
              <div ref={mapContainer} className="absolute inset-0" />
              
              {/* Map overlay info */}
              <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="text-xs text-muted-foreground">
                  <strong>{markersRef.current.length}</strong> marcadores visíveis
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MapsPage;
