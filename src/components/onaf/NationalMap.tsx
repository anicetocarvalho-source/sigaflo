import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ProvinceStats } from '@/hooks/useONAF';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Layers,
  Wheat,
  AlertTriangle,
  TreePine,
  AlertCircle,
} from 'lucide-react';

interface NationalMapProps {
  provinces: ProvinceStats[];
}

type MapLayer = 'production' | 'climate_risk' | 'forest_pressure' | 'food_deficit';

export function NationalMap({ provinces }: NationalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(['production']);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceStats | null>(null);

  const layers: { id: MapLayer; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'production', label: 'Produção Agrícola', icon: <Wheat className="h-4 w-4" />, color: '#10b981' },
    { id: 'climate_risk', label: 'Risco Climático', icon: <AlertTriangle className="h-4 w-4" />, color: '#f59e0b' },
    { id: 'forest_pressure', label: 'Pressão Florestal', icon: <TreePine className="h-4 w-4" />, color: '#3b82f6' },
    { id: 'food_deficit', label: 'Défice Alimentar', icon: <AlertCircle className="h-4 w-4" />, color: '#ef4444' },
  ];

  const toggleLayer = (layerId: MapLayer) => {
    setActiveLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(l => l !== layerId)
        : [...prev, layerId]
    );
  };

  const getMarkerColor = (province: ProvinceStats): string => {
    if (activeLayers.includes('climate_risk') && province.riskScore > 50) {
      return '#f59e0b';
    }
    if (activeLayers.includes('food_deficit') && province.productionKg < province.farmers * 500000) {
      return '#ef4444';
    }
    if (activeLayers.includes('forest_pressure') && province.forestLicenses > 5) {
      return '#3b82f6';
    }
    if (activeLayers.includes('production')) {
      return '#10b981';
    }
    return '#6b7280';
  };

  const getMarkerSize = (province: ProvinceStats): number => {
    const base = 20;
    if (activeLayers.includes('production')) {
      return base + Math.min(province.productionKg / 100000, 30);
    }
    if (activeLayers.includes('climate_risk')) {
      return base + Math.min(province.riskScore / 2, 30);
    }
    return base + Math.min(province.farmers / 50, 30);
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initMap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !data?.token) {
          setMapError('Token do Mapbox não configurado');
          return;
        }

        mapboxgl.accessToken = data.token;

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [17.5, -12.5],
          zoom: 5,
          pitch: 30,
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({ visualizePitch: true }),
          'top-right'
        );

        map.current.on('load', () => {
          setMapLoaded(true);
        });
      } catch (err) {
        console.error('Error initializing map:', err);
        setMapError('Erro ao carregar o mapa');
      }
    };

    initMap();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || provinces.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each province
    provinces.forEach(province => {
      if (!province.latitude || !province.longitude) return;

      const color = getMarkerColor(province);
      const size = getMarkerSize(province);

      const el = document.createElement('div');
      el.className = 'province-marker';
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        transition: transform 0.2s ease;
      `;
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });
      el.addEventListener('click', () => {
        setSelectedProvince(province);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([province.longitude, province.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, provinces, activeLayers]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (mapError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Mapa Nacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{mapError}</p>
              <p className="text-sm mt-2">Configure o token MAPBOX_PUBLIC_TOKEN nas variáveis de ambiente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Mapa Nacional Interactivo
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layer Controls */}
        <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-lg">
          {layers.map(layer => (
            <div key={layer.id} className="flex items-center gap-2">
              <Checkbox
                id={layer.id}
                checked={activeLayers.includes(layer.id)}
                onCheckedChange={() => toggleLayer(layer.id)}
              />
              <Label 
                htmlFor={layer.id} 
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <span style={{ color: layer.color }}>{layer.icon}</span>
                {layer.label}
              </Label>
            </div>
          ))}
        </div>

        {/* Map Container */}
        <div className="relative">
          <div ref={mapContainer} className="h-[450px] rounded-lg overflow-hidden" />
          
          {/* Province Info Panel */}
          {selectedProvince && (
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{selectedProvince.name}</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedProvince(null)}
                >
                  ✕
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Agricultores</p>
                  <p className="font-medium">{formatNumber(selectedProvince.farmers)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Produção</p>
                  <p className="font-medium">{formatNumber(selectedProvince.productionKg / 1000)} t</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Área Cultivada</p>
                  <p className="font-medium">{formatNumber(selectedProvince.cultivatedArea)} ha</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Risco Climático</p>
                  <Badge variant={selectedProvince.riskScore > 50 ? 'destructive' : 'secondary'}>
                    {selectedProvince.riskScore}%
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Licenças Florestais</p>
                  <p className="font-medium">{selectedProvince.forestLicenses}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reflorestado</p>
                  <p className="font-medium">{formatNumber(selectedProvince.reforestedArea)} ha</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {layers.filter(l => activeLayers.includes(l.id)).map(layer => (
            <div key={layer.id} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: layer.color }}
              />
              <span>{layer.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
