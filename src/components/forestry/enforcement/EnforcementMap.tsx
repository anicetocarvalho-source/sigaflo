import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface Infraction {
  id: string;
  infraction_number: string;
  infraction_type: string;
  severity: string;
  latitude?: number | null;
  longitude?: number | null;
  offender_name?: string | null;
  location_description?: string | null;
}

interface EnforcementMapProps {
  infractions: Infraction[];
}

const severityColors: Record<string, string> = {
  minor: '#22c55e',
  moderate: '#eab308',
  serious: '#f97316',
  very_serious: '#ef4444',
};

export function EnforcementMap({ infractions }: EnforcementMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [17.5, -12.5], // Angola center
      zoom: 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    const markers = document.querySelectorAll('.infraction-marker');
    markers.forEach(marker => marker.remove());

    // Add markers for infractions with coordinates
    infractions.forEach(infraction => {
      if (infraction.latitude && infraction.longitude) {
        const el = document.createElement('div');
        el.className = 'infraction-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = severityColors[infraction.severity] || '#ef4444';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong>${infraction.infraction_number}</strong>
            <p style="margin: 4px 0; color: #666;">${infraction.offender_name || 'N/A'}</p>
            <p style="margin: 0; font-size: 12px;">${infraction.location_description || ''}</p>
          </div>
        `);

        new mapboxgl.Marker(el)
          .setLngLat([infraction.longitude, infraction.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });
  }, [infractions, mapLoaded]);

  const geolocatedCount = infractions.filter(i => i.latitude && i.longitude).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5" />
            Mapa de Infrações
          </CardTitle>
          <Badge variant="outline">
            {geolocatedCount} de {infractions.length} geolocalizadas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div ref={mapContainer} className="h-[400px] rounded-lg overflow-hidden" />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
            <p className="text-xs font-medium mb-2">Gravidade</p>
            <div className="space-y-1">
              {[
                { key: 'minor', label: 'Leve' },
                { key: 'moderate', label: 'Moderada' },
                { key: 'serious', label: 'Grave' },
                { key: 'very_serious', label: 'Muito Grave' },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: severityColors[item.key] }}
                  />
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
