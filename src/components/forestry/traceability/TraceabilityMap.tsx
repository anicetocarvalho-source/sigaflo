import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Truck, TreePine, Logs } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ForestTree, ForestLog, ForestTransportPermit } from '@/hooks/useForestry';

interface TraceabilityMapProps {
  trees: ForestTree[];
  logs: ForestLog[];
  transports: ForestTransportPermit[];
}

export function TraceabilityMap({ trees, logs, transports }: TraceabilityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

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

  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add tree markers
    trees.forEach(tree => {
      if (tree.latitude && tree.longitude) {
        const marker = new mapboxgl.Marker({ color: '#16a34a' })
          .setLngLat([tree.longitude, tree.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="min-width: 150px;">
                <strong>🌲 ${tree.tree_code}</strong>
                <br/><small>${tree.species}</small>
                <hr style="margin: 4px 0;"/>
                <p><strong>Estado:</strong> ${tree.status}</p>
                <p><strong>Volume:</strong> ${tree.estimated_volume_m3 || '-'} m³</p>
              </div>
            `)
          )
          .addTo(map.current!);
        markersRef.current.push(marker);
      }
    });

    // Add active transports
    const activeTransports = transports.filter(t => t.status === 'in_transit' || t.status === 'active');
    activeTransports.forEach(transport => {
      // Origin marker
      if (transport.origin_latitude && transport.origin_longitude) {
        const marker = new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([transport.origin_longitude, transport.origin_latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="min-width: 150px;">
                <strong>🚛 ${transport.permit_number}</strong>
                <br/><small>Origem: ${transport.origin_location}</small>
                <hr style="margin: 4px 0;"/>
                <p><strong>Destino:</strong> ${transport.destination_location}</p>
                <p><strong>Volume:</strong> ${transport.total_volume_m3?.toFixed(2)} m³</p>
              </div>
            `)
          )
          .addTo(map.current!);
        markersRef.current.push(marker);
      }

      // Destination marker
      if (transport.destination_latitude && transport.destination_longitude) {
        const marker = new mapboxgl.Marker({ color: '#8b5cf6' })
          .setLngLat([transport.destination_longitude, transport.destination_latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div>
                <strong>📍 Destino</strong>
                <br/><small>${transport.destination_location}</small>
              </div>
            `)
          )
          .addTo(map.current!);
        markersRef.current.push(marker);
      }
    });

  }, [trees, logs, transports, mapboxToken]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa de Rastreamento
        </CardTitle>
        <CardDescription>
          Visualização em tempo real de árvores, toras e transportes
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
        
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <span className="text-sm font-medium text-muted-foreground">Legenda:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-sm">Árvores</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm">Origem Transporte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm">Destino</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
