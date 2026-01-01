import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Map as MapIcon, RefreshCw } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface Occurrence {
  id: string;
  title: string;
  occurrence_type: string;
  severity: string;
  latitude: number | null;
  longitude: number | null;
  report_date: string;
  provinces?: { name: string } | null;
}

interface OccurrencesMapViewProps {
  occurrences: Occurrence[];
  title: string;
  description: string;
  typeConfig: Record<string, { label: string; color: string }>;
}

const ANGOLA_CENTER: [number, number] = [17.8739, -11.2027];
const ANGOLA_ZOOM = 5;

const severityColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export function OccurrencesMapView({ occurrences, title, description, typeConfig }: OccurrencesMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
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

  // Add markers
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const occurrencesWithCoords = occurrences.filter(o => o.latitude && o.longitude);

    occurrencesWithCoords.forEach(occ => {
      const color = severityColors[occ.severity] || '#888888';
      const typeLabel = typeConfig[occ.occurrence_type]?.label || occ.occurrence_type;

      const el = document.createElement('div');
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 4px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      `;
      el.innerHTML = '⚠';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([occ.longitude!, occ.latitude!])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(`
            <div style="padding: 8px;">
              <strong style="font-size: 14px;">${occ.title}</strong><br/>
              <span style="color: ${color}; font-size: 12px; font-weight: 500;">${typeLabel}</span><br/>
              <span style="color: #666; font-size: 11px;">Severidade: ${occ.severity}</span><br/>
              <span style="color: #888; font-size: 11px;">${occ.provinces?.name || 'N/A'}</span><br/>
              <span style="color: #aaa; font-size: 10px;">${new Date(occ.report_date).toLocaleDateString('pt-AO')}</span>
            </div>
          `)
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds if there are occurrences
    if (occurrencesWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      occurrencesWithCoords.forEach(occ => {
        bounds.extend([occ.longitude!, occ.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 10 });
    }
  }, [occurrences, isMapLoaded, typeConfig]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!mapboxToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">Token Mapbox não configurado</p>
              <p className="text-sm text-muted-foreground">
                Configure o token nas definições do sistema para visualizar o mapa
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const occurrencesWithCoords = occurrences.filter(o => o.latitude && o.longitude);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="text-sm text-muted-foreground">
          {occurrencesWithCoords.length} ocorrências no mapa
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[500px] rounded-lg overflow-hidden">
          {!isMapLoaded && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>A carregar mapa...</span>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="absolute inset-0" />
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <span className="text-sm font-medium">Severidade:</span>
          {Object.entries(severityColors).map(([severity, color]) => (
            <div key={severity} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: color }}
              />
              <span className="text-sm capitalize">{severity}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
